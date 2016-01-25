<?php
    session_start();
    error_reporting(E_ALL);
    ini_set('display_errors','1');
    
    // if user does not exist, then create it
    // add login to log
    require_once 'libraries/meekrodb.2.2.class.php';
    DB::$user = 'opencycletaxi_n';
    DB::$password = 'qiTGVZUZ';
    DB::$dbName = 'opencycletaxi_n';

    if(isset($_POST["login"]) && ($_POST["login"]!="")) {
      $login = $_POST["login"];
      $code = $_POST["code"];
      // do regex on login to figure out if it's a number or email


    }
?>
<!DOCTYPE html>

<html>
<head>
    <title>Page Title</title>
    <meta charset="utf-8">
</head>

<body>



</body>
</html>
