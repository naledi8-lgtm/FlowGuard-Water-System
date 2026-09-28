import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: paste your own config from Firebase Console > Project Settings > Your apps.
// This object is meant to be public (it ends up in the compiled app either way) -
// it is NOT a secret. Real secrets (SMS gateway keys, payment gateway keys) belong
// in the Python/C# services, never here. See README.md > "Where secrets live".
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth + AsyncStorage persistence matters specifically on React
// Native - plain getAuth() forgets the signed-in user every app restart.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
