<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

/* ================= FETCH USERS (for assignee dropdown) ================= */
$users = $conn->query("SELECT id, name FROM users");
/* ====================================================================== */

/* ---------- CREATE TASK ---------- */
if (isset($_POST['add_task'])) {
    $title = $_POST['title'];
    $assignee_id = !empty($_POST['assignee_id']) ? $_POST['assignee_id'] : NULL;

    if (!empty($title)) {
        $conn->query(
            "INSERT INTO tasks (title, user_id, status_id, assignee_id)
             VALUES ('$title', $user_id, 1, " . ($assignee_id ? $assignee_id : "NULL") . ")"
        );
    }
    header("Location: index.php");
    exit();
}

/* ---------- DELETE TASK ---------- */
if (isset($_POST['delete_task'])) {
    $task_id = $_POST['task_id'];
    $conn->query(
        "DELETE FROM tasks WHERE id = $task_id AND user_id = $user_id"
    );
    header("Location: index.php");
    exit();
}

/* ---------- DRAG & DROP ---------- */
if (isset($_POST['drag_task'])) {
    $task_id   = $_POST['task_id'];
    $status_id = $_POST['status_id'];

    $conn->query(
        "UPDATE tasks SET status_id = $status_id
         WHERE id = $task_id AND user_id = $user_id"
    );
    exit();
}

/* ---------- SEARCH ---------- */
$search = isset($_GET['search']) ? $_GET['search'] : "";

/* ---------- FETCH STATUSES ---------- */
$statuses = $conn->query("SELECT * FROM statuses ORDER BY position");

/* ---------- FETCH TASKS (SEARCH BY TITLE + ASSIGNEE ONLY) ---------- */
$task_query = $conn->query("
    SELECT 
        tasks.*,
        assignee.name AS assignee_name
    FROM tasks
    LEFT JOIN users AS assignee ON tasks.assignee_id = assignee.id
    WHERE tasks.user_id = $user_id
      AND (
            tasks.title LIKE '%$search%'
         OR assignee.name LIKE '%$search%'
      )
");

/* ---------- GROUP TASKS BY STATUS ---------- */
$tasks = [];
while ($row = $task_query->fetch_assoc()) {
    $tasks[$row['status_id']][] = $row;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Kanban Board</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            padding: 20px;
        }
        h2 {
            margin-bottom: 10px;
        }
        .top-bar {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        input, select, button {
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        button {
            background: #1976d2;
            color: #fff;
            border: none;
            cursor: pointer;
        }
        .board {
            display: flex;
            gap: 15px;
        }
        .column {
            background: #fff;
            border-radius: 6px;
            padding: 10px;
            width: 230px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .column h3 {
            text-align: center;
            background: #e3f2fd;
            padding: 6px;
            border-radius: 4px;
        }
        .task {
            background: #fafafa;
            border-radius: 5px;
            padding: 8px;
            margin-top: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            cursor: grab;
            position: relative;
        }
        .assignee {
            font-size: 12px;
            color: #555;
            margin-top: 3px;
        }
        .delete-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #e53935;
            border: none;
            color: #fff;
            font-size: 11px;
            border-radius: 3px;
            padding: 2px 6px;
            cursor: pointer;
        }
    </style>
</head>
<body>

<h2>Welcome, <?php echo $_SESSION['user_name']; ?></h2>

<div class="top-bar">
    <!-- SEARCH -->
    <form method="GET">
        <input type="text" name="search" placeholder="Search by title or assignee"
               value="<?php echo htmlspecialchars($search); ?>">
        <button type="submit">Search</button>
    </form>

    <!-- ADD TASK -->
    <form method="POST">
        <input type="text" name="title" placeholder="New task" required>
        <select name="assignee_id">
            <option value="">Assignee</option>
            <?php while ($u = $users->fetch_assoc()): ?>
                <option value="<?php echo $u['id']; ?>">
                    <?php echo htmlspecialchars($u['name']); ?>
                </option>
            <?php endwhile; ?>
        </select>
        <button name="add_task">Add</button>
    </form>
</div>

<div class="board">
<?php while ($status = $statuses->fetch_assoc()): ?>
    <div class="column"
         data-status-id="<?php echo $status['id']; ?>"
         ondragover="event.preventDefault()"
         ondrop="dropTask(event)">
        <h3><?php echo $status['name']; ?></h3>

        <?php if (isset($tasks[$status['id']])): ?>
            <?php foreach ($tasks[$status['id']] as $task): ?>
                <div class="task"
                     draggable="true"
                     ondragstart="dragTask(event)"
                     data-task-id="<?php echo $task['id']; ?>">

                    <?php echo htmlspecialchars($task['title']); ?>

                    <?php if (!empty($task['assignee_name'])): ?>
                        <div class="assignee">
                            👤 Assigned: <?php echo htmlspecialchars($task['assignee_name']); ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST">
                        <input type="hidden" name="task_id" value="<?php echo $task['id']; ?>">
                        <button class="delete-btn" name="delete_task">X</button>
                    </form>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endwhile; ?>
</div>

<script>
let draggedId;

function dragTask(e) {
    draggedId = e.target.dataset.taskId;
}

function dropTask(e) {
    let statusId = e.currentTarget.dataset.statusId;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "index.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = () => location.reload();
    xhr.send("drag_task=1&task_id=" + draggedId + "&status_id=" + statusId);
}
</script>

</body>
</html>