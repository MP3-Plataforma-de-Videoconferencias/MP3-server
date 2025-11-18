import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

/**
 * Middleware to authenticate requests using Firebase Authentication
 * Verifies the JWT token sent in the Authorization header and adds the user data to the request
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to pass control to the next middleware
 * @returns {Promise<void>} Calls next() if authentication succeeds, or sends 401 response if it fails
 */
export const authenticateFirebase = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: "Missing Authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the Firebase JWT token
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Extract user data from decoded token
    const userData = {
      uid: decoded.uid,
      email: decoded.email || "",
      name: decoded.name || "",
      picture: decoded.picture || "",
      emailVerified: decoded.email_verified || false
    };
    
    // Add user data to request
    (req as any).user = userData;
    
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
