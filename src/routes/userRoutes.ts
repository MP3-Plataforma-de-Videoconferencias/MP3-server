import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authenticateFirebase } from '../middlewares/authGoogleMiddleware';

const router = express.Router();
const userController = new UserController();

//CRUD users routes
/**
 * Creates a new user.
 * 
 * @route POST /users/
 * @param {Request} req - Request body must contain user data.
 * @param {Response} res
 * @returns {void}
 */
router.post('/', (req, res) => userController.createUser(req, res));

/**
 * Retrieves a single user by ID.
 *
 * @route GET /users/:id
 * @param {Request} req - Route params must include user ID.
 * @param {Response} res
 * @returns {void}
 */
router.get('/:id', (req, res) => userController.getUser(req, res));

/**
 * Deletes a user by ID.
 *
 * @route DELETE /users/:id
 * @param {Request} req - Route params must include user ID.
 * @param {Response} res
 * @returns {void}
 */
router.delete('/:id', (req, res) => userController.delete(req, res));

/**
 * Lists all registered users.
 *
 * @route GET /users/
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 */
router.get('/', (req, res) => userController.listUsers(req, res));

/**
 * Logs a user in using email + password authentication.
 *
 * @route POST /users/login
 * @param {Request} req - Body must include { email, password }.
 * @param {Response} res
 * @returns {void}
 */
router.post("/login", (req, res) => userController.login(req, res));

/**
 * @route POST /loginGoogle
 * @summary Logs in a user via Google authentication.
 * @description Uses Firebase middleware to validate Google token, then returns JWT token or incomplete profile info.
 * @param {express.Request} req - Express request containing Google user data (via middleware).
 * @param {express.Response} res - Express response returning JWT token or profile status.
 * @middleware authenticateFirebase - Validates Google Firebase token before allowing access.
 */
router.post("/loginGoogle", authenticateFirebase, (req, res) => userController.loginGoogle(req, res));

/**
 * @route POST /register
 * @summary Registers a new user manually.
 * @description Validates fields, hashes the password, and saves a new user.
 * @param {express.Request} req - Express request containing { firstName, lastName, age, email, password }.
 * @param {express.Response} res - Express response returning creation message and user ID.
 */
router.post("/register", (req, res) => userController.register(req, res));

/**
 * @route POST /registerGoogle
 * @summary Registers a new user via Google authentication.
 * @description Handles additional user data input after Firebase validation and creates a new user.
 * @param {express.Request} req - Express request with user data in body (e.g., firstName, lastName, age, email, password).
 * @param {express.Response} res - Express response returning status and user ID.
 * @middleware authenticateFirebase - Ensures Google authentication is valid.
 */
router.post("/registerGoogle", authenticateFirebase, (req, res) => userController.registerGoogle(req, res));

/**
 * @route PUT /me
 * @summary Updates the logged-in user's profile.
 * @description Updates only allowed fields (email, firstName, lastName, age) for the current authenticated user.
 * @param {express.Request} req - Express request containing token in headers and updated data in body.
 * @param {express.Response} res - Express response confirming update or returning error.
 * @middleware authenticateJWT - Ensures the user is authenticated before updating.
 */
router.put("/me", authenticateJWT, (req, res) => userController.updateUser(req, res));

/**
 * @route DELETE /me
 * @summary Deletes the authenticated user's account.
 * @description Permanently removes the account associated with the given JWT token.
 * @param {express.Request} req - Express request with user token identifying account to delete.
 * @param {express.Response} res - Express response confirming deletion or returning error.
 * @middleware authenticateJWT - Ensures the user is authenticated before deleting.
 */
router.delete("/me", authenticateJWT, (req, res) => userController.deleteUser(req,res));

/**
 * @route PUT /me/password
 * @summary Changes the authenticated user's password.
 * @description Validates and hashes the new password, updating it in the database.
 * @param {express.Request} req - Express request containing newPassword and confirmPassword in body.
 * @param {express.Response} res - Express response confirming update or returning error.
 * @middleware authenticateJWT - Ensures the user is authenticated before changing the password.
 */
router.put("/me/password", authenticateJWT, (req, res) => userController.changePassword(req, res))

export default router;
