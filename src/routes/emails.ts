import { Router } from "express";
import { sendchangedEmail } from "../utils/emailService"; 

const router = Router();

router.post("/changePassword", async (req, res) => {
  const { email} = req.body;

  try {
    await sendchangedEmail(email);
    res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar correo" });
  }
});

export default router;

