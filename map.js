/* -------------------------------------------------------------------------------------------*/
// callback functions that handles success and errors on geolocation,
// and fall-back on a less accurate position if necessary.
/* -------------------------------------------------------------------------------------------*/

/* -------------------------------------------------------------------------------------------*/
// when we are successful at getting a position, we do all our map creation work magic  here
/* -------------------------------------------------------------------------------------------*/

// create a true public variable as an outer scope object
// used to pass reverse geolocation address to the sidebar content
// (sms body text)  credit to Thomas Blom Hansen for the tip
// -jimm 18.dec.2013

var communal = {};

function successCallback(position) {
    $('#taxi_map').append('<p class="waitformap">Yay! I got your position.<br>Let me try to load the map...</p>');

    var userLatitude = position.coords.latitude,
            userLongitude = position.coords.longitude,
            accuracy = position.coords.accuracy,
            personIcon = L.Icon.Label.extend({
                options: {
                    iconUrl: 'images/smiley_happy.png',
                    shadowUrl: null,
                    iconSize: new L.Point(36, 36), // size of the icon
                    iconAnchor: new L.Point(18, 18), // point of the icon which will correspond to marker's location
                    labelAnchor: new L.Point(15, 5),
                    wrapperAnchor: new L.Point(15, 12),
                    labelClassName: 'personIcon'
                }
            }),
            map = L.map('taxi_map');

    var rickshawIcon = L.Icon.Label.extend({
        options: {
            iconUrl: 'images/rickshaw2.png',
            shadowUrl: null,
            iconSize: new L.Point(36, 36), // size of the icon
            iconAnchor: new L.Point(0, 0), // point of the icon which will correspond to marker's location
            labelAnchor: new L.Point(30, -5),
            wrapperAnchor: new L.Point(15, 12),
            labelClassName: 'rickshawIcon'
        }
    });

    // quickie function to capitalize the first letter of strings (such as the driver name)
    function capFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //  playing with watercolor map.  looks pretty, but not very informative
    //    var layer = new L.StamenTileLayer('watercolor');
    //    map.addLayer(layer); */

    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: 'Accuracy: ' + accuracy + ' meters -  &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // var oms = new OverlappingMarkerSpiderfier(map); // future feature

    // add a marker in the given location, attach some pop-up content to it and open the pop-up
    //L.marker([userLatitude, userLongitude], {icon: greenIcon}).addTo(map).bindPopup('you are here');

    // sidebar creation
    var sidebar = L.control.sidebar('sidebar', {
        position: 'right'
    });

    // start the sidebar in it's hidden position first
    map.on('click', function () {
        sidebar.hide();
    });

    map.addControl(sidebar);

    // initialize a set of bounds arrays for use in scaling the map to the screen
    var boundry_lats = [],
            boundry_longs = [];

    //console.log("adding client to bounds array...");
    //bounds.push( [userLatitude, userLongitude] );

    // quick-n-dirty ajax function to allow me to send data to other php files without leaving this page
    // primarily for stuffing the driver's updated location into the database "on the fly" before
    // generating the map of drivers, and updating the customer-base heatmap.  timing will be tricky here
    // -jimm 10.jan.2014
    function sendDataToPHPfile(url) {
        var request = window.ActiveXObject ?
                new ActiveXObject('Microsoft.XMLHTTP') :
                new XMLHttpRequest;

        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                request.onreadystatechange = true;
            }
        };

        request.open('GET', url, true);
        request.send(null);
    }

    // find out if current user is a driver
    //console.log("userType is..." + userType);

    userType = "customer";

    if (userType !== "driver") {
        // add the customer's location
        L.marker([userLatitude, userLongitude], {icon: new personIcon()})
                .addTo(map).bindPopup("This is you!  <a href='edit.php?userid=1'>Edit profile</a>");
        // .bindPopup(userLatitude + ' ' + userLongitude);  // for testing
        console.log("- put customer on the map...");


        // add customer to the map boundries array
        boundry_lats.push(userLatitude);
        boundry_longs.push(userLongitude);
        // add user position to the heatmap database
        //var updateHeatmap = "heatmap_location.php?lat="+userLatitude+"&long="+userLongitude;
        //console.log(updateDriverLocation);
        //sendDataToPHPfile(updateHeatmap);
    } else {
        // otherwise let's use the current coordinates to auto update the driver's position
        //var updateDriverLocation = "update_location.php?userID="+userID+"&lat="+userLatitude+"&long="+userLongitude;
        //console.log(updateDriverLocation);
        //sendDataToPHPfile(updateDriverLocation);
    }


    // construct the reverse lookup of the customer lat/long
    // for insertion into the ride booking buttons on the driver profiles
    $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + userLatitude + '&lon=' + userLongitude + '&zoom=18&addressdetails=1', function (reversed) {
        communal.user_location = reversed.address.road + ' ' + reversed.address.house_number;
        console.log("grabbed reverse address lookup...");
        buildDriverProfile();
    });

    function buildDriverProfile() {
        $.getJSON("./drivers.json", function (data) {
            var geojson = L.geoJson(data, {
                onEachFeature: function (driver, layer) {
                    // construct sidebar content with data from the json file

                    // use this later?
                    //if(driver.properties.status == 'available') {
                    //	var status_style = 'status_green';
                    //} else {
                    //	var status_style = 'status_grey';
                    //}

                    // var driver_status = '<br><span class="' + status_style + '">' + driver.properties.status + '</span>';

                    // calculate a rough Estimated Time of Arrival (eta) and round to one decimal place
                    // -jimm 18.dec.2013
                    var me = new L.LatLng(userLatitude, userLongitude);
                    var driver_position = new L.LatLng(driver.geometry.coordinates[1], driver.geometry.coordinates[0]);
                    var driverSpeed = (15 * 1000);  // in meters per second  (15000 = 15 kph)
                    var minutes = 60;  // makes sure the result is in minutes
                    var trafficPadding = 6; // an arbitrary number of minutes to add in-case of traffic problems during transit

                    var eta = Math.round((me.distanceTo(driver_position) / driverSpeed) * minutes) + trafficPadding;

                    console.log("------- test driver for range from client...");

                    if (me.distanceTo(driver_position) < 6000) {
                        console.log("distance for driver is less than 6000 - " + driver.properties.name + ": " + me.distanceTo(driver_position) + " [" + driver.geometry.coordinates[1] + "," + driver.geometry.coordinates[0] + "]");
                        var sidebar_content =
                                '<div class="profile">' +
                                '<div id="top_side">' +
                                '<strong>' + capFirstLetter(driver.properties.name) + '</strong><br><br>' +
                                '</div>' +
                                '<div id="bottom_side">' +
                                '<img class="profile_image" src="' + driver.properties.photo + '" /><br>' +
                                '<input type="button" class="profile_button" value="SMS" onclick="location.href=\'sms:' + driver.properties.mobile
                                + '?body=I would like a ride from ' + communal.user_location + ' to: \';"> ' +
                                '<input type="button" class="profile_button" value="EMAIL" onclick="location.href=\'mailto:' + driver.properties.email
                                + '?subject=cycle-taxi ride&body=I would like to schedule a ride from '
                                + communal.user_location + ' to (insert destination here) on (insert date/time here) \';"> ' +
                                '<input type="button" class="profile_button" value="REVIEW" onclick="location.href=\'review.php?cmd=makeReview&driverID=' + driver.properties.id + '\'">' +
                                '<br>options: ' + driver.properties.options + '<br>' +
                                'rating: ' + driver.properties.rating + '<br>' +
                                'feedback: ' + driver.properties.reviews + '<br>' +
                                '</div>' +
                                '</div>';

                        layer.setIcon(new rickshawIcon({labelText: '<b>' + capFirstLetter(driver.properties.name) + '</b><br><span style="color:red;">' + eta + ' minutes</span>'}));
                        //
                        layer.on('click', function () {
                            sidebar.setContent(sidebar_content);
                            sidebar.show();
                        });

                        boundry_lats.push(driver.geometry.coordinates[1]);
                        boundry_longs.push(driver.geometry.coordinates[0]);
                        console.log("- putting " + driver.properties.name + " on the map...");
                        console.log("**driver pushed onto lat/log arrays...");
                    } else {
                        console.log("WARNING distance for driver greater than 6000! " + driver.properties.name + ": " + me.distanceTo(driver_position) + " [" + driver.geometry.coordinates[1] + "," + driver.geometry.coordinates[0] + "]");
                        //boundry_lats.pop(driver.geometry.coordinates[1]);
                        //boundry_longs.pop(driver.geometry.coordinates[0]);
                        console.log("**driver not added!");
                    }
                }

            });
            for (counter = 0; counter < boundry_lats.length; counter++) {
                // loop through the coordinate arrays and spit them out
                console.log(counter + ":  " + boundry_lats[counter] + ", " + boundry_longs[counter]);
            }

            /* --------------------------------------------------------------*/
            // .getBounds method appears to be ignoring the client coordinates,
            // so I replaced it with a bit of old_school min/max discovery until I
            // have time to file a leaflet/geoJSON bug report with suitable examples
            // -jimm 11.dec.2013

            // var driver_bounds = geojson.getBounds(bounds);

            // loop through all the coordinates and find the north-eastern boundaries
            // and south-western boundaries then scale the map accordingly,
            // fitting customer and drivers on the map

            var max_north = Math.max.apply(Math, boundry_lats);
            var min_south = Math.min.apply(Math, boundry_lats);
            var max_east = Math.max.apply(Math, boundry_longs);
            var min_west = Math.min.apply(Math, boundry_longs);


            var southWest = new L.LatLng(min_south, min_west),
                    northEast = new L.LatLng(max_north, max_east),
                    bounds = new L.LatLngBounds(southWest, northEast);

            map.fitBounds(bounds, {padding: [40, 40]});
            console.log("fit everyone on the screen");

            geojson.addTo(map);
            console.log("render map!");

        });
    }
}




