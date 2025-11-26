import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate requests using a custom JWT token.
 * 
 * - Reads the Authorization header expecting format: `Bearer <token>`
 * - Verifies the JWT using the secret stored in `process.env.JWT_SECRET`
 * - If valid, attaches the decoded payload to `req.user`
 * - If invalid or missing, sends an appropriate HTTP error response
 *
 * @param {Request} req - Express request object containing headers
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Function to pass control to the next middleware
 * 
 * @returns {Promise<void>} Calls next() if JWT is valid, otherwise sends 401 or 403 error
 *
 * @example
 * // Usage in a route
 * router.get("/profile", authenticateJWT, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET as string;

    /**
     * Verifies the token using a Promise wrapper around jwt.verify()
     * to allow usage with async/await.
     */
    const payload = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // Attach decoded payload (e.g., { userId, email }) to req.user
    (req as any).user = payload;
    
    next();

  } catch (error) {
    console.error("JWT verify error:", error);
    res.status(403).json({ error: 'Token inválido' });
  }
}
