import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyCEfZ_qu6M_W2kWbN8jmbE8DTp2Rs7CmrU",
  authDomain: "tags-8573a.firebaseapp.com",
  projectId: "tags-8573a",
  storageBucket: "tags-8573a.appspot.com",
  messagingSenderId: "405576015881",
  appId: "1:405576015881:web:da41f2b6d3e8d628ced8d8",
  measurementId: "G-F7KKLGD17P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;