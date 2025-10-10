<?php
ob_start(); // Start output buffering

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
include 'db_connect.php';

// Function to send JSON response
function sendResponse($status, $message, $data = null) {
    ob_clean(); // Clear any previous output
    $response = [
        "status" => $status,
        "message" => $message
    ];
    
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Function to log debug info
function debugLog($message, $data = null) {
    $logEntry = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $logEntry .= " - Data: " . json_encode($data);
    }
    error_log($logEntry . "\n", 3, 'profile_debug.log');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse('error', 'Only POST and GET methods are allowed.');
}

$inputEmployeeId = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputEmployeeId = isset($_POST['employeeid']) ? trim($_POST['employeeid']) : '';
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $inputEmployeeId = isset($_GET['employeeid']) ? trim($_GET['employeeid']) : '';
}

if (empty($inputEmployeeId)) {
    sendResponse('error', 'Employee ID is required.');
}


try {
    // Check database connection
    if (!$conn) {
        throw new Exception('Database connection failed.');
    }

    debugLog("Database connection successful");

    // Query to get complete employee profile
    $profileQuery = "SELECT * FROM Employee_details WHERE Emp_id = ? LIMIT 1";
    $profileStmt = $conn->prepare($profileQuery);
    
    if (!$profileStmt) {
        debugLog("Query preparation failed", $conn->error);
        throw new Exception('Database query preparation failed: ' . $conn->error);
    }

    $profileStmt->bind_param("s", $inputEmployeeId);
    $profileStmt->execute();
    $result = $profileStmt->get_result();

    debugLog("Profile query executed", [
        'num_rows' => $result->num_rows,
        'employee_id_searched' => $inputEmployeeId
    ]);

    if ($result->num_rows > 0) {
        $profile = $result->fetch_assoc();
        
        debugLog("Profile found", [
            'profile_keys' => array_keys($profile),
            'employee_name' => $profile['Emp_name'] ?? 'N/A'
        ]);

        // Clean up and format the profile data
        $cleanProfile = [];
        foreach ($profile as $key => $value) {
            // Convert NULL values to empty string for better frontend handling
            $cleanProfile[$key] = ($value !== null) ? $value : '';
        }

        // Add some computed fields if needed
        $cleanProfile['display_name'] = $cleanProfile['Emp_name'] ?? 'Unknown';
        $cleanProfile['role_display'] = $cleanProfile['Designation'] ?? 'Employee';
        
        debugLog("Profile data prepared", [
            'fields_count' => count($cleanProfile),
            'employee_name' => $cleanProfile['Emp_name']
        ]);

        sendResponse('success', 'Profile loaded successfully.', [
            'profile' => $cleanProfile,
            'last_updated' => date('Y-m-d H:i:s')
        ]);
        
    } else {
        debugLog("Profile not found");
        sendResponse('error', 'Employee profile not found.');
    }

} catch (Exception $e) {
    debugLog("Exception occurred", [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    sendResponse('error', 'An error occurred while loading profile: ' . $e->getMessage());
    
} finally {
    // Clean up
    if (isset($profileStmt)) {
        $profileStmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?>