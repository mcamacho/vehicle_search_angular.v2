'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MainCtrl', function ($scope, $window, $browser, $http, $timeout, sourceFactory, _, dataHelper, $log) {

    // success ajax response
    function populateData(data) {
      // replace NaN with 0 for slider fields
      mainData = dataHelper.cleanNanValues(data, sliderObj);

      if (_.isEmpty(mainData)) {
        $log.error('no data available - end of road');
      } else {
        var temp = {
          listC: mainData,
          filterObj: opt.isViewListEnable ? dataHelper.urlParams.getPathObject() : {}
        };

        if (_.isEmpty(menuObj)) {
          $log.error('no menu items available to create the menu');
        } else {
          temp.menuGroupOrder = opt.menuGroupOrder;
          temp.menuObj = menuObj;
        }

        if (_.isEmpty(sliderObj)) {
          $log.error('no slider items available to create the sliders');
        } else {
          temp.sliderObj = sliderObj;
        }

        _.assign($scope.menu, temp);
        $scope.menu.setSlider();
        $scope.menu.update();
        if (opt.isViewListEnable) {
          $scope.list.query = dataHelper.urlParams.getAjaxView();
        }
      }
    }
    // ajax call data
    var callData = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: 'test' + ajaxParams.type + '.json',
        // url: opt.dataUrl,
        params: ajaxParams
      }).success(populateData);
    };

    // success ajax response
    function populateList(data) {
      if (!_.isEmpty(data.view)) {
        $window.document.querySelector(opt.listId).innerHTML = data.view;
      }
    }
    // ajax call list
    var callList = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: 'vlist.json?' + $scope.list.query,
        // url: opt.listUrl + $scope.list.query,
      }).success(populateList);
    };

    // define private var
    var mainData, rangePromise;
    // set options
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});
    // check for menu and slider objects on the menu options
    var menuObj = dataHelper.getMenuItems(opt.menu, 'menu.button');
    var sliderObj = dataHelper.getMenuItems(opt.menu, 'menu.slider');
    // if isViewListEnable, init urlParams
    if (opt.isViewListEnable) {
      // dataHelper.urlParams.init(opt.viewListPath || $location.path());
      dataHelper.urlParams.init(opt.viewListPath || $window.location.pathname);
      opt.vtypeIndex = dataHelper.urlParams.getTypeIndex(opt.vtypeList);
      $scope.list = {};
    }
    // create the ajax parameters map object
    var ajaxParams = dataHelper.getAjaxParams(opt);

    // init vtype with default or custom options
    $scope.vtype = {
      enable: opt.isVtypeEnable,
      list: opt.vtypeList,
      live: opt.vtypeList[opt.vtypeIndex],
      set: function (_value) {
        this.live = _.find(this.list, {value: _value});
      }
    };

    // public option to display the vehicle search result
    $scope.isViewListEnable = opt.isViewListEnable;

    // init menu with controller methods to handle menu changes
    $scope.menu = dataHelper.menu;

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
        if (opt.isViewListEnable) {
          $scope.list.query = dataHelper.urlParams.updatePairs($scope.menu.filterObj);
        }
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
        dataHelper.urlParams.pathObj = {};
        callData();
      }
    });

    $scope.$watch('list.query', function (vnew, vold) {
      if (vnew !== vold && vnew !== '') {
        // $log.log(vnew, vold);
        // $log.log($scope.list.query);
        callList();
        if (vold) {
          $browser.url('/#/' + dataHelper.urlParams.getURI());
          $window.history.replaceState(0,'history','/#/' + dataHelper.urlParams.getURI());
        }
        // $location.path(dataHelper.urlParams.getURI());
      }
    });

    // running the app
    callData();
  });
