<?php
	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Methods: PUT, GET, POST, OPTIONS");
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
	  header('Access-Control-Max-Age: 86400');
	  http_response_code(204);
	  exit;
	}
	ini_set('display_errors', 1);
	error_reporting(E_ALL);


	set_error_handler (fn($errno, $errstr, $errfile, $errline) => response(false, $errstr));
	mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

	/////////////////////////////////////////////////////////////////////////////////////////////////
	// EDIT SQL CONNECTION HERE
	/////////////////////////////////////////////////////////////////////////////////////////////////
	$mysqli = mysqli_connect("example.lima-db.de:3306", "USER123456", "PASSWORD123456", "db_123456_1");
	$mysqli->set_charset("utf8mb4");

	
	// Daten-Quelle priorisieren: POST-Form > GET
	$_PL = [];
	if (!$_PL && $_POST)   $_PL = $_POST;
	if (!$_PL && $_GET)    $_PL = $_GET;
	$f = $_PL['f'] ?? null;

	switch($f) {
		case 'uploadFormationBilder':
			$json = $_POST['json'];
			$sql = "INSERT INTO Formation_Bilder2(pairs, team, bilder) VALUES({$_POST['pairs']}, '{$_POST['team']}', '$json')";
			//response(false, $sql);
			query($sql);
			response(true, $mysqli->insert_id);
		case 'formationBilder':
			$team = isset($_PL['team']) ? $mysqli->escape_string($_PL['team']) : '';
			$sql = "SELECT * FROM Formation_Bilder WHERE team='$team' ORDER BY saved DESC LIMIT 1";
			$plan = query($sql)->fetch_array(MYSQLI_ASSOC);
			$plan['bilder'] = json_decode($plan['bilder'], true);
			$plan['pairs'] = intval($plan['pairs']);
			$plan['pairs'] = intval($plan['pairs']);
			response(true, $plan);
		default:
			response(false, "Unknown function: $f");
	}


	function response($success, $data) {
	  echo json_encode([
	    'success' => $success,
	    'data' => $data
	  ], JSON_UNESCAPED_UNICODE);
	  die();
	}


	function query($sql) {
		global $mysqli;
		$text = $mysqli->escape_string($sql);
		$logSql = "INSERT INTO LOG(msg) VALUES ('$text')";
		$mysqli->query($logSql);
		return $mysqli->query($sql);
	}

?>
