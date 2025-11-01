import mysql from "mysql2";
import dotenv from 'dotenv'

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tickit",
});

db.connect((err) => {
  if (err) return console.log("DB COnnection failed: ", err.message);
  return console.log("DB Connected Successfully...");
});

export default db;