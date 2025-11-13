import { db } from "../config/firebase";
import { User } from "../models/User";
export class UserDao {
  private collection = db.collection('users');

  // Create user
  async create(user: User): Promise<string> {
    user.createdAt = new Date();
    user.updatedAt = new Date();
    const docRef = await this.collection.add(user);
    return docRef.id; // retorna el id generado
  }

  // Id user
  async getById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as User) };
  }

  // Update user by id
  async update(id: string, user: Partial<User>): Promise<boolean> {
    user.updatedAt = new Date();
    try {
      await this.collection.doc(id).update(user);
      return true;
    } catch {
      return false;
    }
  }

  // delete user by id
  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

  // all users
  async getAll(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as User) }));
  }

  // User by email
  async userByEmail(searchEmail: string): Promise<User | null> {
  try {
    const normalizedEmail = searchEmail.trim().toLowerCase();
    const querySnapshot = await this.collection.where('email', '==', normalizedEmail).limit(1).get();
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...(doc.data() as User) };
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
}

}

export default new UserDao();