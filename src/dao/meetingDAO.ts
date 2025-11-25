import { db } from "../config/firebase";
import { InformationMeetings } from "../models/InformationMeetings";

/**
 * Data Access Object (DAO) for Firestore "meetings" collection.
 *
 * This class centralizes all database operations related to meetings:
 * - Create a meeting
 * - Get meeting by ID
 * - Update meeting data
 * - Delete meeting
 * - Get all meetings
 * - Get meetings created by a specific user
 *
 * All methods return Promises and are designed for use in async workflows.
 */
export class MeetingDao {

  /** Reference to the Firestore "meetings" collection */
  private collection = db.collection('meetings');

  /**
   * Creates a new meeting document in Firestore.
   *
   * @param meeting - The meeting data object to store
   * @returns The ID of the created document
   *
   * @remarks
   * - Uses `meeting.idMeeting` as the Firestore document ID.
   * - Automatically sets `createdAt`.
   * - Ensures `finishedAt` is always present (null if not provided).
   */
  async create(meeting: InformationMeetings): Promise<string> {
    meeting.createdAt = new Date();
    meeting.finishedAt = meeting.finishedAt || null;

    const docRef = this.collection.doc(meeting.idMeeting);
    await docRef.set(meeting);

    return docRef.id;
  }

  /**
   * Retrieves a meeting by its ID.
   *
   * @param id - Firestore document ID
   * @returns The meeting object if found, otherwise `null`
   */
  async getById(id: string): Promise<InformationMeetings | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...(doc.data() as InformationMeetings) };
  }

  /**
   * Updates a meeting document.
   *
   * @param id - Firestore document ID
   * @param data - Partial data to update
   * @returns `true` if successful, otherwise `false`
   *
   * @remarks
   * - Performs a partial update (`update`) instead of replacing the document.
   * - Logs debug information for easier debugging.
   */
  async update(id: string, data: Partial<InformationMeetings>): Promise<boolean> {
    try {
      console.log("Actualizando documento:", id, "con data:", data);

      await this.collection.doc(id).update(data);

      console.log("Actualización exitosa");
      return true;

    } catch (error) {
      console.error("Error en MeetingDao.update:", error);
      return false;
    }
  }

  /**
   * Deletes a meeting by ID.
   *
   * @param id - Firestore document ID
   * @returns `true` if deletion succeeded, otherwise `false`
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves **all meetings** in the database.
   *
   * @returns Array of meeting objects
   */
  async getAll(): Promise<InformationMeetings[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as InformationMeetings)
    }));
  }

  /**
   * Retrieves all meetings created by a specific user.
   *
   * @param userId - ID of the creator (field: `createdBy`)
   * @returns Array of meetings created by the user
   *
   * @remarks
   * - Uses Firestore query with `where("createdBy", "==", userId)`
   */
  async getByCreator(userId: string): Promise<InformationMeetings[]> {
    const snapshot = await this.collection.where("createdBy", "==", userId).get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as InformationMeetings)
    }));
  }
}

/**
 * Default instance of MeetingDao for convenience imports.
 */
export default new MeetingDao();

