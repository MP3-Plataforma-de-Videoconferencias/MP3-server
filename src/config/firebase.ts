import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount: any;

/**
 * Loads the Firebase service account credentials.
 * 
 * Behavior:
 * - **Production:** If the environment variable `GOOGLE_APPLICATION_CREDENTIALS` exists,
 *   its JSON string is parsed and used as the service account.
 * - **Development:** If the env variable is missing, it loads the local file
 *   `serviceAccountKey.json` from the project directory.
 * 
 * @returns {void} This block only prepares the serviceAccount object for Firebase initialization.
 */
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Use JSON environment variable in production
  serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  // Use local file in development
  const keyPath = path.join(__dirname, "../../serviceAccountKey.json");
  const file = fs.readFileSync(keyPath, "utf8");
  serviceAccount = JSON.parse(file);
}

/**
 * Initializes the Firebase Admin SDK using the previously loaded service account.
 * 
 * @example
 * import { db, auth } from "./firebase-admin";
 * const users = await db.collection("users").get();
 * 
 * @returns {void}
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Firestore database instance.
 * Use this to read or write documents in your Firestore collections.
 * 
 * @type {FirebaseFirestore.Firestore}
 * @example
 * const doc = await db.collection("users").doc("123").get();
 */
export const db = admin.firestore();

/**
 * Firebase Authentication instance.
 * Use this to verify tokens, manage users, and perform authentication operations.
 * 
 * @type {admin.auth.Auth}
 * @example
 * const decoded = await auth.verifyIdToken(idToken);
 */
export const auth = admin.auth();

/**
 * Default Firebase Admin export.
 * Gives access to the entire admin SDK instance.
 * 
 * @type {admin.app.App}
 * @example
 * const claims = await admin.auth().getUser(uid);
 */
export default admin;
