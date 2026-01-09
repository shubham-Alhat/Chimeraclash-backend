import dotenv from "dotenv";
import type { Response, Request } from "express";

dotenv.config();

export const handleOAuthCallback = async (req: Request, res: Response) => {
  const user = req.user;
  return res.status(200).json({ message: "google auth completed", user });
};
