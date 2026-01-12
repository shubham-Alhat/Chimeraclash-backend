import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db/prisma.js";
import {
  generateAccessToken,
  COOKIE_OPTIONS,
} from "../lib/handleOAuthCallback.js";

import dotenv from "dotenv";

dotenv.config();

export const completeUserProfile = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const prevUser = req.authUser;

    if (!prevUser) {
      return res
        .status(401)
        .json({ message: "User not found", success: false, data: null });
    }

    if (!username || !password) {
      return res.status(409).json({
        message: "Both fields are required",
        success: false,
        data: null,
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.user.update({
      where: {
        id: prevUser.id,
      },
      data: {
        username: username,
        password: hashPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "User onboarded success",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while onboarding user",
      success: false,
      data: null,
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const authUser = req.authUser;

    if (!authUser) {
      return res
        .status(404)
        .json({ message: "authUser not found", success: false, data: null });
    }

    return res
      .status(200)
      .json({ message: "Authorized user", success: true, data: authUser });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while get User", success: false, data: null });
  }
};

export const registerNewUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // check validation of fields
    if ([username, email, password].some((field) => field?.trim() === "")) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
        data: null,
      });
    }

    //   check if user already exist
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or Username already exists, Please create unique one!",
        success: false,
        data: null,
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create new entry in db
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    //   generate tokens and send it
    const token = generateAccessToken(user.id, user.email);

    return res.status(201).cookie("accessToken", token, COOKIE_OPTIONS).json({
      message: "User created successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while signup",
      success: false,
      data: null,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username or Password not found",
        success: false,
        data: null,
      });
    }

    // check if user exist in db
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false, data: null });
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Username or Password invalid",
        success: false,
        data: null,
      });
    }

    // confirmed authorized user
    const token = generateAccessToken(user.id, user.email);

    // sanitize response
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return res.status(200).cookie("accessToken", token, COOKIE_OPTIONS).json({
      message: "User login successfully",
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error in Login process!", success: false, data: null });
  }
};
