'use strict';

/**
 * @ngdoc overview
 * @name vehicleSearchApp
 * @description
 * # vehicleSearchApp
 *
 * Main module of the application.
 */
angular
  .module('vehicleSearchApp', [
    'ngRoute',
    'ngAnimate',
    'ngTouch',
    'vehicleSearchOpt'
  ])
  .constant('_', window._)
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/:query*', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(false);
  });
