import { db } from "../config/firebase";
import { User } from "../models/User";
export class UserDao {
  private collection = db.collection('users');

  // Crea un nuevo usuario
  async create(user: User): Promise<string> {
    user.createdAt = new Date();
    user.updatedAt = new Date();
    const docRef = await this.collection.add(user);
    return docRef.id; // retorna el id generado
  }

  // Obtiene un usuario por id
  async getById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as User) };
  }

  // Actualiza un usuario por id
  async update(id: string, user: Partial<User>): Promise<boolean> {
    user.updatedAt = new Date();
    try {
      await this.collection.doc(id).update(user);
      return true;
    } catch {
      return false;
    }
  }

  // Borra un usuario por id
  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

  // Obtiene todos los usuarios
  async getAll(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as User) }));
  }
}

export default new UserDao();