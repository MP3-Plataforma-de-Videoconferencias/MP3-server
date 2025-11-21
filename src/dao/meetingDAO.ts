import { db } from "../config/firebase";
import { InformationMeetings } from "../models/InformationMeetings";

export class MeetingDao {
  private collection = db.collection('meetings');

  async create(meeting: InformationMeetings): Promise<string> {
    meeting.createdAt = new Date();
    meeting.finishedAt = meeting.finishedAt || null;

    const docRef = this.collection.doc(meeting.idMeeting); 
    await docRef.set(meeting);

    return docRef.id;
  }


  async getById(id: string): Promise<InformationMeetings | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...(doc.data() as InformationMeetings) };
  }

  async update(id: string, data: Partial<InformationMeetings>): Promise<boolean> {
    try {
      await this.collection.doc(id).update(data);
      return true;
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch {
      return false;
    }
  }

 
  async getAll(): Promise<InformationMeetings[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as InformationMeetings)
    }));
  }


  async getByCreator(userId: string): Promise<InformationMeetings[]> {
    const snapshot = await this.collection.where("createdBy", "==", userId).get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as InformationMeetings)
    }));
  }
}

export default new MeetingDao();
