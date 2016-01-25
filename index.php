<?php ?>
<!DOCTYPE html>

<html>
    <head>
        <title>opencycletaxi mobile page</title>
        <meta charset="utf-8">
        <meta name="viewport" content="user-scalable=yes, initial-scale=1.0, maximum-scale=2.0, width=device-width">

        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="styles/map.css" />
        <script src="js/bootstrap.min.js"></script>
    </head>

    <body>
        <div class="wrapper">
            <h2>opencycletaxi.net</h2>
            <!-- <div class="formCenter">
               <form method="post" action="map.php">
                  <input class="input_text" type="tel" name="mobile" placeholder="Enter mobile number">
                  <span class="footnote">please include country code prefix<br>(+45 for Denmark, for example)</span>
                  <h2 class="or">----- OR -----</span>
                  <input class="input_text" type="email" name="email" placeholder="Enter email" value=""><br>
                                      <input type="submit" value="Search for a Cycle Taxi">
               </form>
            </div> -->
            <h3 class="or" style="color: red;">** DEMO WEBSITE **<br>not ready for real world testing until Fall 2015<br>no data retained at this time</h3>

            <form method="post" action="map.php">
                <div class="row">

                    <div class="col-lg-6">
                        <div class="input-group">
                            <input class="form-control" type="tel" name="contact" placeholder="Enter your mobile number or email" value="" style="width:275px;">
                            <span class="input-group-btn">
                                <button class="btn btn-default" type="submit">Go!</button>
                            </span>
                        </div><!-- /input-group -->
                    </div><!-- /.col-lg-6 -->
                </div><!-- /.row -->

            </form>
        </div>

    </body>
</html>
<?php
?>
