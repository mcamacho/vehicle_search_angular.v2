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

    function addModelListeners() {
      if (!_.isFunction(drModelLis)) {
        // listen for filterObj changes -> calls model update method
        drModelLis = $scope.$watch('model.filterObj', function (vnew, vold) {
          if (vold && vnew !== vold) {
            $scope.model.update();
            if (opt.isViewListEnable && opt.isUrlHistoryEnable) {
              $scope.query = dataHelper.urlParams.updatePairs($scope.model.filterObj);
            }
          }
        }, true);
      }
    }

    function addRangeListeners() {
      if (!_.isFunction(drRangeLis)) {
        drRangeLis = $scope.$watch('model.rangeObj', function (vnew, vold) {
          if (vold && vnew !== vold) {
            _.forEach($scope.model.rangeObj, function (val, key) {
              if (_.isEqual(vnew[key], vold[key])) {
                $log.log('equal', key);
              } else {
                $log.log('not equal', vnew[key].minsel, vnew[key].maxsel);
                $scope.model.addOption(key, vnew[key].minsel + '-' + vnew[key].maxsel);
              }
            });
            // $scope.model.update();
            // if (opt.isViewListEnable && opt.isUrlHistoryEnable) {
            //   $scope.query = dataHelper.urlParams.updatePairs($scope.model.filterObj);
            // }
          }
        }, true);
      }
    }
    
    function initModel(data) {
      // init scope.model
      _.assign($scope.model, {
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
        $scope.model.setRange();
        addRangeListeners();
      }

      $scope.model.update();
    }

    // success ajax response
    function populateData(data) {
      if (_.isEmpty(data)) {
        $log.error('no data available - end of road');
      } else {
        if (_.isEmpty(menuObj)) {
          $log.error('no menu items available to create the menu');
        } else {
          // define scope model instance of the dataHelper.model
          // init scope.model
          // add model listeners
          $scope.model = dataHelper.model;
          initModel(data);
          addModelListeners();
        }

        if (opt.isViewListEnable) {
          $scope.query = dataHelper.urlParams.getAjaxView();
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
        url: '/vlist.json?' + opt.postdatacall($scope.query),
        // url: opt.listUrl + opt.postdatacall($scope.query),
      }).success(populateList);
    }

    function updateViewList(vnew, vold) {
      if (vold && vnew !== vold) {
        $log.log('model.viewListSort - vnew,vold',vnew, vold);
        $scope.model.sortList();
        $scope.model.resetList();
      }
    }

    function initQuery() {
      $scope.query = '';
      $scope.$watch('query', function (vnew, vold) {
        if (opt.vnew !== vold && vnew !== '') {
          if(opt.isUrlHistoryEnable && dataHelper.urlParams.pathPairs) {
            $log.log('query - vnew,vold',vnew, vold, typeof callList);
            $location.path(dataHelper.urlParams.getURI()).replace();
          }
        }
      });
    }

    var drModelLis, drRangeLis;
    // set options variable based on the default model and overwrite it by the external model if exist
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});

    // check for menu, slider and sort objects from the menu options
    var menuObj = dataHelper.getModelItems(opt.model, 'menu.button');
    var rangeObj = dataHelper.getModelItems(opt.model, 'menu.range');
    var sortObj = _.pick(opt.model, opt.sortList);

    // if isViewListEnable, init urlParams Object, get vehicles condition type if set & init scope.query Object
    if (opt.isViewListEnable) {
      dataHelper.urlParams.init(opt.viewListPath || $location.path());
      opt.vtypeIndex = dataHelper.urlParams.getTypeIndex(opt.vtypeList);
      initQuery();
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

    $scope.$watch('model.viewListSort', updateViewList);

    $scope.$watch('model.sortListDir', updateViewList);

    // launch the app if none exist
    if(_.isEmpty($scope.model)) {
      callData();
    }
  });
