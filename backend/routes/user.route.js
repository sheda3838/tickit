import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import dotenv from "dotenv";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userRouter = Router();

// Manual signin
userRouter.post("/api/signin", async (req, resp) => {
  const { email, password } = req.body;

  // Check user exists
  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, data) => {
        if (err) return resp.json({ success: false, error: err.message });

        if (data.length > 0) {
          if (!data[0].verified) {
            return resp.json({
              success: false,
              error: "Please verify your email first",
            });
          }

          const match = await bcrypt.compare(password, data[0].password);
          if (match) {
            const user = data[0];
            req.session.name = user.name;
            req.session.userId = user.id;
            resp.json({ success: true });
          } else {
            return resp.json({ success: false, error: "Wrong password" });
          }
        }
      }
    );
  } catch (err) {
    resp.json({ success: false, error: err.message });
  }
});

// Manual Signup
userRouter.post("/api/signup", async (req, resp) => {
  const { name, email, password } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, data) => {
        if (err) return resp.json({ success: false, error: err.message });
        if (data.length > 0) return resp.json({ exists: true });

        const hash = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const values = [name, email, hash, false, token];

        db.query(
          "INSERT INTO users (`name`, `email`, `password`, `verified`, `verification_token`) VALUES (?, ?, ?, ?, ?)",
          values,
          async (err2, data2) => {
            if (err2) return resp.json({ success: false, error: err2.message });

            // Send verification email
            const msg = {
              to: email,
              from: process.env.FROM_EMAIL,
              subject: "Verify your email",
              html: `<p>Click <a href="${process.env.FRONTEND_URL}verify-email?token=${token}">here</a> to verify your email.</p>`,
            };
            await sgMail.send(msg);

            return resp.json({
              success: true,
              message: "Check your email to verify your account",
            });
          }
        );
      }
    );
  } catch (err) {
    resp.json({ success: false, error: err.message });
  }
});

userRouter.get("/api/verify-email", (req, res) => {
  const { token } = req.query;

  db.query("SELECT * FROM users WHERE verification_token = ?", [token], (err, data) => {
    if (err) return res.status(500).send("Server error");
    if (data.length === 0) return res.status(400).send("Invalid or expired token");

    db.query(
      "UPDATE users SET verified = true, verification_token = NULL WHERE id = ?",
      [data[0].id],
      (err2) => {
        if (err2) return res.status(500).send("Server error");
        return res.send("Email verified! You can now log in.");
      }
    );
  });
});


// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ----------------- Google Login/Signup -----------------
userRouter.post("/api/google/token", async (req, resp) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // Check if user exists
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, data) => {
      if (err)
        return resp.status(500).json({ success: false, message: err.message });

      if (data.length > 0) {
        const user = data[0];

        req.session.userId = user.id;
        req.session.name = user.name;

        return resp.json({ success: true });
      } else {
        // User does not exist - create new user
        const values = [name, email, null]; // password null for Google users
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?)",
          [values],
          (err2, result) => {
            if (err2)
              return resp
                .status(500)
                .json({ success: false, message: err2.message });

            const newUserId = result.insertId;
            req.session.userId = newUserId;
            req.session.name = name;

            return resp.json({ success: true });
          }
        );
      }
    });
  } catch (err) {
    resp.status(401).json({ success: false, message: err.message });
  }
});

userRouter.get("/api/user", (req, resp) => {
  if (req.session.name) {
    return resp.json({
      loggedin: true,
      name: req.session.name,
      userId: req.session.userId,
    });
  } else {
    return resp.json({ loggedin: false });
  }
});

userRouter.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    return res.json({ success: true, message: "Logged out successfully" });
  });
});

export default userRouter;
