<?php
// ==================== ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ ====================
$host = 'localhost';      // сервер базы данных (XAMPP)
$dbname = 'smartstore_db'; // имя нашей базы данных
$username = 'root';        // пользователь XAMPP по умолчанию
$password = '';            // пароль пустой

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Подключение успешно"; // раскомментируйте для проверки
} catch (PDOException $e) {
    die("Ошибка подключения к БД: " . $e->getMessage());
}

// ==================== ФУНКЦИЯ ПОЛУЧЕНИЯ ВСЕХ ТОВАРОВ ====================
function getProducts($pdo) {
    $sql = "SELECT * FROM products";
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ==================== ФУНКЦИЯ СОХРАНЕНИЯ СООБЩЕНИЯ ИЗ ФОРМЫ ====================
function saveMessage($pdo, $name, $email, $message) {
    $sql = "INSERT INTO messages (name, email, message) VALUES (:name, :email, :message)";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':message' => $message
    ]);
}
?>
