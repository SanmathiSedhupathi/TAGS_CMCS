export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  rating: number;
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  joinType: string;
  date: string;
  time: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  createdBy: string;
  createdAt: Date;
  participants: string[];
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}