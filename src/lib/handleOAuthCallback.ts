import dotenv from "dotenv";
import type { Response, Request, CookieOptions } from "express";
import { prisma } from "../db/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();

const generateAccessToken = (id: string, email: string): string => {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = {
    id,
    email,
  };

  return jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
};

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: "/",
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const profile = req.user;

    if (!profile || !profile.email) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=auth_failed`
      );
    }

    let user = await prisma.user.findUnique({
      where: {
        email: profile.email,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.email,
          username:
            profile.email.split("@")[0] +
            "_" +
            crypto.randomBytes(4).toString("hex"),
          password: "",
        },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      isNewUser = true;
    }

    const token = generateAccessToken(user.id, user.email);

    const redirectUrl = isNewUser
      ? `${process.env.FRONTEND_URL}/battle?newUser=true`
      : `${process.env.FRONTEND_URL}/battle`;

    return res
      .cookie("accessToken", token, COOKIE_OPTIONS)
      .redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
