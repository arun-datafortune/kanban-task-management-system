import { useEffect, useState } from "react";
import axios from "axios";

const columns = ["To Do", "In Progress", "In Review", "Done"];

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignee, setAssignee] = useState("");
  const [search, setSearch] = useState("");

  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editAssignee, setEditAssignee] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async () => {
    if (!title || !assignee) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.post("http://localhost:5000/tasks", {
        title,
        priority,
        assignee,
        status: "To Do",
      });
      setTitle(""); setPriority("Medium"); setAssignee("");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditAssignee(task.assignee);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/tasks/${editingTask}`, {
        title: editTitle,
        priority: editPriority,
        assignee: editAssignee,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => setEditingTask(null);

  // Drag & drop handlers
  const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  const onDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };
  const onDragOver = (e) => e.preventDefault();

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  // Button styles
  const buttonStyle = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Kanban Board</h2>

      {/* SEARCH BAR */}
      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "20px",
          border: "1px solid #ccc",
          width: "250px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          outline: "none",
          marginBottom: "20px"
        }}
      />

      {/* CREATE TASK */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Select Assignee</option>
          {users.map((user) => <option key={user.id}>{user.name}</option>)}
        </select>
        <button
          onClick={createTask}
          style={{ ...buttonStyle, background: "green", color: "white" }}
        >
          Add Task
        </button>
      </div>

      {/* KANBAN COLUMNS */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "flex-start"
      }}>
        {columns.map((col) => (
          <div
            key={col}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col)}
            style={{
              width: "260px",
              minHeight: "400px",
              background: "linear-gradient(135deg, #e0eafc, #cfdef3)",
              padding: "15px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <h3>{col}</h3>

            {filteredTasks
              .filter((task) => task.status === col)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  style={{
                    background: "white",
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    borderLeft: `6px solid ${
                      task.priority === "High" ? "red" :
                      task.priority === "Medium" ? "orange" : "green"
                    }`,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform="scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                >
                  {editingTask === task.id ? (
                    <>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <select value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)}>
                        {users.map((user) => <option key={user.id}>{user.name}</option>)}
                      </select>
                      <div style={{ marginTop: "5px" }}>
                        <button onClick={saveEdit} style={{ marginRight: "5px", ...buttonStyle, background:"#4a90e2", color:"white" }}>Save</button>
                        <button onClick={cancelEdit} style={{ ...buttonStyle, background:"#ccc" }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{task.title}</strong>
                      <p>Priority: {task.priority}</p>
                      <p>Assignee: {task.assignee}</p>
                      <div style={{ marginTop: "5px", display:"flex", gap:"5px" }}>
                        <button onClick={() => startEdit(task)} style={{ ...buttonStyle, background:"#4a90e2", color:"white" }}>Edit</button>
                        <button onClick={() => deleteTask(task.id)} style={{ ...buttonStyle, background:"red", color:"white" }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;