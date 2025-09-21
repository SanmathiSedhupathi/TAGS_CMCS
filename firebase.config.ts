import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence  } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCEfZ_qu6M_W2kWbN8jmbE8DTp2Rs7CmrU",
  authDomain: "tags-8573a.firebaseapp.com",
  projectId: "tags-8573a",
  storageBucket: "tags-8573a.appspot.com",
  messagingSenderId: "405576015881",
  appId: "1:405576015881:web:da41f2b6d3e8d628ced8d8",
  measurementId: "G-F7KKLGD17P"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
