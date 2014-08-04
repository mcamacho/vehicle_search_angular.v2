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
    'nouislider',
    'vehicleSearchOpt'
  ])
  .constant('_', window._);
