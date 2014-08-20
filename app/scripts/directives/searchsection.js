'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .directive('searchSection', function ($log) {
    return {
      link: function (scope, element, attrs) {
        $log.log('0', scope, attrs);
        attrs.$observe('ready', function () {
          $log.log(arguments);
          // $log.log('1', element);
          // $log.log('a', element.children().length);
          // $log.log('a', element.html());
        });
      }
    };
  });