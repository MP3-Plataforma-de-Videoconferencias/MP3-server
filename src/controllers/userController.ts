import { Request, Response } from 'express';
import { UserDao } from '../dao/UserDAO';
import { User } from '../models/User';

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { error } from 'console';

function validatePassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

export class UserController {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: User = req.body;
      //verify that the email is not repeated
      const existingUsers = await this.userDao.getAll();
      const emailExist = existingUsers.some(u => u.email === userData.email);
      if (emailExist){
        res.status(400).json({ error: 'El email ya está registrado' });
        return;
      }
      //encrypt password
      const salt = bcrypt.genSaltSync(10);
      userData.password = bcrypt.hashSync(userData.password, salt);
      const id = await this.userDao.create(userData);
      res.status(201).json({ id });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const user = await this.userDao.getById(id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const updateData: Partial<User> = req.body;
      const success = await this.userDao.update(id, updateData);
      if (!success) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json({ message: 'Usuario actualizado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const success = await this.userDao.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userDao.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
  }

    async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, age, email, password } = req.body;

      if (!firstName || !lastName || !age || !email || !password) {
        res.status(400).json({ error: "Todos los campos son requeridos" });
        return;
      }

      if(!validatePassword(password)){
        res.status(400).json({ error: "Invalid password" });
        return;
      }

      // Normaliza email
      const normalizedEmail = email.trim().toLowerCase();

      // Verifica que no exista email duplicado
      const existingUser = await this.userDao.userByEmail(normalizedEmail);
      if (existingUser) {
        res.status(400).json({ error: "El email ya está registrado" });
        return;
      }

      // Encripta la contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Prepara el objeto usuario para crear
      const newUser: User = {
        firstName,
        lastName,
        age,
        email: normalizedEmail,
        password: hashedPassword,
      };

      // Crea el usuario
      const id = await this.userDao.create(newUser);

      res.status(201).json({ message: "Usuario creado", id });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  }

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

   async updateUser(req: Request, res: Response): Promise<void> {
    try {
      // Verificar usuario logueado
      const loggedUser = (req as any).user;
      console.log(loggedUser)
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }
      const userId = loggedUser.userId;

      // Datos a actualizar
      const updateData = req.body;

      // Permitir solo campos específicos
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
        res.status(400).json({ error: "No hay campos válidos para actualizar" });
        return;
      }

      // Normalizar email
      if (filteredData.email) {
        filteredData.email = filteredData.email.trim().toLowerCase();
      }

      // Actualizar usuario en DAO
      const updated = await this.userDao.update(userId, filteredData);

      if (!updated) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const loggedUser = (req as any).user;
      if (!loggedUser || !loggedUser.userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }
      const userId = loggedUser.userId;

      const deleted = await this.userDao.delete(userId);

      if (!deleted) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  }

  
}
