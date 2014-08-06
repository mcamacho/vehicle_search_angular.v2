'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.factory:dataHelper
 * @description
 * # helper
 * Contains the menu object hash, the default vehicle condition types
 */
angular.module('vehicleSearchApp')
  .factory('dataHelper', function (_, $sce) {
    return {
      getAjaxParams: function (o) {
        var keys = _.map(o.menu1, function (oval) {
          return oval.keyval;
        }).join();
        var params = {
          f: 'json',
          show: '-1',
          type: o.vtypeList[0].value,
          k: keys
        };
        if (!_.isEmpty(o.vmakeList)) {
          _.assign(params, {
            make: o.vmakeList.join()
          });
        }
        return params;
      },
      cleanNanValues: function (data) {
        return _.map(data, function (obj) {
          obj.price = /^[0-9,.]+$/.test(obj.price) ? obj.price : '0';
          obj.mileage = /^[0-9,.]+$/.test(obj.mileage) ? obj.mileage : '0';
          return obj;
        });
      },
      menu: {
        update: function () {
          // clean current property, used in accordion display
          this.current = -1;
          // calls the method to recreate the query string for the results button
          this.getQuery();
          // calls the method to recreate the categoriesI model
          this.updateModel();
        },
        // create the array of objects to run the menu tmpl
        getCat: function () {
          var category = _.mapValues(this.menuObj, function(objVal) {
            var values = _.remove(_.pluck(this.listI, objVal.keyval), function (ele) { return ele !== ''; });
            var countValues = _.countBy(values, function(val) {
              return val;
            });
            return {
              valueKey: objVal.keyval,
              valueLabel: objVal.menu.valueLabel,
              order: objVal.menu.order,
              options: countValues
            };
          }, this);
          this.categoriesI = _.sortBy(category, 'order');
        },
        // toggle menu.current among index:open and -1:closed
        setCurrent: function(index) {
          this.current = this.current === index ? -1 : index;
        },
        // returns list collection amount
        resultsQty: function() {
          return this.listI ? this.listI.length : '0';
        },
        // updates filterObj with a new key value pair
        filterList: function(valueKey, key) {
          this.filterObj[valueKey] = key;
        },
        //updates category header if only one option is available
        uniq: function(index) {
          var cat = this.categoriesI[index],
            options = _.keys(cat.options),
            html = '';
          if (options.length === 1) {
            html = '<span>' + options[0] + '</span>';
            if (_.has(this.filterObj, cat.valueKey)) {
              html = html + '<span> <i class="fa fa-times"></i> </span>';
            }
          }
          return $sce.trustAsHtml(html);
        },
        // removes filter option from filterObj
        removeOption: function(index) {
          this.filterObj = _.omit(this.filterObj, this.categoriesI[index].valueKey);
        },
        // constructs GET query string
        getQuery: function() {
          this.query = _.map(this.filterObj, function(value, key) {
            return key.replace(/([A-Z])/g,'_$1').toLowerCase() + '=' + value;
          }).join('/');
        },
        // recreates categoriesI based on filterObj
        updateModel: function() {
          function rangeF(value) {
            return value.indexOf(',') > -1;
          }
          var filter = _.omit(this.filterObj, rangeF);
          var range = _.pick(this.filterObj, rangeF);
          this.listI = _.isEmpty(filter) ? this.listC : _.where(this.listC, filter);
          if (!_.isEmpty(range)) {
            this.listI = _.filter(this.listI, function (obj) {
              var filReturn = [];
              for (var ra in range) {
                var rangeArray = range[ra].split(',');
                var objValue = obj[ra].search(/[a-zA-Z]/) > -1 ? -1 : parseInt(obj[ra].replace(',',''), 10);
                filReturn.push(objValue >= parseInt(rangeArray[0], 10) && objValue <= parseInt(rangeArray[1], 10));
              }
              return _.indexOf(filReturn, false) > -1 ? false : true;
            });
          }
          this.getCat();
        },
        // returns object config to init slider input
        getSlider: function(key) {
          var valArray = _.pluck(this.listI, key);
          var cleanArray = [];
          for (var i = valArray.length - 1; i >= 0; i--) {
            cleanArray.push(parseInt(valArray[i].replace(',', ''), 10));
          }
          var min = Math.floor(_.min(cleanArray) / 1000) * 1000;
          var max = Math.ceil(_.max(cleanArray) / 1000) * 1000;
          return {
            from: min,
            to: max,
            step: 1000,
            min: min,
            max: max
          };
        }
      }
    };
  });