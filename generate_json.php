<?php
error_reporting(E_ALL);
ini_set('display_errors','1');

require_once 'libraries/meekrodb.2.2.class.php';

DB::$user = 'opencycletaxi_n';
DB::$password = 'qiTGVZUZ';
DB::$dbName = 'opencycletaxi_n';
$json_sql = "
        SELECT users.user_id    AS id,
        user_details.type       AS type,
        users.user_name         AS name,
        user_details.image      AS image,
        user_details.mobile     AS mobile,
        user_details.options    AS options,
        users.user_email        AS email,
        user_details.status     AS status,
        X(location)             AS longitude,
        Y(location)             AS latitude
        FROM users, user_details
        WHERE  users.user_id        = user_details.id AND
        user_details.type           = 'driver'";

$results = DB::query($json_sql);

function check_for_last_key($results, $key) {
    end($results);
    return $key === key($results);
}

// build collection of drivers into a json file
// that we can suck into our leaflet map
$drivers =
  '{
  "type": "FeatureCollection",
  "features":
  [';

foreach ($results as $key => $row)
{
    $review_output = "";
    $rating_output = "";
    $temp_rating = 0;

    $reviews = DB::query("SELECT review, rating FROM user_reviews WHERE id=".$row['id']);
    foreach ($reviews as $key2 => $review)
    {
        $review_output .= "- ".$review['review']."<br>";
        $temp_rating += $review['rating'];
    }
    if($temp_rating != 0) {
        $rating_output = $temp_rating / count($reviews);
    } else {
        $rating_output = 0;
    }
$drivers .=
  '
    {
      "type": "Feature",
      "properties": {
        "id": "'.$row['id'].'",
        "type": "'.$row['type'].'",
        "name": "'.$row['name'].'",
        "photo": "'.$row['image'].'",
        "mobile": "'.$row['mobile'].'",
        "email": "'.$row['email'].'",
        "options": "'.$row['options'].'",
        "status": "'.$row['status'].'",
        "rating": "'.$rating_output.' out of 4 ('.count($reviews).' reviews posted)",
        "reviews": "'.$review_output.'"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          '.$row['latitude'].',
          '.$row['longitude'].'
        ]
      }';
  // if this is not the last driver, stick a comma ',' on the end of that group
  if (check_for_last_key($results, $key)) {
    $drivers .= '
    }
  ';
  } else {
    $drivers .= '
    },';
  }



}

$drivers .= ']
}';

//header('Content-Type: application/json;charset=utf-8');
$fp = fopen('drivers.json', 'w');
fwrite($fp, $drivers);
fclose($fp);

?>
