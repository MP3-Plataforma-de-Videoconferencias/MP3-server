import { Request, Response } from "express";
import { userDao } from "../dao/userDAO";

export const userController = {
  async create(req: Request, res: Response) {
    try {
      const user = await userDao.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  },

  async getById(req: Request, res: Response) {
  try {
    const user = await userDao.getById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuario" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await userDao.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      await userDao.update(req.params.id, req.body);
      res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await userDao.delete(req.params.id);
      res.json({ message: "Usuario eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  },
};
