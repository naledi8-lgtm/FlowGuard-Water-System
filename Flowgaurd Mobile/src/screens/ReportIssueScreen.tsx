import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, Image, StyleSheet, Alert as RNAlert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../services/firebase';
import { colors } from '../theme';

const CATEGORIES = [
  { key: 'leak', label: 'Leak' },
  { key: 'burst_pipe', label: 'Burst pipe' },
  { key: 'no_water', label: 'No water' },
  { key: 'contamination', label: 'Contamination' },
  { key: 'other', label: 'Other' },
] as const;

export default function ReportIssueScreen() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>('leak');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [manualArea, setManualArea] = useState('');
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(status === 'granted');
  };

  const submit = async () => {
    if (!description.trim()) {
      RNAlert.alert('Tell us a bit more', 'Add a short description so we know what to fix.');
      return;
    }
    setSubmitting(true);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      // Location is offered, never required - declining just falls back to
      // the manual area field. Reuse this exact pattern anywhere else the
      // app wants a device permission.
      if (hasLocationPermission) {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      let photoUrl: string | undefined;
      if (photoUri) {
        const blob = await (await fetch(photoUri)).blob();
        const fileRef = ref(storage, `reports/${Date.now()}.jpg`);
        await uploadBytes(fileRef, blob);
        photoUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, 'issueReports'), {
        reporterId: isAnonymous ? null : auth.currentUser?.uid ?? null,
        isAnonymous,
        category,
        description,
        photoUrl: photoUrl ?? null,
        lat,
        lng,
        manualArea: hasLocationPermission ? null : manualArea,
        channel: 'app',
        status: 'submitted',
        confirmCount: 0,
        createdAt: serverTimestamp(),
      });
      RNAlert.alert('Thanks for reporting this 🙌', "We've logged it and the team's on it.");
      setDescription('');
      setPhotoUri(null);
      setManualArea('');
    } catch (e) {
      RNAlert.alert('Something went wrong', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>What's going on?</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Pressable key={c.key} onPress={() => setCategory(c.key)} style={[styles.chip, category === c.key && styles.chipActive]}>
            <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Describe it</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="e.g. Pipe burst outside 12 Church Street, water's been running for 2 hours"
        value={description}
        onChangeText={setDescription}
      />

      <Pressable style={styles.photoButton} onPress={pickPhoto}>
        <Text style={styles.photoButtonText}>{photoUri ? 'Change photo' : '+ Add a photo'}</Text>
      </Pressable>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} />}

      <Text style={styles.label}>Location</Text>
      {hasLocationPermission ? (
        <Text style={styles.helperText}>📍 Using your current location</Text>
      ) : (
        <View>
          <Text style={styles.helperText}>We don't have location access - that's fine, just tell us the area.</Text>
          <TextInput style={styles.input} placeholder="Area / suburb / landmark" value={manualArea} onChangeText={setManualArea} />
          <Pressable onPress={requestLocation}>
            <Text style={styles.linkText}>Or turn on location instead</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.anonRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Report anonymously</Text>
          <Text style={styles.helperText}>No name attached — still lands with the right team.</Text>
        </View>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ true: colors.current700, false: undefined }} />
      </View>

      <Pressable style={styles.submitButton} onPress={submit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Sending…' : 'Submit report'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cloud },
  label: { fontWeight: '600', color: colors.ink, marginTop: 16, marginBottom: 8, fontSize: 15 },
  helperText: { color: colors.ash, fontSize: 12, marginTop: 2, marginBottom: 8 },
  linkText: { color: colors.current700, fontWeight: '600', fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.divider },
  chipActive: { backgroundColor: colors.current700, borderColor: colors.current700 },
  chipText: { color: colors.slate, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.divider, textAlignVertical: 'top', minHeight: 44, color: colors.ink, marginBottom: 8 },
  photoButton: { marginTop: 12, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: colors.foam100 },
  photoButtonText: { color: colors.current700, fontWeight: '600' },
  photoPreview: { width: '100%', height: 160, borderRadius: 10, marginTop: 10 },
  anonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: colors.white, padding: 12, borderRadius: 10 },
  submitButton: { backgroundColor: colors.current700, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
