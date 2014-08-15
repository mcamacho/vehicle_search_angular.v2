'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MainCtrl', function ($scope, $window, $http, $timeout, sourceFactory, _, dataHelper, $log) {
    // define private var
    var mainData, rangePromise;
    // set options
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});
    // check for menu and slider objects on the menu options
    var menuObj = dataHelper.getMenuItems(opt.menu, 'menu');
    var sliderObj = dataHelper.getMenuItems(opt.menu, 'slider');
    // create the ajax parameters map object
    var ajaxParams = dataHelper.getAjaxParams(opt);

    // init vtype with default or custom options
    $scope.vtype = {
      enable: opt.isVtypeEnable,
      list: opt.vtypeList,
      live: opt.vtypeList[0],
      set: function (_value) {
        this.live = _.find(this.list, {value: _value});
      }
    };

    // public option to display the vehicle search result
    $scope.isViewListEnable = opt.isViewListEnable;

    // init menu with controller methods to handle menu changes
    $scope.menu = dataHelper.menu;

    // init filter menu with labels
    if (_.isEmpty(menuObj)) {
      $log.error('no menu items available to create the menu');
    } else {
      $scope.menu.menuObj = menuObj;
      $scope.menu.initCat();
    }

    // method to refresh the sliders after being hidden
    $scope.setSliderActive = function () {
      $scope.menu.updateRangeC();
      $scope.$broadcast('refreshSlider');
    };

    // listen for filter changes -> calls menu update method
    $scope.$watch('menu.filterObj', function (vnew, vold) {
      if (vold && vnew !== vold) {
        // $log.log('fNew',vnew, 'fOld',vold);
        $scope.menu.update();
      }
    }, true);

    // listen for slider range changes not derived from filter changes -> calls menu checkRange
    $scope.$watch('menu.rangeObj', function (vnew, vold) {
      if (vold && vnew !== vold) {
        // $log.log('fNew',vnew, 'fOld',vold);
        if (rangePromise) {
          $timeout.cancel(rangePromise);
        }
        rangePromise = $timeout(function () {
          $timeout.cancel(rangePromise);
          $scope.menu.checkRange();
        }, 500);
      }
    }, true);

    // listen for vehicle type changes -> refresh the app, calling callData method
    $scope.$watch('vtype.live', function (vnew, vold) {
      if (vnew !== vold) {
        // $log.log('lNew',vnew, 'lOld',vold);
        _.assign(ajaxParams, { type: vnew.value });
        callData();
      }
    });

    // success ajax response
    function populateData(data) {
      // replace NaN with 0 for slider fields
      mainData = dataHelper.cleanNanValues(data, sliderObj);

      if (_.isEmpty(mainData)) {
        $log.error('no data available - end of road');
      } else {
        var temp = {
          listC: mainData,
          filterObj: {}
        };

        if (_.isEmpty(sliderObj)) {
          $log.error('no slider items available to create the sliders');
        } else {
          temp.sliderObj = sliderObj;
        }

        _.assign($scope.menu, temp);
        $scope.menu.setSlider();
        $scope.menu.update();
      }
    }
    // ajax call
    var callData = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: 'test' + ajaxParams.type + '.json',
        // url: opt.dataUrl,
        params: ajaxParams
      }).success(populateData);
    };

    // running the app
    callData();
  });
