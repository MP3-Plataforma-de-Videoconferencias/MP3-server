import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET as string;

    // Verifica el token con await usando una promesa auxiliar
    const payload = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // Log para ver el payload
    //console.log('Payload token:', payload);

    // Asigna el payload a req.user (será un objeto con userId y email)
    (req as any).user = payload;
    next();
  } catch (error) {
    console.error("JWT verify error:", error);
    res.status(403).json({ error: 'Token inválido' });
  }
}
