import dotenv from "dotenv";
import type { Response, Request } from "express";
import { prisma } from "../db/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();

const generateAccessToken = (id: string, email: string) => {
  const payload = {
    id: id,
    email: email,
  };
  const secretKey: any = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });

  return token;
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
  const profile = req.user;

  return res.status(200).json({ message: "hello", profile });
};
