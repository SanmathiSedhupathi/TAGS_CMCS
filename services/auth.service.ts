import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { User } from '../types';

export class AuthService {
  static async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  static async signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    const userProfile: Omit<User, 'id'> = {
      email,
      displayName,
      rating: 0,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userProfile);
    return result.user;
  }

  static async signInWithGoogle(): Promise<FirebaseUser> {
    // This would require additional setup for Google Sign-In
    // For now, we'll implement email/password only
    throw new Error('Google Sign-In not implemented yet');
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static async getUserProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: uid, ...docSnap.data() } as User;
    }
    return null;
  }
}