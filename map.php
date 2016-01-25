<?php
require_once 'libraries/is_email.php';
require_once 'libraries/meekrodb.2.2.class.php';
DB::$user = 'opencycletaxi_n';
DB::$password = 'qiTGVZUZ';
DB::$dbName = 'opencycletaxi_n';

function getUserIP() {
    $client = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote = $_SERVER['REMOTE_ADDR'];

    if (filter_var($client, FILTER_VALIDATE_IP)) {
        $ip = $client;
    } elseif (filter_var($forward, FILTER_VALIDATE_IP)) {
        $ip = $forward;
    } else {
        $ip = $remote;
    }

    return $ip;
}

$user_ip = getUserIP();

// check the mobile number and email address
// if one of them is not empty, use it for our queries
// and stuff the visitor into a log, too
//

if(isset($_POST['contact'])){

   $result = is_email($_POST['contact'], true, true);

   if ($result === ISEMAIL_VALID) {
      echo $_POST['contact'] . " looks like a valid email address, let's check for existing user...";
      $user_data = DB::queryFirstRow("SELECT * FROM users WHERE users.email = '" . $_POST['contact'] . "' LIMIT 1");
   } else {
      $user_data = DB::queryFirstRow("SELECT * FROM users WHERE users.mobile = '" . $_POST['contact'] . "' LIMIT 1");
   }

   // add visitor to the log
   DB::insert('user_log', array(
      'contact'   => $_POST['contact'],
      'ipaddress' => $user_ip,
      'action'    => 'login'
      )
   );

} else {
   header("Location: http://opencycletaxi.net/index.php");
   die();
}
?>
<!DOCTYPE html>
<html>
    <head>
        <title>opencycletaxi.net</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
        <link rel="stylesheet" href="/libraries/Leaflet.iconlabel-master/src/Icon.Label.css" />
        <link rel="stylesheet" href="/libraries/leaflet-sidebar-master/src/L.Control.Sidebar.css" />
        <link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.css" />
        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="/styles/map.css" />
        <script>
            // I need to pass the user_id and user_type (driver/client) sessions to javascript for later use
            var userID = '<?php echo $user_data['id']; ?>';
            var userType = '<?php echo $user_data['type']; ?>';

        </script>
        <script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
        <script src="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js"></script>
        <script src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
        <script src="/libraries/Leaflet.iconlabel-master/src/Icon.Label.js"></script>
        <script src="/libraries/Leaflet.iconlabel-master/src/Icon.Label.Default.js"></script>
        <script src="/libraries/leaflet-sidebar-master/src/L.Control.Sidebar.js"></script>
        <script src="js/bootstrap.min.js"></script>

    </head>
    <body>
        <div data-role="page" id="page_mod_to_correct_remote_jquery_mobile_styling_fuckup">
            <!--   <div data-role="navbar" id="nav">
                  <ul>
                     <li><a href="edit.php"><?php echo "edit profile"; ?></a></li>
                  </ul>
               </div>-->

            <div id="sidebar">
                <!-- driver content appears here -->
            </div>
            <div id="customer_sidebar">
                <!-- customer content appears here -->
            </div>

            <div id="taxi_map">
                <p class="waitformap">Attempting to get your position:<br>starting with GPS,<br>then mobile network,<br>
                    then magic spells</p>
            </div>
        </div>
        <!-- let's start the magic  -->
        <script type="text/javascript" src="map.js"></script>
    </body>
</html>
