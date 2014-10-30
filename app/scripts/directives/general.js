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
  })
  .directive('belowFold', function ($window, $log) {
    return {
      link: function ($scope, element) {
        $window.onscroll = function () {
          var doc = $window.document, elem = doc.documentElement.scrollTop?doc.documentElement:doc.body;
          $log.log(elem.scrollTop, $window.innerHeight, element.offset().top);
          $log.log(elem.scrollTop + $window.innerHeight > Math.floor(element.offset().top)) + 1;
        };
      }
    };
  });