import express from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();
const userController = new UserController();

//CRUD users routes
router.post('/', (req, res) => userController.createUser(req, res));
router.get('/:id', (req, res) => userController.getUser(req, res));
//router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));
router.get('/', (req, res) => userController.listUsers(req, res));


router.post("/login", (req, res) => userController.login(req, res));
router.post("/register", (req, res) => userController.register(req, res))
router.put("/me", authenticateJWT, (req, res) => userController.updateUser(req, res));
router.delete("/me", authenticateJWT, (req, res) => userController.deleteUser(req,res));
router.put("/me/password", authenticateJWT, (req, res) => userController.changePassword(req, res))

export default router;
