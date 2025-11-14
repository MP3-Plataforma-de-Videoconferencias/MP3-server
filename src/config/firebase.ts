import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount: any;

//usar variable de entorno json en producción
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  //en local usa el archivo
  const keyPath = path.join(__dirname, "../../serviceAccountKey.json");
  const file = fs.readFileSync(keyPath, "utf8");
  serviceAccount = JSON.parse(file);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
