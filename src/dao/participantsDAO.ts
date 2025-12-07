import { db } from '../config/firebase';

export interface Participant {
  meetingId: string;
  userId: string;
  name?: string;
  email?: string;
}

// Agregar participante a Firestore en una colección plana
export const addParticipant = async (participant: Participant) => {
  try {
    console.log('Guardando participante en Firebase:', participant);

    const docRef = db
      .collection('participants')      // <-- colección plana
      .doc(`${participant.meetingId}_${participant.userId}`); // ID único por reunión + usuario

    await docRef.set(participant, { merge: true });

    console.log('Participante guardado con éxito.');
  } catch (err) {
    console.error('Error guardando participante:', err);
    throw err;
  }
};

// Obtener participantes de una reunión
export const getMeetingParticipants = async (meetingId: string) => {
  const snapshot = await db
    .collection('participants')
    .where('meetingId', '==', meetingId)  // filtrar por reunión
    .get();

  return snapshot.docs.map(doc => doc.data() as Participant);
};
