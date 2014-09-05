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
    'ngAnimate',
    'ngTouch',
    'vehicleSearchOpt'
  ])
  .constant('_', window._)
  .config(function ($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  });
