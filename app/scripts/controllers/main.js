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

    // add menu listeners
    function addMenuListeners() {
      // listen for filter changes -> calls menu update method
      $scope.$watch('menu.filterObj', function (vnew, vold) {
        if (vold && vnew !== vold) {
          // $log.log('fNew',vnew, 'fOld',vold);
          $scope.menu.update();
          if (opt.isViewListEnable && opt.isUrlHistoryEnable) {
            $scope.list.query = dataHelper.urlParams.updatePairs($scope.menu.filterObj);
          }
        }
      }, true);
    }
    // add range listeners
    function addRangeListeners() {
      $scope.$watch('menu.rangeObj', function (vnew, vold) {
        if (vold && vnew !== vold) {
          _.forEach($scope.menu.rangeObj, function (val, key) {
            if (_.isEqual(vnew[key], vold[key])) {
              $log.log('equal', key);
            } else {
              $log.log('not equal', vnew[key].minsel, vnew[key].maxsel);
              $scope.menu.addOption(key, vnew[key].minsel + '-' + vnew[key].maxsel);
            }
          });
          // $scope.menu.update();
          // if (opt.isViewListEnable && opt.isUrlHistoryEnable) {
          //   $scope.list.query = dataHelper.urlParams.updatePairs($scope.menu.filterObj);
          // }
        }
      }, true);
    }
    // init scope.menu
    function initMenu(data) {
      _.assign($scope.menu, {
        menuObj: menuObj,
        rangeObj: rangeObj,
        sortObj: sortObj,
        menuGroupOrder: opt.menuGroupOrder,
        filterObj: opt.isViewListEnable ? dataHelper.urlParams.getPathObject() : {},
        listC: _.isEmpty(rangeObj) ? data : dataHelper.cleanValues(data, rangeObj),
        isViewListEnable: opt.isViewListEnable,
        viewListAmount: opt.viewListAmount,
        viewListSort: menuObj[opt.viewListSortKey],
        sortListDir: opt.sortListDir
      });

      if (_.isEmpty(rangeObj)) {
        $log.info('no range items available');
      } else {
        $scope.menu.setRange();
        addRangeListeners();
      }

      $scope.menu.update();
    }

    // success ajax response
    function populateData(data) {
      if (_.isEmpty(data)) {
        $log.error('no data available - end of road');
      } else {
        if (_.isEmpty(menuObj)) {
          $log.error('no menu items available to create the menu');
        } else {
          // define scope menu instance of the dataHelper.menu
          // init scope.menu
          // add menu listeners
          $scope.menu = dataHelper.menu;
          initMenu(data);
          addMenuListeners();
        }

        if (opt.isViewListEnable) {
          $scope.list.query = dataHelper.urlParams.getAjaxView();
        }
      }
    }
    // ajax call data
    function callData(vtype) {
      if (_.isEmpty(opt.predata)) {
        var ajaxParams = dataHelper.getAjaxParams(opt);
        if (vtype) {
          ajaxParams.type = vtype;
        }
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
    }

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
    function callList() {
      $http({
        method: 'GET',
        // method: 'POST',
        url: '/vlist.json?' + opt.postdatacall($scope.list.query),
        // url: opt.listUrl + opt.postdatacall($scope.list.query),
      }).success(populateList);
    }

    function updateViewList(vnew, vold) {
      if (vold && vnew !== vold) {
        $log.log('menu.viewListSort - vnew,vold',vnew, vold);
        $scope.menu.sortList();
        $scope.menu.resetList();
      }
    }

    // set options variable based on the default and overwrite by the external defined if exist
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});
    // check for menu, slider and sort objects from the menu options
    var menuObj = dataHelper.getMenuItems(opt.menu, 'menu.button');
    var rangeObj = dataHelper.getMenuItems(opt.menu, 'menu.range');
    var sortObj = _.pick(opt.menu, opt.sortList);

    // if isViewListEnable, init urlParams Object, get condition if set, init scope.list Object
    if (opt.isViewListEnable) {
      dataHelper.urlParams.init(opt.viewListPath || $location.path());
      opt.vtypeIndex = dataHelper.urlParams.getTypeIndex(opt.vtypeList);
      $scope.list = {};
    }

    // init vtype with default or custom options, and set method
    $scope.vtype = {
      enable: opt.isVtypeEnable,
      list: opt.vtypeList,
      live: opt.vtypeList[opt.vtypeIndex],
      set: function (_value) {
        this.live = _.find(this.list, {value: _value});
      }
    };

    // listen for vtype changes -> reset the urlParams, override ajaxParams.type, recall callData method
    $scope.$watch('vtype.live', function (vnew, vold) {
      if (vnew !== vold) {
        if (_.isEmpty(opt.predata)) {
          dataHelper.urlParams.init('/inventory/condition=' + vnew.value);
          callData(vnew.value);
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
    if(!$scope.menu) {
      callData();
    }
  });
