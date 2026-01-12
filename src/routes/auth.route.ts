import express from "express";
import passport from "passport";
import { handleOAuthCallback } from "../lib/handleOAuthCallback";
import {
  completeUserProfile,
  getUser,
  loginUser,
  registerNewUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/complete-profile").post(authMiddleware, completeUserProfile);

router.route("/me").get(authMiddleware, getUser);

router.route("/signup").post(registerNewUser);

router.route("/login").post(loginUser);

// google login
router.get("/login/google", (req, res, next) => {
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    prompt: "select_account", // remove it in production
  })(req, res, next);
});

// google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  handleOAuthCallback
);

export default router;
