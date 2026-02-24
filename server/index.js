const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

/* ================= HARD CODED USER ================= */

const USER = {
  email: "admin@test.com",
  password: "123456",
  name: "Admin",
};

/* ================= PREDEFINED USERS ================= */

const users = [
  { id: 1, name: "Aditya" },
  { id: 2, name: "Rahul" },
  { id: 3, name: "Sneha" },
];

/* ================= IN-MEMORY TASKS ================= */

let tasks = [];

/* ================= AUTH ================= */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === USER.email && password === USER.password) {
    return res.json({ success: true, user: USER });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* ================= USERS ================= */

app.get("/users", (req, res) => {
  res.json(users);
});

/* ================= TASKS ================= */

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const newTask = {
    id: uuidv4(),
    ...req.body,
  };

  tasks.push(newTask);
  res.json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;

  tasks = tasks.map((task) =>
    task.id === id ? { ...task, ...req.body } : task
  );

  res.json({ success: true });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  tasks = tasks.filter((task) => task.id !== id);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});