import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

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
          const match = await bcrypt.compare(password, data[0].password);
          if (match) {
            const user = data[0];

            req.session.name = user.name;
            req.session.userId = user.id;
            resp.json({ success: true });
          } else {
            return resp.json({ success: false, error: "Wrong password" });
          }
        } else {
          return resp.json({ success: false, error: "User doesnt exists" });
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

        if (data.length > 0) {
          return resp.json({ exists: true });
        }

        const hash = await bcrypt.hash(password, 10);
        const values = [name, email, hash];

        db.query(
          "INSERT INTO users (`name`, `email`, `password`) VALUES (?, ?, ?)",
          values,
          (err, data) => {
            if (err) return resp.json({ success: false, error: err.message });
            return resp.json({ success: true });
          }
        );
      }
    );
  } catch (err) {
    resp.json({ success: false, error: err.message });
  }
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
