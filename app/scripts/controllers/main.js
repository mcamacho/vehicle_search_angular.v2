'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MainCtrl', function ($scope, $window, $location, $browser, $http, $timeout, sourceFactory, _, dataHelper, $log) {

    // success ajax response
    function populateData(data) {
      if (_.isEmpty(data)) {
        $log.error('no data available - end of road');
      } else {
        _.assign($scope.menu, {
          menuObj: menuObj,
          menuGroupOrder: opt.menuGroupOrder,
          filterObj: opt.isViewListEnable ? dataHelper.urlParams.getPathObject() : {},
          sliderObj: sliderObj,
          listC: _.isEmpty(sliderObj) ? data : dataHelper.cleanValues(data, sliderObj),
          isViewListEnable: opt.isViewListEnable,
          viewListAmount: opt.viewListAmount,
          sortObj: sortObj,
          viewListSort: menuObj[opt.viewListSortKey],
          sortListDir: opt.sortListDir
        });

        if (_.isEmpty(sliderObj)) {
          $log.info('no slider items available to create the sliders');
        } else {
          $scope.menu.setSlider();
        }

        if (_.isEmpty(menuObj)) {
          $log.error('no menu items available to create the menu');
        } else {
          $scope.menu.update();
        }

        if (opt.isViewListEnable) {
          $scope.list.query = dataHelper.urlParams.getAjaxView();
        }
      }
    }
    // ajax call data
    var callData = function () {
      if (_.isEmpty(opt.predata)) {
        $http({
          method: 'GET',
          // method: 'POST',
          url: '/test' + ajaxParams.type + '.json',
          // url: opt.dataUrl,
          params: ajaxParams
        }).success(populateData);
      } else {
        populateData(opt.predata);
      }
    };

    // success ajax response
    function populateList(data) {
      if (!_.isEmpty(data.view)) {
        $window.document.querySelector(opt.listId).innerHTML = data.view;
        if (typeof opt.viewUpdateCall === 'function') {
          opt.viewUpdateCall();
        }
      }
    }
    // ajax call list
    var callList = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: '/vlist.json?' + opt.postdatacall($scope.list.query),
        // url: opt.listUrl + opt.postdatacall($scope.list.query),
      }).success(populateList);
    };

    function updateViewList(vnew, vold) {
      if (vold && vnew !== vold) {
        $log.log('menu.viewListSort - vnew,vold',vnew, vold);
        $scope.menu.sortList();
        $scope.menu.resetList();
      }
    }

    // set options
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});
    // check for menu and slider objects on the menu options
    var menuObj = dataHelper.getMenuItems(opt.menu, 'menu.button');
    var sliderObj = dataHelper.getMenuItems(opt.menu, 'menu.slider');
    var sortObj = _.pick(opt.menu, opt.sortList);
    // if isViewListEnable, init urlParams Object, get condition if set, init scope.list Object
    if (opt.isViewListEnable) {
      dataHelper.urlParams.init(opt.viewListPath || $location.path());
      opt.vtypeIndex = dataHelper.urlParams.getTypeIndex(opt.vtypeList);
      $scope.list = {};
    }
    // create the ajax parameters map object
    var ajaxParams = dataHelper.getAjaxParams(opt);

    // init vtype with default or custom options, and set method
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

    // instance the menu object to the scope
    $scope.menu = dataHelper.menu;

    // listen for filter changes -> calls menu update method
    $scope.$watch('menu.filterObj', function (vnew, vold) {
      if (vold && vnew !== vold) {
        // $log.log('fNew',vnew, 'fOld',vold);
        $scope.menu.update();
        if (opt.isViewListEnable) {
          $log.log('filterObj');
          $scope.list.query = dataHelper.urlParams.updatePairs($scope.menu.filterObj);
        }
      }
    }, true);

    // listen for vtype changes -> reset the urlParams, override ajaxParams.type, recall callData method
    $scope.$watch('vtype.live', function (vnew, vold) {
      if (vnew !== vold) {
        if (_.isEmpty(opt.predata)) {
          dataHelper.urlParams.init('/inventory/condition=' + vnew.value);
          _.assign(ajaxParams, { type: vnew.value });
          callData();
        } else {
          $log.warn('need client cache implementation or solve server cache');
        }
      }
    });

    $scope.$watch('list.query', function (vnew, vold) {
      if (opt.vnew !== vold && vnew !== '') {
        if(opt.isUrlHistoryEnable && dataHelper.urlParams.pathPairs) {
          $log.log('list.query - vnew,vold',vnew, vold, typeof callList);
          $location.path(dataHelper.urlParams.getURI()).replace();
        }
      }
    });

    $scope.$watch('menu.viewListSort', updateViewList);

    $scope.$watch('menu.sortListDir', updateViewList);
    // running the app
    if(_.isEmpty($scope.menu.menuObj)) {
      callData();
    }
  });
