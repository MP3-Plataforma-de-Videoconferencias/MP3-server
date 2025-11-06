import { db } from "../config/firebase";
import admin from "firebase-admin";
import { User } from "../models/User";

const usersCollection = db.collection("users");

export const userDao = {
  
  // Create
  async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const docRef = await usersCollection.add({
      ...userData,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
    const snap = await docRef.get();
    return { id: snap.id, ...(snap.data() as User) };
  },

  // Search by user
  async getById(id: string): Promise<User | null> {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as User) };
  },

  // Get all users
  async getAll(): Promise<User[]> {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as User) }));
  },

  // Update
  async update(id: string, data: Partial<User>): Promise<void> {
    await usersCollection.doc(id).update({
      ...data,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  },

  // delete
  async delete(id: string): Promise<void> {
    await usersCollection.doc(id).delete();
  },
};
