import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaTimes, FaCheck } from "react-icons/fa";

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const resp = await axios.post("/api/todos", { text: newTodo });
      setNewTodo("");
      setTodos([...todos, resp.data]);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchTodos = async () => {
    try {
      const resp = await axios.get("/api/todos");
      setTodos(resp.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const updateTodo = async (id) => {
    try {
      const resp = await axios.patch(`/api/todos/${id}`, { text: editedText });
      setTodos(
        todos.map((t) => {
          return t._id === id ? resp.data : t;
        })
      );
      setEditingTodo(null);
      setEditedText("");
    } catch (err) {
      console.log(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((t) => id !== t._id));
    } catch (err) {
      console.log(err.message);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      const resp = await axios.patch(`/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(
        todos.map((t) => {
          return id === t._id ? resp.data : t;
        })
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  const startEditingTodo = (todo) => {
    setEditingTodo(todo._id);
    setEditedText(todo.text);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div
      className="min-h-screen bg-linear-to-br from-blue-100
      to-blue-500 flex justify-center items-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full 
        max-w-lg p-6"
      >
        <div>
          <div className="h-30 w-30 mx-auto">
            <img src="/logo.png" alt="Logo" />
          </div>
          <form
            onSubmit={addTodo}
            className="flex items-center gap-2
            shadow-md rounded-xl border-2 border-gray-100 p-2 "
          >
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1 outline-none rounded-2xl
              px-3 py-2"
              placeholder="What's next?"
              required
            />
            <button
              type="submit"
              className="relative inline-block cursor-pointer overflow-hidden rounded-xl bg-linear-to-r from-[#2154ad] to-[#2c5295] px-5 py-2 font-bold text-[12px] text-white tracking-wide transition-colors duration-300 group"
            >
              <span className="relative z-10 transition-colors duration-300 ">
                Add Task
              </span>
              <span className="absolute inset-0 -left-[10%] w-[120%] bg-blue-500 skew-x-30 transition-transform duration-400 ease-[cubic-bezier(0.3,1,0.8,1)] group-hover:translate-x-full"></span>
            </button>
          </form>
          <div className="mt-4">
            {todos.length === 0 ? (
              <div></div>
            ) : (
              <div>
                {todos.map((t) => {
                  return (
                    <div key={t._id}>
                      {editingTodo === t._id ? (
                        <div className="flex items-center mt-2">
                          <input
                            className="flex-1
                            
                            rounded-lg
                            border-2 border-gray-300
                            outline-none
                          p-1"
                            type="text"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                          />
                          <div className="flex gap-2 ites-center mx-2">
                            <button
                              onClick={() => updateTodo(t._id)}
                              className="bg-green-400 hover:bg-green-300 p-2 cursor-pointer rounded-xl"
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="bg-red-400 p-2  hover:bg-red-300 cursor-pointer rounded-xl"
                              onClick={() => setEditingTodo(null)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center m-2">
                          <button
                            onClick={() => toggleTodo(t._id)}
                            className={`mr-2  
                          h-7 w-7 flex items-center justify-center
                          cursor-pointer rounded-full hover:bg-green-300
                          ${t.completed ? "bg-green-200" : "bg-gray-200"}
                          `}
                          >
                            {t.completed && <FaCheck />}
                          </button>
                          <div className="flex-1">{t.text}</div>
                          <div className="flex gap-2">
                            <button
                              className="bg-blue-400  hover:bg-blue-300 cursor-pointer p-2 rounded-xl"
                              onClick={() => startEditingTodo(t)}
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => deleteTodo(t._id)}
                              className="bg-red-400  hover:bg-red-300 cursor-pointer p-2 rounded-xl"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
