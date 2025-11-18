import { Request, Response } from 'express';
import userDAO, { UserDao } from '../dao/userDAO';
import { User } from '../models/User';

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { error } from 'console';
import { sendchangedEmail } from '../utils/emailService';

/**
 * Validates password format using regex.
 * Requires: 8+ chars, lowercase, uppercase, number, special char.
 * @param {string} password
 * @returns {boolean} True if password meets criteria
 */
function validatePassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

export class UserController {
  private userDao: UserDao;

  
  /**
   * Initializes UserController with a UserDao instance.
   */
  constructor() {
    this.userDao = new UserDao();
  }

    /**
   * Creates a new user with:
   * - first name
   * - last name
   * - age
   * - email
   * - password
   * Validates email duplication and hashes the password.
   * @param {Request} req 
   * @param {Response} res 
   * @returns {Promise<void>}
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: User = req.body;
      //Check if email already exists
      const existingUsers = await this.userDao.getAll();
      const emailExist = existingUsers.some((u:any) => u.email === userData.email);
      if (emailExist){
        res.status(400).json({ error: 'The email is already registered' });
        return;
      }
      //Hash password
      const salt = bcrypt.genSaltSync(10);
      userData.password = bcrypt.hashSync(userData.password, salt);
      const id = await this.userDao.create(userData);
      res.status(201).json({ id });
    } catch (error) {
      res.status(500).json({ error: 'User creating error' });
    }
  }

   /**
   * Retrieves a user by ID.
   * @param {Request} req 
   * @param {Response} res 
   */
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = await this.userDao.getById(id);
      if (!user) {
        res.status(404).json({ error: 'Not found user' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving user' });
    }
  }

    /**
   * Updates a user by ID.
   * @param {Request} req 
   * @param {Response} res 
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const updateData: Partial<User> = req.body;
      const success = await this.userDao.update(id, updateData);
      if (!success) {
        res.status(404).json({ error: 'Not found user' });
        return;
      }
      res.json({ message: 'Updated user' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  }

    /**
   * Deletes a user by ID.
   * @param {Request} req 
   * @param {Response} res 
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const success = await this.userDao.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Not found user' });
        return;
      }
      res.json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

    /**
   * Returns all users.
   * @param {Request} req 
   * @param {Response} res 
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userDao.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error listing users' });
    }
  }

    /**
   * Registers a new user.
   * Validates fields, email duplication and hashes the password.
   * @param {Request} req 
   * @param {Response} res 
   */
    async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, age, email, password } = req.body;

      if (!firstName || !lastName || !age || !email || !password) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      if(!validatePassword(password)){
        res.status(400).json({ error: "Invalid password" });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existingUser = await this.userDao.userByEmail(normalizedEmail);
      if (existingUser) {
        res.status(400).json({ error: "The email is already registered" });
        return;
      }

      // hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Build a new user
      const newUser: User = {
        firstName,
        lastName,
        age,
        email: normalizedEmail,
        password: hashedPassword,
      };

      // Create user 
      const id = await this.userDao.create(newUser);

      res.status(201).json({ message: "User created", id });
    } catch (error) {
      console.error("registration error:", error);
      res.status(500).json({ error: "user registration error" });
    }
  }

  /**
 * Registers a new user using data received during Google-based registration.
 *
 * This method handles manual completion of user data after Google authentication.
 * It verifies the password, checks for duplicate emails, hashes the password,
 * creates the user, and returns a JWT token.
 *
 * @param {Request} req - Express request containing user data in the body.
 * @param {Response} res - Express response used to return the result.
 * @returns {Promise<void>}
 *
 * @description
 * - Validates password strength.
 * - Normalizes email for consistency.
 * - Verifies that the email is not already registered.
 * - Hashes the password using bcrypt.
 * - Builds a `User` object and creates it through the DAO.
 * - Retrieves the created user to verify its existence.
 * - Generates a JWT token for the newly registered user.
 * - Handles errors and sends proper HTTP responses.
 */
  async registerGoogle(req: Request, res: Response): Promise<void> {
    try {
      console.log("=== DEBUG registerGoogle ===");
      console.log("Body recibido:", req.body);
      console.log("User de Firebase:", (req as any).user);
      
      // Get Firebase user data from middleware
      const firebaseUser = (req as any).user;
      
      // Get additional data from body
      const { age } = req.body;

      // Validate required fields
      if (!age) {
        res.status(400).json({ error: "La edad es requerida" });
        return;
      }

      if (!firebaseUser || !firebaseUser.email) {
        res.status(400).json({ error: "Datos de Firebase inválidos" });
        return;
      }

      const normalizedEmail = firebaseUser.email.trim().toLowerCase();

      // Check if email already exists
      const existingUser = await this.userDao.userByEmail(normalizedEmail);
      if (existingUser) {
        res.status(400).json({ error: "El email ya está registrado" });
        return;
      }

      // Extract name from Firebase (handle cases where name might be empty)
      const fullName = firebaseUser.name || firebaseUser.email.split("@")[0];
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "Usuario";
      const lastName = nameParts.slice(1).join(" ") || "Google";

      // Generate a random password (won't be used for Google login)
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(randomPassword, salt);

      // Build new user
      const newUser: User = {
        firstName,
        lastName,
        age: parseInt(age),
        email: normalizedEmail,
        password: hashedPassword,
      };

      // Create user
      const id = await this.userDao.create(newUser);

      // Get created user
      const user = await this.userDao.getById(id);
      if (!user) {
        res.status(500).json({ error: "Error al crear usuario" });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET as string;
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
      );

      res.status(201).json({ 
        message: "Usuario creado exitosamente", 
        id,
        token 
      });
    } catch (error) {
      console.error("=== ERROR en registerGoogle ===");
      console.error("Error completo:", error);
      console.error("Stack:", (error as Error).stack);
      res.status(500).json({
        error: "Error en registro de usuario", 
        details: (error as Error).message
      });
    }
  }

    /**
   * Login user and returns JWT token.
   * @param {Request} req 
   * @param {Response} res 
   */
  async login(req: Request, res: Response): Promise<void> {
    try { 
      const { email, password } = req.body;

      if(!email || !password){
        res.status(400).json({ error: "Email and password are required"});
        return;
      }

      //Verify email user 
      const user = await this.userDao.userByEmail(email);
      if(!user){
        res.status(401).json({message: "Invalid credentials"});
        return;
      }

      //Compare password with stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(user.password)
      if(!passwordMatch){
        res.status(401).json({message: "Invalid credentials"});
        return;
      }

      //Generate token
      const jwtSecret = process.env.JWT_SECRET as string;
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
      
      res.status(200).json({message: 'Login successful', token});
    } catch (error) {
      console.log('login error:', error);
      res.status(500).json({ error: 'login error'});
    }
  }

  /**
 * Handles user login using Google authentication.
 * 
 * @param {Request} req - Express request with Firebase user data
 * @param {Response} res - Express response
 * @returns {Promise<void>}
 */
