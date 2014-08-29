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
        templateUrl: '/views/basic.html',
        controller: 'MenuCtrl'
      })
      .when('/:apiquery*', {
        templateUrl: '/views/main.html',
        controller: 'MenuCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  });
