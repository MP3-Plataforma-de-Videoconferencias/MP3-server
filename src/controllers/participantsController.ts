import { Request, Response } from 'express';
import { addParticipant, getMeetingParticipants, Participant } from '../dao/participantsDAO';
import { sendMeetingSummaryEmail } from '../utils/emailServiceParticipants';

// Registrar participante
export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId, userId, name, email } = req.body as Participant;

    if (!meetingId || !userId) {
      return res.status(400).json({ message: 'Missing meetingId or userId' });
    }

    await addParticipant({ meetingId, userId, name, email });
    return res.status(200).json({ message: 'Participant registered' });
  } catch (err) {
    console.error('[joinMeeting] Error:', err);
    return res.status(500).json({ message: 'Error registering participant' });
  }
};

// Finalizar reunión y enviar correos
// Finalizar reunión y enviar correo solo a quien finalizó
export const finishMeeting = async (req: Request, res: Response) => { 
  try {
    const { meetingId } = req.params;
    const requesterEmail = req.body?.email;

    if (!meetingId) {
      return res.status(400).json({ message: 'Missing meetingId' });
    }
    if (!requesterEmail) {
      return res.status(400).json({ message: 'Missing requester email' });
    }

    const participants = await getMeetingParticipants(meetingId);

    const validParticipants = participants
      .filter(p => p.email && p.name)
      .map(p => ({ name: p.name!, email: p.email! }));

    await sendMeetingSummaryEmail(requesterEmail, meetingId, validParticipants);

    return res.status(200).json({ message: 'Meeting finished and email sent.' });
  } catch (err) {
    console.error('[finishMeeting] Error:', err);
    return res.status(500).json({ message: 'Error finishing the meeting.' });
  }
};



// Obtener participantes de una reunión
export const getParticipants = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;

    if (!meetingId) {
      return res.status(400).json({ message: 'Missing meetingId' });
    }

    const participants = await getMeetingParticipants(meetingId);

    return res.status(200).json(participants);
  } catch (err) {
    console.error('[getParticipants] Error:', err);
    return res.status(500).json({ message: 'Error fetching participants' });
  }
};
