import db from "../config/db.js";
import { Router } from "express";

const todoRouter = Router();

// Insert new todo
todoRouter.post("/api/todos/", (req, resp) => {
  const { todo } = req.body;
  const userId = req.session.userId;
  if (!todo) {
    return resp.json({ success: false, error: "Todo title is required" });
  }
  try {
    db.query(
      "INSERT INTO todos (`title`, `userId`) VALUES (?, ?)",
      [todo, userId],
      (err, data) => {
        if (err) return resp.json({ success: false, error: err.message });

        const insertedId = data.insertId;
        // Fetch full inserted row
        db.query(
          "SELECT * FROM todos WHERE id = ?",
          [insertedId],
          (err2, rows) => {
            if (err2) return resp.json({ success: false, error: err2.message });
            if (rows.length === 0)
              return resp.json({
                success: false,
                error: "Todo not found after insert",
              });

            // Return the actual inserted record
            resp.json({ success: true, todo: rows[0] });
          }
        );
      }
    );
  } catch (err) {
    return resp.json({ success: false, error: err.message });
  }
});

// Get all todos
todoRouter.get("/api/todos", (req, resp) => {
  const userId = req.session.userId;
  try {
    db.query("SELECT * FROM todos WHERE userId = ?", [userId],  (err, data) => {
      if (err) return resp.json({ success: false, error: err.message });
      if (data.length > 0) {
        return resp.json({ success: true, todos: data });
      } else {
        return resp.json({ success: false});
      }
    });
  } catch (err) {
    return resp.json({ success: false, error: err.message });
  }
});

// Update a todo
todoRouter.patch("/api/todos/:id", (req, resp) => {
  const id = req.params.id;

  if (!id) {
    return resp.json({ success: false, error: "Id is required" });
  }

  const { title, completed } = req.body;

  try {
    // Fetch the existing todo
    db.query("SELECT * FROM todos WHERE id = ?", [id], (err, data) => {
      if (err) return resp.json({ success: false, error: err.message });
      if (data.length === 0) {
        return resp.json({ success: false, error: "Todo not found" });
      }

      const existingTodo = data[0];

      // Use the new value if provided, otherwise keep the old one
      const updatedTitle = title ?? existingTodo.title;
      const updatedCompleted = completed ?? existingTodo.completed;

      // Update with merged values
      db.query(
        "UPDATE todos SET title = ?, completed = ? WHERE id = ?",
        [updatedTitle, updatedCompleted, id],
        (err2) => {
          if (err2) return resp.json({ success: false, error: err2.message });

          // Fetch and return the updated todo
          db.query("SELECT * FROM todos WHERE id = ?", [id], (err3, data2) => {
            if (err3) return resp.json({ success: false, error: err3.message });
            resp.json({ success: true, todo: data2[0] });
          });
        }
      );
    });
  } catch (err) {
    return resp.json({ success: false, error: err.message });
  }
});

// Delete a todo
todoRouter.delete("/api/todos/:id", (req, resp) => {
  const id = req.params.id;

  if (!id) {
    return resp.json({ success: false, error: "Id is required" });
  }

  try {
    db.query("DELETE FROM todos WHERE id = ?", [id], (err, data) => {
      if (err) return resp.json({ success: false, error: err.message });
      resp.json({ success: true });
    });
  } catch (err) {
    return resp.json({ success: false, error: err.message });
  }
});

export default todoRouter;
