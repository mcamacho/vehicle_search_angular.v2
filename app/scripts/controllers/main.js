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
      enable: opt.vtypeEnable,
      list: opt.vtypeList,
      live: opt.vtypeList[0],
      set: function (_value) {
        this.live = _.find(this.list, {value: _value});
      }
    };

    $scope.displayList = opt.displayList;

    // init menu with controller methods to handle menu changes
    $scope.menu = dataHelper.menu;

    // success ajax response
    function populateData(data) {
      mainData = dataHelper.cleanNanValues(data);
      if (!_.isEmpty(mainData)) {
        _.assign($scope.menu, {
          current: -1,
          listC: mainData,
          listI: mainData,
          categoriesI: [],
          filterObj: {}
        });
      } else {
        $log.error('no data available - end of road');
      }
      if (!_.isEmpty(menuObj)) {
        _.assign($scope.menu, {
          menuObj: menuObj
        });
        dataHelper.menu.getCat();
      } else {
        $log.error('no menu items available to create the menu');
      }
      if (!_.isEmpty(sliderObj)) {
        _.assign($scope.menu, {
          sliderObj: sliderObj
        });
        dataHelper.menu.getSlider();
      } else {
        $log.error('no slider items available to create the sliders');
      }
    }
    // ajax call
    var callData = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: 'test' + ajaxParams.type + '.json',
        // url: opt.domain + '/_api/',
        params: ajaxParams
      }).success(populateData);
    };

    // listen for filter changes ---------------------
    $scope.$watch('menu.filterObj', function (vnew, vold) {
      if (vold && vnew !== vold) {
        // $log.log('fNew',vnew, 'fOld',vold);
        $scope.menu.update();
      }
    }, true);

    // listen for filter changes ---------------------
    $scope.$watch('menu.range', function (vnew, vold) {
      if (vold && vnew !== vold && $scope.menu.sliderListener) {
        // $log.log('fNew',vnew, 'fOld',vold);
        if (rangePromise) {
          $timeout.cancel(rangePromise);
        }
        rangePromise = $timeout(function () { $scope.menu.checkRange(); }, 500);
      }
    }, true);

    // listen for vehicle type changes ---------------------
    $scope.$watch('vtype.live', function (vnew, vold) {
      if (vnew !== vold) {
        // $log.log('lNew',vnew, 'lOld',vold);
        _.assign(ajaxParams, { type: vnew.value });
        callData();
      }
    });

    // method to refresh the sliders after being hidden
    $scope.checkActive = function () {
      $scope.menu.sliderListener = true;
      $scope.$broadcast('refreshSlider');
    };

    // running the app
    callData();
  });
