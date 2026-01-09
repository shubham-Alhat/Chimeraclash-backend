import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userData = {
          name:
            profile.displayName ||
            `${profile.name?.givenName || ""} ${
              profile.name?.familyName || ""
            }`.trim() ||
            profile._json?.name ||
            null,
          email: profile.emails?.[0]?.value || profile._json?.email || null,
          picture: profile.photos?.[0]?.value || profile._json?.picture || null,
          provider: profile.provider || "google",
        };

        // ✅ done(null, userData) → Passport will attach it to req.user
        return done(null, userData);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);
