import { Request, Response } from 'express';
import { UserDao } from '../dao/UserDAO';
import { User } from '../models/User';

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { error } from 'console';

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
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const userId = loggedUser.userId;

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

}
