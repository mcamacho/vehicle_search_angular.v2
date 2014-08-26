'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MenuCtrl', function ($scope) {

    // init section object, and set filter0 display to true
    $scope.section = {
      filter0: true
    };

    $scope.$watch('section.filter0', function (vnew) {
      if (vnew) {
        $scope.section.filter1 = !$scope.section.filter0;
      }
    });
    $scope.$watch('section.filter1', function (vnew) {
      if (vnew) {
        $scope.section.filter0 = !$scope.section.filter1;
      }
    });

  });