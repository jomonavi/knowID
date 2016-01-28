'use strict';
var app = angular.module('app', ['ngRoute', 'ngResource'])
var artistURL;

app.config(['$routeProvider', function($routeProvider) {
  	$routeProvider
    	.when('/', {
      		templateUrl: 'home.html',
          	controller: 'HomeCtrl'
    	})
    	.when('/about', {
    		templateUrl: 'about.html',
    		controller: 'HomeCtrl'
    	})
      .when('/samples', {
        templateUrl: 'samples.html',
        controller: 'HomeCtrl'
      })
    	.otherwise({
      		redirectTo: '/'
    	});

}]);

