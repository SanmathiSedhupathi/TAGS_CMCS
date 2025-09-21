import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Activity } from '../types';

export class ActivityService {
  static async createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'participants'>): Promise<string> {
    const activityData = {
      ...activity,
      createdAt: new Date(),
      participants: []
    };
    
    const docRef = await addDoc(collection(db, 'activities'), activityData);
    return docRef.id;
  }

  static async getActivities(): Promise<Activity[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'activities'), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];
  }

  static async getUserActivities(userId: string): Promise<Activity[]> {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'activities'), 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];
  }

  // Join activity
  static async joinActivity(activityId: string, userId: string): Promise<void> {
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      participants: arrayUnion(userId)
    });
  }

  // Leave activity
  static async leaveActivity(activityId: string, userId: string): Promise<void> {
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      participants: arrayRemove(userId)
    });
  }
}
