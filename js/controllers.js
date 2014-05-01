angular.module('dailynk.controllers', [])

.controller('dailynkCtrl', function($scope, $timeout, $ionicSideMenuDelegate, $filter) {

	console.log("Creating dailynkCtrl");

	/* Initializing UI */
	$scope.initUI = function() {
		$scope.UIproperty = {
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight
		};
	};

	/* Initializing DB */
	$scope.initDB = function() {
		$scope.db = (localStorage.getItem("db") !== null) ?  angular.fromJson(localStorage.getItem("db")) : {} ;
		$scope.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		$scope.doWeekView();
	};

	$scope.getNewLink = function() {
		return {
			id: "",
			oldId: "",
			title: "",
			days: [false, false, false, false, false, false, false],
			favorite: false,
		};
	}

	/* Initializing App */
	$scope.initApp = function() {
		
		$scope.newLink = $scope.getNewLink();

		$scope.itemButtons = [ 
			{ 
				text: 'Edit', 
				type: 'button button-energized', 
				onTap: function(item) { 
					$scope.editLink(item);
				} 
			}, 
			{ 
				text: 'Delete', 
				type: 'button button-assertive', 
				onTap: function(item) { 
					$scope.deleteLink(item);
				} 
			},
		];
		
		var d = new Date();
		// 0 = Monday, 1 = Tuesday ...
		$scope.selectedDay = (d.getDay() - 1);
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];

	};

	$scope.doWeekView = function() {

		$scope.weekView = [[],[],[],[],[],[],[]];
		var links = Object.keys($scope.db);
		
		// Cicle through links
		for (var ii=0; ii<links.length; ii++) {
			var link = $scope.db[links[ii]];
			// Cicle through days
			for (var jj=0; jj<link.days.length; jj++) {
				if (link.days[jj]) {
					$scope.weekView[jj].push({
						id: links[ii],
						title: link.title
					});
				}
			}
		}
	}



	$scope.onresize = function() {
		console.log("Resizing");
		$scope.UIproperty = {
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight
		};
		$timeout(function() { $scope.$apply() });
	};

	/* After tapping on plus icon */
	$scope.addLink = function() {

		// Clean newLink object
		$scope.newLink = $scope.getNewLink();
		// Show form
		$scope.toggleRight();

	};

	/* Toggle right and show form for editing link */
	$scope.editLink = function(item) {
		var link = $scope.db[item.id];
		$scope.newLink.oldId = item.id;
		$scope.newLink.id = item.id;
		$scope.newLink.title = link.title;
		$scope.newLink.days = link.days;
		$scope.newLink.favorite = link.favorite;
		$scope.toggleRight();
	};

	$scope.deleteLink = function(item) {
		var itemIndexToDelete = 0;
		for (var ii = 0; ii < $scope.selectedDayLinks.length; ii++) {
			if (item.id == $scope.selectedDayLinks[ii].id) itemIndexToDelete = ii;
		}
		$scope.selectedDayLinks.splice(itemIndexToDelete, 1);
		// Update DB
		$scope.db[$scope.selectedDay]  = $scope.selectedDayLinks;
		// Update storage
		localStorage.setItem($scope.selectedDay, angular.toJson( $scope.db[$scope.selectedDay] ));
	};

	// Add or edit link
	$scope.saveLink = function() {

		// Check if editing
		if ($scope.newLink.oldId != "") {
			delete $scope.db[$scope.newLink.oldId]
		}
		// Update scope
		var newLink = {
			title: $scope.newLink.title, 
			days: $scope.newLink.days,
			favorite: $scope.newLink.favorite,
		};
		
		// Update DB
		$scope.db[$scope.newLink.id] = newLink;
		// Update storage
		localStorage.setItem("db", angular.toJson($scope.db));
		// Clean new Link
		$scope.newLink = $scope.getNewLink();

		// Update View
		$scope.doWeekView();

		$scope.toggleRight();

	};

	// Open Link In App Browser
	$scope.openLink = function(url, event) {

		// Check if http:// missing
		var url = url.indexOf("http://") == -1 ? "http://" + url : url;
		$scope.wRef = window.open(url, "_blank", "location=no");

		// Change style
		var item = angular.element(event.currentTarget).addClass("visited");

	};

	$scope.chooseDay = function(day) {
		$scope.selectedDay = day;
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];
		$scope.toggleLeft();
	}

	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.toggleRight = function() {
		$ionicSideMenuDelegate.toggleRight();
	};

	/* At the end, init application */
	$scope.initUI();
	$scope.initDB();
	$scope.initApp();
	window.onresize = $scope.onresize;

	/* Utility */
	window.scope = $scope;
});
