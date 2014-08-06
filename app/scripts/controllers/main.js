'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vehicleSearchApp
 */
angular.module('vehicleSearchApp')
  .controller('MainCtrl', function ($scope, $window, $http, sourceFactory, _, dataHelper, $log) {
    // define private var
    var mainData, menuObj;
    // set options
    var opt = _.assign(_.clone(sourceFactory), $window.vsOpt || {});
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
      menuObj = _.pick(opt.menu1, function(objVal) {
        return _.has(objVal, 'menu');
      });
      if (!_.isEmpty(mainData) && !_.isEmpty(menuObj)) {
        _.assign($scope.menu, {
          current: -1,
          menuObj: menuObj,
          listC: mainData,
          listI: mainData,
          categoriesI: [],
          filterObj: {}
          // ,
          // slider: {
          //   price: $scope.menu.getSlider('price'),
          //   mileage: $scope.menu.getSlider('mileage')
          // },
          // active: true
        });
        dataHelper.menu.getCat();
      } else if (_.isEmpty(mainData)) {
        $log.error('no data available to populate the menu');
      } else if (_.isEmpty(menuObj)) {
        $log.error('no menu source available to populate the menu');
      } else {
        $log.error('no data && menu source available to populate the menu');
      }
    }
    // ajax call
    var callData = function () {
      $http({
        method: 'GET',
        // method: 'POST',
        url: 'test' + ajaxParams.type + '.json',
        // url: _custom.domain + '/_api/',
        params: ajaxParams
      }).success(populateData);
    };

    // listen for filter changes ---------------------
    $scope.$watch('menu.filterObj', function (vnew, vold) {
      if (vold && vnew !== vold) { $log.log('fNew',vnew, 'fOld',vold);
        $scope.menu.update();
      }
    }, true);

    // listen for vehicle type changes ---------------------
    $scope.$watch('vtype.live', function (vnew, vold) {
      if (vnew !== vold) { $log.log('lNew',vnew, 'lOld',vold);
        _.assign(ajaxParams, { type: vnew.value });
        callData();
      }
    });
    // running the app
    callData();
  });
