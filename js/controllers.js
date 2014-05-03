angular.module('dailynk.controllers', [])

.controller('dailynkCtrl', function($scope, $timeout, $ionicSideMenuDelegate, $ionicListDelegate, $filter) {

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
			isDayValid: "",	// for form validation (required) ["" : "valid"]
			favorite: false,
		};
	}

	/* Initializing App */
	$scope.initApp = function() {
		
		$scope.newLink = $scope.getNewLink();
		
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

	/* Check one day at least for saving link */
	$scope.checkValidationDays = function() {
		var check = false;
		for (var ii=0; ii<$scope.newLink.days.length; ii++) {
			if ($scope.newLink.days[ii]) {
				check = true;
				break;
			}
		}
		$scope.newLink.isDayValid = check ? "valid" : "";
	}

	/* After tapping on plus icon */
	$scope.addLink = function() {

		// Clean newLink object
		$scope.newLink = $scope.getNewLink();
		// Show form
		$scope.toggleRight();

	};

	$scope.closeOptionButtons = function() {
		$ionicListDelegate.$getByHandle("link-list-handler").closeOptionButtons();
	}

	/* Toggle right and show form for editing link */
	$scope.editLink = function(item) {
		// Close option buttons
		$scope.closeOptionButtons();

		var link = $scope.db[item.id];
		$scope.newLink.oldId = item.id;
		$scope.newLink.id = item.id;
		$scope.newLink.title = link.title;
		$scope.newLink.days = link.days;
		$scope.newLink.favorite = link.favorite;
		$scope.toggleRight();
	};

	/* When deleting, remove only day selected check */
	$scope.deleteLink = function(item) {

		$scope.db[item.id].days[$scope.selectedDay] = false;
		
		// If all days are false delete link
		var checkActive = false;
		for (var ii=0; ii<$scope.days.length; ii++) {
			if ($scope.db[item.id].days[ii]) checkActive = true;
		}
		if (!checkActive) delete $scope.db[item.id];

		// Close option buttons
		$scope.closeOptionButtons();

		// Update storage
		$scope.updateStorage();

		// Update View
		$scope.doWeekView();
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];

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
		$scope.updateStorage();
		
		// Clean new Link
		$scope.newLink = $scope.getNewLink();

		// Update View
		$scope.doWeekView();
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];

		$scope.toggleRight();

	};

	// Update storage
	$scope.updateStorage = function() {
		localStorage.setItem("db", angular.toJson($scope.db));
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
