'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MainCtrl', function ($scope, $window, $http, sourceFactory, _, dataHelper) {
    var vehTypes = $window.vsOpt && $window.vsOpt.vtypes ? $window.vsOpt.vtypes : sourceFactory.defTypes;
    var callParams = {
      f: 'json',
      show: '-1',
      type: vehTypes[0].value,
      k: _.map(sourceFactory.menu1, function (oval) { return oval.keyval; }).join()
    };
    var mainData, menuObj;
    $scope.menu = {};

    function populateData(data) {
      mainData = dataHelper.cleanNanValues(data);
      menuObj = _.pick(sourceFactory.menu1, function(objVal) {
        return _.has(objVal, 'menu');
      });
      if (!_.isEmpty(mainData)) {
        $scope.menu = {
          filterObj: {},
          listC: mainData,
          listI: mainData,
          categoriesI: dataHelper.getMenu(mainData, menuObj)
          // ,
          // slider: {
          //   price: $scope.menu.getSlider('price'),
          //   mileage: $scope.menu.getSlider('mileage')
          // },
          // active: true
        };
      }
    }

    $http({
      method: 'GET',
      // method: 'POST',
      url: 'testNew.json',
      // url: $window.vsOpt.domain + '/_api/',
      params: callParams
    })
    .success(populateData);
  });
