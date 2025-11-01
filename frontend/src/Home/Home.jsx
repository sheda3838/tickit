import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { notifyError, notifySuccess } from "../utils/toast";
import "./Home.css";
import {
  FaCheck,
  FaTimes,
  FaPen,
  FaTrash,
  FaSignOutAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [updatedText, setUpdatedText] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/user");
        if (r.data.loggedin) {
          setName(r.data.name);
        } else {
          notifyError("Unauthorized access");
          navigate("/signin");
        }
      } catch (err) {
        notifyError(err.message);
      }
    };

    fetchUser();
    getTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!todo.trim()) return;
    axios
      .post("/api/todos/", { todo })
      .then((r) => {
        if (!r.data.success) {
          return notifyError(r.data.error);
        }
        notifySuccess("Todo added success");
        setTodoList([...todoList, r.data.todo]);
        setTodo("");
      })
      .catch((err) => notifyError(err.message));
  };

  const getTodos = () => {
    axios
      .get("/api/todos")
      .then((r) => {
        if (r.data.error) {
          return notifyError(r.data.error);
        }
        setTodoList(r.data.todos || []);
      })
      .catch((err) => {
        notifyError(err.message);
      });
  };

  const hanldeDelete = (id) => {
    axios
      .delete(`/api/todos/${id}`)
      .then((r) => {
        if (r.data.error) {
          return notifyError(r.data.error);
        }
        notifySuccess("Todo deleted success");
        setTodoList(todoList.filter((t) => id !== t.id));
      })
      .catch((err) => {
        notifyError(err.message);
      });
  };

  const handleUpdate = (id) => {
    if (!updatedText.trim()) return notifyError("Todo cannot be empty");
    const todo = todoList.find((t) => t.id === id);
    if (updatedText === todo.title) {
      setEditingTodo(null);
      return;
    }

    axios
      .patch(`/api/todos/${id}`, { title: updatedText })
      .then((r) => {
        if (r.data.error) {
          return notifyError(r.data.error);
        }
        setTodoList(todoList.map((t) => (t.id === id ? r.data.todo : t)));
        notifySuccess("Todo Updated success");
        setEditingTodo(null);
        setUpdatedText("");
      })
      .catch((err) => {
        notifyError(err.message);
      });
  };

  const startEditingTodo = (t) => {
    setEditingTodo(t.id);
    setUpdatedText(t.title);
  };

  const toggleTodo = (id) => {
    const todo = todoList.find((t) => t.id === id);
    if (!todo) return notifyError("Todo not found");

    axios
      .patch(`/api/todos/${id}`, { completed: !todo.completed })
      .then((r) => {
        if (r.data.error) {
          return notifyError(r.data.error);
        }
        setTodoList(todoList.map((t) => (t.id === id ? r.data.todo : t)));
        notifySuccess("Todo Toggled success");
      })
      .catch((err) => {
        notifyError(err.message);
      });
  };
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {});
      notifySuccess("Logged out successfully!");
      navigate("/signin");
    } catch (err) {
      notifyError("Error logging out");
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <img src="/logo.png" alt="Logo" className="app-logo" />
        <h1 className="greeting">Hello, {name}</h1>

        <form onSubmit={addTodo} className="todo-form">
          <input
            onChange={(e) => setTodo(e.target.value)}
            value={todo}
            type="text"
            placeholder="Make today awesome!"
            className="todo-input"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>

        <div className="todo-list">
          {todoList.length > 0 ? (
            todoList.map((t) => (
              <div key={t.id} className="todo-item">
                {editingTodo === t.id ? (
                  <div className="todo-edit">
                    <input
                      type="text"
                      value={updatedText}
                      onChange={(e) => setUpdatedText(e.target.value)}
                      className="todo-input"
                    />
                    <div className="btn-group">
                      <button
                        onClick={() => handleUpdate(t.id)}
                        className="btn btn-success"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => setEditingTodo(null)}
                        className="btn btn-cancel"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="todo-show">
                    <button
                      className={`todo-status-circle ${
                        t.completed ? "done" : ""
                      }`}
                      onClick={() => toggleTodo(t.id)}
                    >
                      {t.completed ? (
                        <span className="tick">&#10003;</span>
                      ) : null}
                    </button>

                    <span className="todo-title">{t.title}</span>

                    <div className="btn-group">
                      <button
                        onClick={() => startEditingTodo(t)}
                        className="btn btn-update"
                      >
                        <FaPen />
                      </button>
                      <button
                        onClick={() => hanldeDelete(t.id)}
                        className="btn btn-delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="loading">Loading...</div>
          )}
        </div>

        <button onClick={() => setShowLogoutModal(true)} className="btn-logout">
          Logout
        </button>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleLogout}>
                Yes
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
