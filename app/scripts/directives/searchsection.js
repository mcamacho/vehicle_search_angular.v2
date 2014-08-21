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
      link: function (scope, element) {
        scope.$watch('menu.categoriesI', function () {
          var secWidth = 320;
          var children = element.children();
          var totalWidth = String(secWidth * children.length);
          children.each(function () {
            this.style.width = secWidth + 'px';
            this.className = 'left';
          });
          element.css('width', totalWidth);
          $log.log(element.css('width'));
        });
      }
    };
  });