'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.directive:toggle
 * @description
 * # toggle
 * Directive that toggle 'active' class
 */
angular.module('vehicleSearchApp')
  .directive('toggle', function () {
    return {
      scope: {
        toggle: '='
      },
      link: function ($scope, element) {
        $scope.$watch('toggle', function (value) {
          element.closest('section').toggleClass('active', value);
        });
        element.click(function () {
          $scope.$apply(function () {
            $scope.toggle = !$scope.toggle;
          });
        });
      }
    };
  });