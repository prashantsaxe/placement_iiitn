import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    if (!req.headers.cookie) {
      return res.status(401).json({ authenticated: false, error: "No cookies found" });
    }

    const cookies = parse(req.headers.cookie);
    const token = cookies.authToken;

    if (!token) {
      return res.status(401).json({ authenticated: false, error: "No token found" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return res.status(200).json({ authenticated: true, user: decoded });
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ authenticated: false, error: "Invalid or expired token" });
  }
}
