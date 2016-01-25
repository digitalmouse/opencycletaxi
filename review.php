<?php
    // session_start();
    error_reporting(E_ALL);
    ini_set('display_errors','1');

    require_once 'libraries/meekrodb.2.2.class.php';
    DB::$user = 'opencycletaxi_n';
    DB::$password = 'qiTGVZUZ';
    DB::$dbName = 'opencycletaxi_n';

    switch ($_GET['cmd']) {
        case 'sendReview':
            // send review to database for this user
            DB::insert('user_reviews', array('id' => $_GET['driverID'], 'review' =>  $_GET['review'], 'rating' => $_GET['rating']));
            $output = "<br>Review sent. Thanks!<br><br>";
            break;

        case 'makeReview':
            // create output review form here
            $output =  '<form action="review.php">';
            $output .= '  <strong>Enter a rating between 1 and 4.</strong><br>';
            $output .= '  &nbsp;&nbsp;1 - Terrible.<br>';
            $output .= '  &nbsp;&nbsp;2 - Could be better/Needs improvement.<br>';
            $output .= '  &nbsp;&nbsp;3 - Satisfied with the ride.<br>';
            $output .= '  &nbsp;&nbsp;4 - Excellent!<br>';
            $output .= '  <input type="number" class="rating" name="rating" min="1" max="4"><br>';
            $output .= '  <strong>Enter comments below:</strong><br>';
            $output .= '  <textarea rows="5" cols="35" name="review" placeholder="Review text here" autofocus></textarea><br>';
            $output .= '  The comment that will lead to the best improvement of our service, will receive a voucher for a free cycletaxi ride!';
            $output .= '  <input type="hidden" name="cmd" value="sendReview">';
            $output .= '  <input type="hidden" name="driverID" value="'.$_GET["driverID"].'">';
            $output .= '  <input type="submit" value="Submit Review">';
            $output .= '</form>';
            break;


        default:
			$output = "i got nothing boss, try again";
    }

?>
<!DOCTYPE html>

<html>
<head>
    <title>Review</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.css" />
    <link rel="stylesheet" href="/styles/map.css" />
    <script type="text/javascript" src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js"></script>
    <style>
        /* trying to override jquery styling of the buttons */
        .ui-input-text .ui-body-c input.rating {
            width: 20px;
        }
    </style>
</head>

<body>

<div data-role="page" id="page_mod_to_correct_remote_jquery_mobile_styling_fuckup">
   <div id="content">
      <?php echo $output; ?>
   </div>

   <div data-role="navbar">
      <ul>
         <li><a href="map.php">Back to Map</a></li>
      </ul>
   </div>


</div>




</body>
</html>
