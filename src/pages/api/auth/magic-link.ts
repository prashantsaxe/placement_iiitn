import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {db} from "../../../lib/mongodb"

interface UserRecord {
  hashedToken: string;
  expires: number;
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // Generate a JWT token (expires in 15 min)
  const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
  const hashedToken = bcrypt.hashSync(token, 10); // Hash the token

 // Store hashed token in MongoDB
 await db.collection("magic_links").updateOne(
  { email },
  { $set: { hashedToken, expires: new Date(Date.now() + 15 * 60 * 1000) } },
  { upsert: true }
);

  // Magic link URL
  const magicLink = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}&email=${email}`;

  // Nodemailer setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: `"Placement IIITN" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Magic Link for Login",
    html: `<p>Click below to log in:</p>
           <a href="${magicLink}">Login Now</a>
           <p>This link expires in 15 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Magic link sent!" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Failed to send email" });
  }
}
