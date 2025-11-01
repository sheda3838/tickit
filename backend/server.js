import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import todoRouter from "./routes/todo.route.js";
import MySQLStore from "express-mysql-session";
import db from "./config/db.js";

const app = express();
app.use(express.json());
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ✅ Persistent MySQL session store
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore({}, db.promise());

app.use(
  session({
    secret: "hello bro I am zaid nice to meet you",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(userRouter);
app.use(todoRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
