<?php
require_once 'libs/meekrodb.2.2.class.php';
DB::$user = 'opencycletaxi_n';
DB::$password = 'qiTGVZUZ';
DB::$dbName = 'opencycletaxi_n';

$results = DB::query("UPDATE  `opencycletaxi_n`.`user_details` SET  `location` = GEOMFROMTEXT(  'POINT(55.6790120541973 12.5928425788879)', 0 ) WHERE `user_details`.`id`=1");


?>
