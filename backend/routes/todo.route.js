import express, { text } from "express";
import {Todo} from "../models/todo.model.js";

const router = express.Router();

// Get All Todos
router.get("/", async (req, resp) => {
  try {
    const todos = await Todo.find();
    resp.json(todos);
  } catch (err) {
    resp.status(400).send("Something went wrong, Error: ", err.message);
  }
});

// Add a new todo
router.post("/", async (req, resp) => {
  try {
    const todo = new Todo({
      text: req.body.text,
    });
    const newTodo = await todo.save();
    resp.status(201).send(newTodo);
  } catch (err) {
    resp.status(400).send("Something went wrong, Error: ", err.message);
  }
});

// Update a todo
router.patch("/:id", async (req, resp) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findById(id);

    if (!todo) {
      return resp.status(404).send("Todo not found, Error: ", err.message);
    }

    if (req.body.text !== undefined) {
      todo.text = req.body.text;
    }
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }

    const updatedTodo = await todo.save();
    resp.status(201).json(updatedTodo);
  } catch (err) {
    resp.status(400).send("Something went wrong, Error: ", err.message);
  }
});

// Delete a todo
router.delete("/:id", async (req, resp) => {
  try {
    const id = req.params.id;
    const todo = await Todo.findByIdAndDelete(id);
    resp.status(201).send("Todo deleted success");
    
  } catch (err) {
    resp.status(400).send("Something went wrong, Error: ", err.message);
  }
});

export default router;