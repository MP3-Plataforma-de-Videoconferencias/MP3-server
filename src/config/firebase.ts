import admin from "firebase-admin";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "../../serviceAccountKey.json");

const serviceAccount = require(path.resolve(keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
