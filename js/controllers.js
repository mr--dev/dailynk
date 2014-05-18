angular.module('dailynk.controllers', [])

.controller('dailynkCtrl', function(
	$scope,
	$ionicPopup, 
	$timeout, 
	$ionicSideMenuDelegate, 
	$ionicListDelegate, 
	$filter) {

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
		$scope.settings = (localStorage.getItem("settings") !== null) ?  angular.fromJson(localStorage.getItem("settings")) : {} ;
		$scope.db = (localStorage.getItem("db") !== null) ?  angular.fromJson(localStorage.getItem("db")) : {} ;
		$scope.labelDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "All links"];
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
			visited: false,
		};
	}

	/* Initializing App */
	$scope.initApp = function() {
		
		$scope.newLink = $scope.getNewLink();
		
		var d = new Date();
		// 0 = Monday, 1 = Tuesday ...
		$scope.selectedDay = (d.getDay() == 0) ? 6:  (d.getDay() - 1);
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];

		// Check last day that dailynk has been opened
		if ($scope.selectedDay != $scope.settings.lastDayOpenedApp) {
			$scope.resetVisitedLink();
		}
		// Update last day opened app with today
		$scope.settings.lastDayOpenedApp = $scope.selectedDay;
		$scope.updateStorageSettings();

	};

	$scope.onresize = function() {
		console.log("Resizing");
		$scope.UIproperty = {
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight
		};
		$timeout(function() { $scope.$apply() });
	};

	/* Number of records stored */
	$scope.dbLength = function() {
		return Object.keys($scope.db).length;
	};

	/* Back in history */
	$scope.goBack = function() {
    history.back();
	};

	$scope.resetVisitedLink = function() {
		var links = Object.keys($scope.db);
		for (var ii=0; ii<links.length; ii++) {
			var link = $scope.db[links[ii]]; // for sake of readability
			if (link.visited) {
				// update on original object
				$scope.db[links[ii]].visited = false;
			}
		}
		$scope.updateStorageDb();
	};

	/* Seventh is for all day */
	$scope.doWeekView = function() {

		$scope.weekView = [[],[],[],[],[],[],[],[]];
		var links = Object.keys($scope.db);
		
		// Cicle through links
		for (var ii=0; ii<links.length; ii++) {
			var link = $scope.db[links[ii]];
			// Cicle through days
			for (var jj=0; jj<link.days.length; jj++) {
				if (link.days[jj]) {
					$scope.weekView[jj].push({
						id: links[ii],
						title: link.title,
						visited: link.visited
					});
				}
			}

			// Always push on seventh day - ALL
			$scope.weekView[7].push({
				id: links[ii],
				title: link.title,
				visited: link.visited
			});
		}
	}

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
		$scope.newLink.visited = link.visited;
		$scope.checkValidationDays();
		$scope.toggleRight();
	};

	/* When deleting, remove only day selected check */
	$scope.deleteLink = function(item) {

		// If selected day is ALL (7), then delete link, not day assignation
		if ($scope.selectedDay == 7) {

			delete $scope.db[item.id];
			
		} else {

			$scope.db[item.id].days[$scope.selectedDay] = false;
			
			// If all days are false delete link
			var checkActive = false;
			for (var ii=0; ii<$scope.days.length; ii++) {
				if ($scope.db[item.id].days[ii]) checkActive = true;
			}
			if (!checkActive) delete $scope.db[item.id];

		}

		// Close option buttons
		$scope.closeOptionButtons();

		// Update storage
		$scope.updateStorageDb();

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
			visited: $scope.newLink.visited
		};
		
		// Update DB
		$scope.db[$scope.newLink.id] = newLink;
		// Update storage
		$scope.updateStorageDb();
		
		// Clean new Link
		$scope.newLink = $scope.getNewLink();

		// Update View
		$scope.doWeekView();
		$scope.selectedDayLinks = $scope.weekView[$scope.selectedDay];

		$scope.toggleRight();

	};

	/* Update storage database */
	$scope.updateStorageDb = function() {
		localStorage.setItem("db", angular.toJson($scope.db));
	};
	$scope.updateStorageSettings = function() {
		localStorage.setItem("settings", angular.toJson($scope.settings));
	};


	/* Open Link  
	 * _self: opens in the Cordova WebView, 
	 * _blank: open in the InAppBrowser
	 * _system: open in the system web browser
	 */
	$scope.openLink = function(url, event) {

		// Set link visited (storage)
		$scope.db[url].visited = true;
		$scope.updateStorageDb();

		// Check if http:// missing
		var url = url.indexOf("http://") == -1 ? "http://" + url : url;
		$scope.wRef = window.open(url, "_system");

		// Change style
		var item = angular.element(event.currentTarget).addClass("visited");

	};

	/* @param day: day of the week, if -1 means all links */
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

	/* Ask for confirmation for clearing data */
	$scope.confirmClearData = function() {
		var title = "Clear data";
		var confirmPopup = $ionicPopup.confirm({
			title: title,
			template: "Are you sure you want to delete all your links?"
		});
		confirmPopup.then(function(res){
			if (res) {
				try {
					$scope.db = {};
					$scope.selectedDayLinks = [];
					$scope.doWeekView();
					$scope.updateStorageDb();
					var alertPopup = $ionicPopup.alert({
						title: title,
						template: "All data has been cleared."
					});
				} catch (e) {
					var alertPopup = $ionicPopup.alert({
						title: title,
						template: "Something went wrong."
					});
				}
			} else {
				console.log("KO");
			}
		});
	};

	/* Ask for confirmation for resetting visited */
	$scope.confirmResetVisited = function() {
		var title = "Reset visited";
		var confirmPopup = $ionicPopup.confirm({
			title: title,
			template: "Are you sure you?"
		});
		confirmPopup.then(function(res){
			if (res) {
				try {
					$scope.resetVisitedLink();
					var alertPopup = $ionicPopup.alert({
						title: title,
						template: "Done."
					});
				} catch (e) {
					var alertPopup = $ionicPopup.alert({
						title: title,
						template: "Something went wrong."
					});
				}
			}
		});
	};

	$scope.favoritesFilter = function() {
		var favorites = {};
		angular.forEach($scope.db, function(value, key) {
			if (value.favorite) {
				favorites[key] = value;
			}
    });
		return favorites;
	}

	/* At the end, init application */
	$scope.initUI();
	$scope.initDB();
	$scope.initApp();
	window.onresize = $scope.onresize;

	/* Utility */
	window.scope = $scope;
});
