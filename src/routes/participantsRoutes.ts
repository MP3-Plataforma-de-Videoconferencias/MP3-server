import { Router } from 'express';
import { joinMeeting, finishMeeting, getParticipants } from '../controllers/participantsController';


const router = Router();

// Registrar participante cuando entra
router.post('/join', joinMeeting);

// Marcar reunión como finalizada
router.post('/finish/:meetingId', finishMeeting);

// Traer participantes de una reunión
router.get('/:meetingId',  getParticipants);

export default router;
