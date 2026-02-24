<?php
session_start();
require 'db.php';

$error = "";

/* ---------- LOGIN LOGIC ---------- */
if (isset($_POST['login'])) {

    $email    = $_POST['email'];
    $password = $_POST['password'];

    // fetch user by email
    $sql = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        // verify password
        if (password_verify($password, $user['password'])) {

            // store session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];

            // redirect to kanban board
            header("Location: index.php");
            exit();

        } else {
            $error = "Invalid password";
        }

    } else {
        $error = "User not found";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>

<h2>Login</h2>

<?php if ($error): ?>
<p style="color:red;"><?php echo $error; ?></p>
<?php endif; ?>

<form method="POST">
    Email: <input type="email" name="email" required><br><br>
    Password: <input type="password" name="password" required><br><br>
    <button type="submit" name="login">Login</button>
</form>

</body>
</html>