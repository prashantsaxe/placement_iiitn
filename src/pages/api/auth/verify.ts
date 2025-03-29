import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { db } from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, email } = req.query;
  if (!token || !email || typeof token !== "string" || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  const userRecord = await db.collection("magic_links").findOne({ email });

  if (!userRecord) return res.status(400).json({ error: "Invalid or expired token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const isValid = bcrypt.compareSync(token, userRecord.hashedToken);
    if (!isValid) return res.status(400).json({ error: "Invalid token" });

    // ✅ Properly set secure cookie
    res.setHeader("Set-Cookie", `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`);

    return res.redirect(307, "/dashboard"); // Use 307 to maintain POST method
  } catch (error) {
    return res.status(400).json({ error: "Token expired or invalid" });
  }
}
