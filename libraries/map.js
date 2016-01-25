/* -------------------------------------------------------------------------------------------*/
// callback functions that handles success and errors on geolocation,
// and fall-back on a less accurate position if necessary.
/* -------------------------------------------------------------------------------------------*/

/* -------------------------------------------------------------------------------------------*/
// when we are successful at getting a position, we do all our map creation work inside here
/* -------------------------------------------------------------------------------------------*/

function successCallback(position) {
	$('#map').append('<p class="waitformap">map loading...</p>');
	var customerLatitude = position.coords.latitude,
		customerLongitude = position.coords.longitude,
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
		map = L.map('map');

	var rickshawIcon = L.Icon.Label.extend({
		options: {
			iconUrl: 'images/rickshaw.png',
			shadowUrl: null,
			iconSize: new L.Point(36, 36), // size of the icon
			iconAnchor: new L.Point(0, 0), // point of the icon which will correspond to marker's location
			labelAnchor: new L.Point(30, -5),
			wrapperAnchor: new L.Point(15, 12),
			labelClassName: 'rickshawIcon'
		}
	});

	//  playing with watercolor map.  looks pretty, but not very informative
	//    var layer = new L.StamenTileLayer('watercolor');
	//    map.addLayer(layer); */

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		 attribution: 'Accuracy: ' + accuracy + ' meters -  &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	 /* var oms = new OverlappingMarkerSpiderfier(map); */

	// add a marker in the given location, attach some pop-up content to it and open the pop-up
	//L.marker([customerLatitude, customerLongitude], {icon: greenIcon}).addTo(map).bindPopup('you are here');

	// sidebar creation
	var sidebar = L.control.sidebar('sidebar', {
		 position: 'right'
	});

	map.on('click', function () { sidebar.hide(); });

	map.addControl(sidebar);

	// here is where the user is located
	L.marker([customerLatitude, customerLongitude], { icon: new personIcon() })
	  .addTo(map)
	  .bindPopup(customerLatitude + ' '+ customerLongitude);

	// reverse lookup of customer address for later inserting into SMS and email booking text templates
	// http://nominatim.openstreetmap.org/reverse?format=json&lat='+customerLatitude+'&lon='+customerLongitude+'&zoom=18&addressdetails=1

	console.log("creating bounds array...");
	var bounds = [];
	console.log("adding client to bounds array...");
	bounds.push( [customerLatitude, customerLongitude] );

	$.getJSON("./results.json", function(data) {
		var geojson = L.geoJson(data, {
			onEachFeature: function (driver, layer) {
				// construct sidebar content with data from the json file
				if(driver.properties.status == 'available') {
					var status_style = 'status_green';
				} else {
					var status_style = 'status_grey';
				}
				var driver_status = '<br><span class="'+status_style+'">'+driver.properties.status+'</span>';
				var sidebar_content =
						'<div class="profile">'+
							'<div id="left_side">'+
								'<strong>'+driver.properties.name+'</strong> is '+driver.properties.status+'<br>'+
							'</div>'+
							'<div id="right_side">'+
								'<img class="profile_image" src="'+driver.properties.photo+'" /><br>'+
								'<input type="button" value="Book a ride" onclick="location.href=\'smsto:'+driver.properties.mobile
									+'?body=I would like a ride from near (current location) to ___ at ___\';"><br>'+
								'<a href="mailto:'+driver.properties.email+'">email '+driver.properties.name+'</a><br>'+
								'options: '+driver.properties.options+'<br>'+
								'rating: '+driver.properties.rating+'<br>'+
								'commentary:<br>'+driver.properties.commentary+'<br>'+
							'</div>'+
						'</div>';

				//layer.setIcon(new rickshawIcon({ labelText: '<b>'+driver.properties.name+'</b>'+driver_status }) );
				layer.setIcon(new rickshawIcon({ labelText: '<b>'+driver.properties.name+'</b><br>'+driver.geometry.coordinates[1]+' '+ driver.geometry.coordinates[0] }) );
				//layer.setIcon(new rickshawIcon({ labelText: '<b>'+driver.properties.name.substr(0,driver.properties.name.search(' '))+'</b> '+driver_status }) );
				layer.on('click', function () {
					sidebar.setContent( sidebar_content );
					sidebar.show();
				});

				console.log("adding driver to bounds array...");
				bounds.push( [driver.geometry.coordinates[1], driver.geometry.coordinates[0]] );
			}

		});

		console.log("what is in bounds?");
		console.log(bounds);

		var driver_bounds = geojson.getBounds(bounds);

		console.log("what is in driver_bounds?");
		console.log(driver_bounds);

		map.fitBounds(driver_bounds, {padding: [10, 10]});

		geojson.addTo(map);
	 });


	// loop through all the coordinates and find the north-eastern boundaries
	// and south-western boundaries then scale the map accordingly,
	// fitting customer and drivers on the map
	// replace with array from database


		//map.fitBounds([
		//				[customerLatitude, customerLongitude],
		//				[55.680493330074086, 12.585965394973755]
		//			]);
}

function errorCallback_on_lowAccuracy(position) {
	var msg = "<p class='waitformap'>Can't get your location via low accuracy attempt (mobile network). Error = ";
	if (error.code == 1)
		 msg += "PERMISSION_DENIED";
	else if (error.code == 2)
		 msg += "POSITION_UNAVAILABLE";
	else if (error.code == 3)
		 msg += "TIMEOUT";
	msg += ", msg = " + error.message + "</p>";

	$('#map').append(msg);
}


function errorCallback_on_highAccuracy(position) {

	if (error.code === error.TIMEOUT) {
		 // Attempt to get GPS location timed out after 5 seconds,
		 // then try low accuracy location
		 $('#map').append("<p class='waitformap'>Attempting to get low accuracy location via mobile network...</p>");
		 navigator.geolocation.getCurrentPosition(
			  successCallback,
			  errorCallback_on_lowAccuracy,
			  {
				  maximumAge: 600000, timeout: 10000, enableHighAccuracy: false
			  });
		 return;
	}

	var msg = "<p class='waitformap'>Can't get your location via high accuracy attempt (GPS). Error = ";
	if (error.code == 1)
		 msg += "PERMISSION_DENIED";
	else if (error.code == 2)
		 msg += "POSITION_UNAVAILABLE";
	msg += ", msg = " + error.message + "</p>";

	$('#map').append(msg);
}


/* -------------------------------------------------------------------------------------------*/
// get the position, trap success, and offer up switching to lower accuracy on error
/* -------------------------------------------------------------------------------------------*/

var options = {
	maximumAge: 600000,
	timeout: 5000,
	enableHighAccuracy: true
};

navigator.geolocation.watchPosition(
	successCallback,
	errorCallback_on_highAccuracy,
	options
);
