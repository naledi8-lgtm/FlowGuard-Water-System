import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { View, ActivityIndicator, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { auth } from './src/services/firebase';
import HomeScreen from './src/screens/HomeScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

// A 3-tab scaffold covering the highest-signal screens (Home, Alerts,
// Report). Water Map, Billing, Suppliers and Profile follow the exact same
// pattern - see README.md > "Extending this scaffold" for how to add them.
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.harbor900 },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.current700,
        tabBarInactiveTintColor: colors.ash,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Report" component={ReportIssueScreen} options={{ title: 'Report an Issue' }} />
    </Tab.Navigator>
  );
}

// Minimal sign-in screen. Swap for the full email/password + registration
// flow when you build out Profile - anonymous auth is enough to let
// Firestore rules tell "a real device" from "an unauthenticated request"
// while residents try the app before creating an account.
function LoginScreen() {
  const [loading, setLoading] = useState(false);
  return (
    <View style={styles.loginContainer}>
      <Text style={styles.logo}>FlowGuard</Text>
      <Text style={styles.tagline}>Water updates for every household, standpipe and business.</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={async () => {
          setLoading(true);
          try {
            await signInAnonymously(auth);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : 'Continue'}</Text>
      </Pressable>
      <Text style={styles.helper}>No internet? Dial the FlowGuard USSD code from any phone to get alerts without data.</Text>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setCheckingAuth(false); }), []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.cloud }}>
        <ActivityIndicator size="large" color={colors.current700} />
      </View>
    );
  }

  return <NavigationContainer>{user ? <MainTabs /> : <LoginScreen />}</NavigationContainer>;
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: colors.harbor900, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 32, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 6 },
  tagline: { color: colors.sky300, textAlign: 'center', marginBottom: 32, fontSize: 14 },
  primaryButton: { backgroundColor: colors.rain, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: colors.harbor900, fontWeight: '700', fontSize: 15 },
  helper: { color: colors.sky300, textAlign: 'center', marginTop: 40, fontSize: 12, opacity: 0.8 },
});