/* -------------------------------------------------------------------------------------------*/
//  if GPS detection fails, fallback to mobile network/wifi
/* -------------------------------------------------------------------------------------------*/

function errorCallback_on_highAccuracy(error) {
    console.log("inside errorCallback_on_highAccuracy(error)");

    if (error.code === error.TIMEOUT) {
        // try low accuracy location discovery and wait 10 seconds
        $('#taxi_map').append("<p class='waitformap'>Well, darn.  Now attempting to get<br>low accuracy location via mobile network...</p>");
        navigator.geolocation.getCurrentPosition(
                successCallback,
                errorCallback_on_lowAccuracy,
                {
                    maximumAge: 600000, timeout: 15000, enableHighAccuracy: false
                });
        return;
    }

    var msg = "<p class='waitformap'>Whoops! Can't get your location via<br>high accuracy attempt (GPS). Error = ";
    if (error.code === 1)
        msg += "PERMISSION_DENIED";
    else if (error.code === 2)
        msg += "POSITION_UNAVAILABLE";
    msg += ", msg = " + error.message + "</p>";

    $('#taxi_map').append(msg);
}

function errorCallback_on_lowAccuracy(error) {
    console.log("inside errorCallback_on_lowAccuracy(error)");
    var msg = "<p class='waitformap'>Whoops! Can't get your location via<br>low accuracy attempt either!<br>\n\
                Please find either a clear GPS/mobile/wifi signal<br>and refresh the page.<br>Error = ";
    if (error.code === 1)
        msg += "PERMISSION_DENIED";
    else if (error.code === 2)
        msg += "POSITION_UNAVAILABLE";
    else if (error.code === 3)
        msg += "TIMEOUT";
    msg += ", msg = " + error.message + "</p>";

    $('#taxi_map').append(msg);
}

var options = {
    maximumAge: 600000,
    timeout: 15000,
    enableHighAccuracy: true
};
console.log("initializing navigator.geolocation.watchPosition");

navigator.geolocation.watchPosition(
        successCallback,
        errorCallback_on_highAccuracy,
        options
        );
