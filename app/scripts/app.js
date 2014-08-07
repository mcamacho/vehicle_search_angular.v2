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
    'vr.directives.slider',
    'vehicleSearchOpt'
  ])
  .constant('_', window._);
