<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "kanban_app";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>