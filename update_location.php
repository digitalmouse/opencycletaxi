<?php
require_once 'libraries/meekrodb.2.2.class.php';
DB::$user = 'opencycletaxi_n';
DB::$password = 'qiTGVZUZ';
DB::$dbName = 'opencycletaxi_n';

$sql = "UPDATE opencycletaxi_n.user_details
        SET location = GEOMFROMTEXT('POINT(".$_GET['lat']." ".$_GET['long'].")', 0 )
        WHERE user_details.id=".$_GET['userID'];
$results = DB::query($sql);

// we stuffed updated driver location into the database, so now
// let us go generate the json file used by map.js
// -jimm 10.jan.2014
header('Location:http://m.opencycletaxi.net/generate_json.php');
?>