async loginGoogle(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUser = (req as any).user;

    if (!firebaseUser || !firebaseUser.email) {
      res.status(400).json({ error: "Datos de Firebase inválidos" });
      return;
    }

    const normalizedEmail = firebaseUser.email.trim().toLowerCase();

    // Check if user exists
    const user = await this.userDao.userByEmail(normalizedEmail);
    
    if (!user) {
      // User doesn't exist - need to complete registration
      res.status(200).json({
        status: "incomplete_profile",
        message: "Usuario no registrado. Complete el registro.",
        email: firebaseUser.email,
        name: firebaseUser.name,
        uid: firebaseUser.uid
      });
      return;
    }

    // User exists - generate JWT token
    const jwtSecret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Error en loginGoogle:", error);
    res.status(500).json({ error: "Error en login con Google" });
  }
}

    /**
   * Updates logged-in user's data.
   * Only allows: email, firstName, lastName, age.
   * @param {Request} req 
   * @param {Response} res 
   */
   async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // Verify user login
      const loggedUser = (req as any).user;
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const userId = loggedUser.userId;

      // Update data
      const updateData = req.body;

      const allowedFields: (keyof Pick<User, "email" | "firstName" | "lastName" | "age">)[] = [
        "email",
        "firstName",
        "lastName",
        "age",
      ];

      const filteredData: Partial<Pick<User, "email" | "firstName" | "lastName" | "age">> = {};

      for (const field of allowedFields) {
        if (field in updateData) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        res.status(400).json({ error: "There are no valid fields to update" });
        return;
      }

      // Normalizar email
      if (filteredData.email) {
        filteredData.email = filteredData.email.trim().toLowerCase();
      }

      // Actualizar usuario en DAO
      const updated = await this.userDao.update(userId, filteredData);

      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ message: "user successfully updated" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Error updating user" });
    }
  }

    /**
   * Allows logged-in user to change password.
   * @param {Request} req 
   * @param {Response} res 
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = (req as any).user;
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const userId = loggedUser.userId;

      const { newPassword, confirmPassword } = req.body;

      if (!newPassword || !confirmPassword) {
        res.status(400).json({ error: "Both passwords are required" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "The passwords do not match" });
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const updated = await this.userDao.update(userId, { password: hashedPassword });

      if (!updated) {
        res.status(500).json({ error: "Error updating password" });
        return;
      }

      res.status(200).json({ message: "Password successfully updated" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Internal error" });
    }
  }

    /**
   * Deletes logged-in user's account.
   * @param {Request} req 
   * @param {Response} res 
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = (req as any).user;
      console.log("logg:", loggedUser)
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const userId = loggedUser.userId;
      console.log("id:", userId)
      const deleted = await this.userDao.delete(userId);

      if (!deleted) {
        res.status(404).json({ error: "Not found user" });
        return;
      }

      res.status(200).json({ message: "Delete user successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }

  // Endpoint para solicitar recuperación de contraseña
  async requestPasswordRecovery(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email requerido" });
        return;
      }

      const user = await userDAO.userByEmail(email);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      //Generate token
      const jwtSecret = process.env.JWT_SECRET as string;
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: '1h' }
      );
      console.log("token:", token);
      // Envía correo con token en enlace
      await sendchangedEmail(email, token);

      res.status(200).json({ message: "Correo de recuperación enviado" });
    } catch (error) {
      console.error("Error en solicitud de recuperación:", error);
      res.status(500).json({ error: "Error interno" });
    }
  }

  // Endpoint para resetear contraseña con token y nueva contraseña
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      if (!token || !newPassword || !confirmPassword) {
        res.status(400).json({ error: "Token y ambas contraseñas son requeridas" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "Las contraseñas no coinciden" });
        return;
      }

      let payload: any;
      try {
        const jwtSecret = process.env.JWT_SECRET as string;
        payload = jwt.verify(token, jwtSecret);
      } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
      }

      const user = await userDAO.getById(payload.userId);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updated = await userDAO.update(user.id as string, { password: hashedPassword });
      if (!updated) {
        res.status(500).json({ error: "Error al actualizar la contraseña" });
        return;
      }

      res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error en resetear contraseña:", error);
      res.status(500).json({ error: "Error interno" });
    }
  }

}

