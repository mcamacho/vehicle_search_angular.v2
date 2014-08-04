'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.factory:dataHelper
 * @description
 * # helper
 * Contains the menu object hash, the default vehicle condition types
 */
angular.module('vehicleSearchApp')
  .factory('dataHelper', function (_) {
    return {
      cleanNanValues: function (data) {
        return _.map(data, function (obj) {
          obj.price = /^[0-9,.]+$/.test(obj.price) ? obj.price : '0';
          obj.mileage = /^[0-9,.]+$/.test(obj.mileage) ? obj.mileage : '0';
          return obj;
        });
      },
      getMenu: function (obj, menuObj) {
        var category = _.mapValues(menuObj, function(objVal, keyVal) {
          var values = _.remove(_.pluck(obj, objVal.keyval), function (ele) { return ele !== ''; });
          var countValues = _.countBy(values, function(val) {
            return val;
          });
          return {
            valueKey: keyVal,
            valueLabel: objVal.menu.valueLabel,
            order: objVal.menu.order,
            options: countValues
          };
        });
        return _.sortBy(category, 'order');
      }
    };
  });