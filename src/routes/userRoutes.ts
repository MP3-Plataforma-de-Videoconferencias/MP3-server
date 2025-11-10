import express from 'express';
import { UserController } from '../controllers/userController';

const router = express.Router();
const userController = new UserController();

router.post('/', (req, res) => userController.createUser(req, res));
router.get('/:id', (req, res) => userController.getUser(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));
router.get('/', (req, res) => userController.listUsers(req, res));

export default router;
