// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('dailynk', ['ionic', 'dailynk.controllers'])

// Defining route
app.config(function($stateProvider){
	$stateProvider
		.state("home", {
			url: "/",
			templateUrl: "templates/home.html",
		})
		.state("settings", {
			url: "/settings",
			templateUrl: "templates/settings.html"
		})
		.state("favorites", {
			url: "/favorites",
			templateUrl: "templates/favorites.html"
		});
});

app.run(function($ionicPlatform, $state) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  // Go to home
  $state.transitionTo('home');
})