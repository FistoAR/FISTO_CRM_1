<?php
$host = "fist-o.com";
$dbname = "fisto_crm_web";
$username = "fisto_crm_web";
$password = "XAAMJM8z7cFdCLVqckDS";


try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to handle special characters properly
    $conn->set_charset("utf8");
    
    // DO NOT echo anything here - it will break JSON responses
    // Remove any lines like: echo "Connected successfully";
    
} catch (Exception $e) {
    // Log the error instead of echoing it
    error_log("Database connection error: " . $e->getMessage());
    $conn = null;
}
?>
