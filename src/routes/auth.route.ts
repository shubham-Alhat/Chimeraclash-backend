import express from "express";
import passport from "passport";
import { handleOAuthCallback } from "../lib/handleOAuthCallback";

const router = express.Router();

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
