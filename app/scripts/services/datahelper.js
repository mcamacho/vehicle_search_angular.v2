'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.factory:dataHelper
 * @description
 * # helper
 * Contains the menu object hash, the default vehicle condition types
 */
angular.module('vehicleSearchApp')
  .factory('dataHelper', function (_, $sce, $log) {
    return {
      getMenuItems: function (objL, key) {
        return _.pick(objL, function(objVal) {
          if (key.indexOf('.') > -1) {
            var keysplit = key.split('.');
            return _.has(objVal[keysplit[0]], keysplit[1]);
          }
          return _.has(objVal, key);
        });
      },
      getAjaxParams: function (o) {
        var keys = _.map(o.menu, function (oval) {
          return oval.keyval;
        }).join();
        var params = {
          f: 'json',
          show: '-1',
          type: o.vtypeList[o.vtypeIndex].value,
          k: keys
        };
        if (!_.isEmpty(o.vmakeList)) {
          _.assign(params, {
            make: o.vmakeList.join()
          });
        }
        return params;
      },
      cleanNanValues: function (data, objL) {
        var keys = _.map(objL, function (obj) {
          return obj.keyval;
        });
        return _.map(data, function (obj) {
          for (var i = keys.length - 1; i >= 0; i--) {
            obj[keys[i]] = /^[0-9,.]+$/.test(obj[keys[i]]) ? obj[keys[i]] : '0';
          }
          return obj;
        });
      },
      urlParams: {
        /**
         * @description find index on types based on pathPairs pathObj condition  
         * @returns vehicle type object index to set the current vtype
         */
        getTypeIndex: function (types) {
          var typeIndex = this.pathObj.condition || -1;
          return typeIndex === -1 ? 0 : _.findIndex(types, {value: typeIndex});
        },
        setPathObject: function () {
          this.pathObj = {};
          _.forEach(this.pathPairs, function (ele) {
            var split = ele.split('=');
            this[split[0]] = split[1];
          }, this.pathObj);
        },
        getPathObject: function () {
          return _.omit(this.pathObj, 'condition');
        },
        updatePairs: function (filterObj) {
          $log.log('updatePairs', this.pathObj, filterObj);
          this.pathObj = _.assign(_.pick(this.pathObj, 'condition'), filterObj);
          this.pathPairs = _.map(this.pathObj, function (value, key) {
            return key + '=' + value;
          });
          return this.getAjaxView();
        },
        getURI: function () {
          $log.log('updateURI', this.pathPairs);
          // return '/' + this.pathUniq.join('/') + '/' + this.pathPairs.join('/') + '/';
          return this.pathPairs.join('/');
        },
        getAjaxView: function () { $log.log('getAjaxView');
          return this.pathPairs.join('&') + '&json=true';
        },
        init: function (path) {
          this.pathValues = _.compact(path.split('/'));
          this.pathUniq = _.filter(this.pathValues, function (ele) {
            return ele.indexOf('=') < 0;
          });
          this.pathPairs = _.filter(this.pathValues, function (ele) {
            return ele.indexOf('=') > -1;
          });
          this.setPathObject();
        }
      },
      menu: {
        // @description set the objects array to be injected through menu tmpl
        // @param {Object} this.menuObj
        // @param {Array} this.listI
        // @assign {Array} this.menuGroup
        setCat: function () {
          this.menuGroup = {};
          _.forEach(this.menuObj, function (objVal) {
            var values = _.remove(_.pluck(this.listI, objVal.keyval), function (ele) { return ele !== ''; });
            var countValues = _.countBy(values, function(val) {
              return val;
            });
            this.menuGroup[objVal.menu.group] = this.menuGroup[objVal.menu.group] || [];
            var category = {
              valueKey: objVal.keyval,
              valueLabel: objVal.menu.valueLabel,
              order: objVal.menu.order,
              options: countValues
            };
            this.menuGroup[objVal.menu.group].push(category);
          }, this);
          this.menuGroup = _.sortBy(this.menuGroup, function (value, key) {
            return this.menuGroupOrder.indexOf(key);
          }, this);
        },
        // @description set the objects array to init sliders && init rangeObj: from & to
        // @param {Object} this.sliderObj
        // @param {Array} this.listC
        // @init {Array} this.slidersI
        // @init {Array} this.rangeObj
        setSlider: function () {
          this.rangeObj = {};
          var slider = _.mapValues(this.sliderObj, function(objVal) {
            var cleanArray = [];
            var valArray = _.pluck(this.listC, objVal.keyval);
            for (var i = valArray.length - 1; i >= 0; i--) {
              cleanArray.push(parseInt(valArray[i].replace(',', ''), 10));
            }
            var min = Math.floor(_.min(cleanArray) / 1000) * 1000;
            var max = Math.ceil(_.max(cleanArray) / 1000) * 1000;
            this.rangeObj[objVal.keyval] = {
              from: min,
              to: max
            };
            return {
              keyval: objVal.keyval,
              label: objVal.menu.valueLabel,
              order: objVal.menu.order,
              step: 1000,
              min: min,
              max: max,
              width: '100%'
            };
          }, this);
          this.slidersI = _.sortBy(slider, 'order');
        },
        // @description constructs query string
        // @param {Object} this.filterObj
        // @assign {String} this.query
        getQuery: function() {
          this.query = _.map(this.filterObj, function(value, key) {
            return key.replace(/([A-Z])/g,'_$1').toLowerCase() + '=' + value;
          }).join('/');
        },
        // @description recreates listI based on filterObj
        // @param {Object} this.filterObj
        // @param {Object} this.listC, cached response from initial ajax call
        // @assign {Array} this.listI
        updateModel: function() {
          var filterOpt = _.omit(this.filterObj, this.isRangeValue, this);
          var rangeOpt = _.pick(this.filterObj, this.isRangeValue, this);
          this.listI = _.isEmpty(filterOpt) ? _.clone(this.listC) : _.where(this.listC, filterOpt);
          // this.listI = _.isEmpty(filterOpt) ? this.listC : _.reject(this.listC, function (ele) { return ele[this.filterObj] }, this);
          if (!_.isEmpty(rangeOpt)) {
            this.listI = _.filter(this.listI, function (obj) {
              var filReturn = [];
              for (var ra in rangeOpt) {
                var rangeArray = rangeOpt[ra].split('-');
                var objValue = obj[ra].search(/[a-zA-Z]/) > -1 ? -1 : parseInt(obj[ra].replace(',',''), 10);
                filReturn.push(objValue >= parseInt(rangeArray[0], 10) && objValue <= parseInt(rangeArray[1], 10));
              }
              return _.indexOf(filReturn, false) > -1 ? false : true;
            });
          }
        },
        // @description updates rangeObj object [from] and [to] values
        // @param {Object} this.sliderObj
        // @param {Object} this.listI
        // @assign {Array} this.rangeObj
        updateRange: function () {
          _.mapValues(this.sliderObj, function(objVal) {
            var cleanArray = [];
            var valArray = _.pluck(this.listI, objVal.keyval);
            for (var i = valArray.length - 1; i >= 0; i--) {
              cleanArray.push(parseInt(valArray[i].replace(',', ''), 10));
            }
            var from = Math.floor(_.min(cleanArray) / 1000) * 1000;
            var to = Math.ceil(_.max(cleanArray) / 1000) * 1000;
            this.rangeObj[objVal.keyval] = {
              from: from,
              to: to
            };
          }, this);
        },
        // @params {Array} this.rangeObj
        // @init {Array} this.rangeObjC
        updateRangeC: function () {
          this.rangeObjC = _.clone(this.rangeObj, true);
          $log.log('updaterangeC',this.rangeObjC, this.rangeObj);
        },
        // @description init/reset [current] and call update and set methods
        // @assign {Boolean} this.isSliderActive
        update: function () {
          this.current = -1;
          // calls the method to recreate the query string for the results button
          this.getQuery();
          // calls the method to init/recreate the listI Array
          this.updateModel();
          // calls the method to set/update the categoriesI model
          this.setCat();
          // if sliderActive is false calls the method to update the rangeObj model
          if (!this.isSliderActive){
            this.updateRange();
          }
        },
        // ----------- range methods -----------
        // @description run a comparison loop among rangeObj vs rangeObjC,
        // clean filterObj and add new values to the filterObj
        // @param {Object} this.rangeObj
        // @param {Object} this.rangeObjC
        // @modify {Object} this.filterObj
        checkRange: function () {
          if (_.isObject(this.rangeObjC)) {
            var _key, _value;
            _.forEach(this.rangeObj, function (value, key) {
              var sli = this.rangeObjC[key];
              if (value.from !== sli.from || value.to !== sli.to) {
                _key = _.clone(key);
                _value = _.clone(value);
                _.assign(sli, value);
                return false;
              }
            }, this);
            if (_.isObject(_value) && _.isString(_key)) {
              this.addOption(_key, _value.from + '-' + _value.to);
            }
          } 
        },
        // @param {Object} this.slidersI
        // @modify {Object} this.rangeObj
        // @modify {Object} this.rangeObjC
        // @modify {Object} this.filterObj
        resetRange: function (key) {
          var sli = _.find(this.slidersI, {keyval: key});
          this.rangeObj[key] = {
            from: sli.min,
            to: sli.max
          };
          _.assign(this.rangeObjC, this.rangeObj[key]);
          this.filterObj = {};
        },
        // @description private method
        isRangeValue: function (value, key) {
          return this.sliderObj.hasOwnProperty(key) && value.indexOf('-') > -1;
        },
        // ----------- public methods -----------
        // @param {integer} index argument from the iterated list
        // @modify {Object} this.current among index:open and -1:closed
        setCurrent: function(index) {
          this.current = this.current === index ? -1 : index;
        },
        // @params {Array} this.listI
        // @returns list collection amount
        resultsQty: function() {
          return this.listI ? this.listI.length : '0';
        },
        // @param {String} valueKey && key arguments from the iterated list
        // @modify this.filterObj with a new key value pair
        addOption: function(valueKey, key) {
          this.isSliderActive = this.isRangeValue(key, valueKey);
          this.filterObj[valueKey] = key;
        },
        // removes filter option from filterObj
        // @param {integer} index argument from the iterated list
        // @param {Array} this.menuGroup
        // @modify this.filterObj deleting a value pair if founded
        removeOption: function(group, index) {
          this.filterObj = _.omit(this.filterObj, this.menuGroup[group][index].valueKey);
        },
        // @description updates category header if only one option is available
        // @param {Integer} index
        // @param {Array} this.menuGroup
        // @param {Object} this.filterObj
        // @returns HTML to append if uniq condition
        uniq: function(group, index) {
          var cat = this.menuGroup[group][index],
            options = _.keys(cat.options),
            html = '';
          if (options.length === 1) {
            html = '<span>' + options[0] + '</span>';
            if (_.has(this.filterObj, cat.valueKey)) {
              html = html + '<span> <i class="search-close fa fa-times-circle"></i> </span>';
            }
          }
          return $sce.trustAsHtml(html);
        }
      }
    };
  });