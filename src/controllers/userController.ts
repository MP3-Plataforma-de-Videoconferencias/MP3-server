import { Request, Response } from 'express';
import { UserDao } from '../dao/userDAO';
import { User } from '../models/User';
import bcrypt from "bcrypt"

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

  async updateUser(req: Request, res: Response): Promise<void> {
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

  async deleteUser(req: Request, res: Response): Promise<void> {
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
}
