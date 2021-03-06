'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchApp.factory:dataHelper
 * @description
 * # helper
 * Contains the model object hash, the default vehicle condition types
 */
angular.module('vehicleSearchApp')
  .factory('dataHelper', function (_, $sce, $log) {
    return {
      // @description get items from the model object that fits key/value request
      // @param {Object} objL
      // @param {property} key
      // @return {Object} object properties 
      getModelItems: function (objL, key) {
        return _.pick(objL, function(objVal) {
          if (key.indexOf('.') > -1) {
            var keysplit = key.split('.');
            return _.has(objVal[keysplit[0]], keysplit[1]);
          }
          return _.has(objVal, key);
        });
      },
      // @description get the query params from the model object that fits key/value request
      // @param {Object} o reference the options Object=
      // @return {Object} params to make an ajax request 
      getAjaxParams: function (o) {
        var keys = _.map(o.model, function (oval) {
          return oval.keyval;
        }).join();
        var params = {
          f: 'json',
          show: '-1',
          type: o.vtypeList[o.vtypeIndex].value,
          k: keys,
          x: '1'
        };
        if (!_.isEmpty(o.vmakeList)) {
          _.assign(params, {
            make: o.vmakeList.join()
          });
        }
        return params;
      },
      // @description replace raw data NaN values with 0 and remove ','
      // @return {Object} complete data with modified values for range objects 
      cleanValues: function (data, objL) {
        var keys = _.map(objL, function (obj) {
          return obj.keyval;
        });
        return _.map(data, function (obj) {
          for (var i = keys.length - 1; i >= 0; i--) {
            if (!_.isNumber(obj[keys[i]])) {
              obj[keys[i]] = /^[0-9,.]+$/.test(obj[keys[i]]) ? parseInt(obj[keys[i]].replace(',', ''), 10) : 0;
            }
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
          var typeIndex = this.pathObj.condition ? this.pathObj.condition.toLowerCase() : -1;
          return typeIndex === -1 ? 0 : _.findIndex(types, {value: typeIndex});
        },
        getPathObject: function () {
          return _.omit(this.pathObj, 'condition');
        },
        updatePairs: function (filterObj) {
          // $log.log('updatePairs', this.pathObj, filterObj);
          this.pathObj = _.assign(_.pick(this.pathObj, 'condition'), filterObj);
          this.pathPairs = _.map(this.pathObj, function (value, key) {
            return key + '=' + value.replace(/\s/g, '+');
          });
          return this.getAjaxView();
        },
        getURI: function () {
          // $log.log('updateURI', this.pathPairs);
          // return '/' + this.pathUniq.join('/') + '/' + this.pathPairs.join('/') + '/';
          return this.pathPairs.join('/');
          // return this.pathUniq.join('/') + '/' + this.pathPairs.join('/');
        },
        getAjaxView: function () {
          var cl = _.map(this.pathPairs, function (value) {
            return value.replace(/&/g, '%26');
          });
          return cl.join('&') + '&json=true&show=all';
        },
        // @description initiate the model based on the path string
        // @init {Array} this.pathValues - array response from splitting the string using /
        // @init {Array} this.pathUniq - filter the pathValues with just the key 
        // @init {Array} this.pathPairs - filter the pathValues with key-value pairs and clean the response
        // @init {Object} this.pathObject - pathPairs Array Object version 
        init: function (path) {
          this.pathValues = _.compact(path.replace(/(?!\/inventory)(\/)(?=\w*\/)/g, '%2F').split('/'));
          this.pathUniq = _.filter(this.pathValues, function (ele) {
            return ele.indexOf('=') < 0;
          });
          this.pathPairs = _.map(_.difference(this.pathValues, this.pathUniq),
            function (ele) {
              var temp = ele.split('=');
              temp[1] = temp[1].replace(/[_]/g, '+');
              return temp.join('=');
            });
          this.pathObj = {};
          _.forEach(this.pathPairs, function (ele) {
            var split = ele.split('=');
            this[split[0]] = split[1].replace(/[+]/g,' ').replace(/(%2F)/g,'/');
          }, this.pathObj);
        }
      },
      model: {
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
        // @description extend the rangeObj with from & to, create the rangeArray
        // @param {Object} this.rangeObj
        // @param {Array} this.listC
        // @init {Array} this.rangeObj
        setRange: function () {
          function retval(vehobj) {
            return vehobj[skey];
          }
          var skey, minval, maxval, rangeval, oprangeval, interval = 5000;
          // extend rangeObj
          _.forEach(this.rangeObj, function (va, key) {
            skey = key;
            minval = _.min(this.listC, retval)[key];
            maxval = _.max(this.listC, retval)[key];
            rangeval = _.range(Math.floor(minval / interval) * interval, (Math.ceil(maxval / interval) + 1) * interval, 5000);
            oprangeval = _.clone(rangeval);
            _.assign(this.rangeObj[key], {
              min: minval,
              max: maxval,
              range: rangeval,
              oprange: oprangeval.reverse(),
              minsel: rangeval[0],
              maxsel: oprangeval[0]
            });
          }, this);

          if (!_.isEmpty(this.filterObj)) {
            _.forEach(_.keys(this.rangeObj), function(key) {
              if (_.has(this.filterObj, key)) {
                var qrysplit = this.filterObj[key].split('-');
                this.rangeObj[key].minsel = parseInt(qrysplit[0]);
                this.rangeObj[key].maxsel = parseInt(qrysplit[1]);
              }
            }, this);
          }
          // $log.log(this.rangeObj);
        },
        // @description constructs query string
        // @param {Object} this.filterObj
        // @assign {String} this.query
        getQuery: function() {
          this.query = _.map(this.filterObj, function(value, key) {
            return key.replace(/([A-Z])/g,'_$1').toLowerCase() + '=' + value.replace(/\s/g,'_');
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
                filReturn.push(obj[ra] >= rangeArray[0] && obj[ra] <= rangeArray[1]);
              }
              return _.indexOf(filReturn, false) > -1 ? false : true;
            });
          }
        },
        // @description updates rangeObj object [from] and [to] values
        // @param {Object} this.rangeObj
        // @param {Object} this.listI
        // @assign {Array} this.rangeObj
        updateRange: function () {
          // _.mapValues(this.rangeObj, function(objVal) {
          //   var cleanArray = [];
          //   var valArray = _.pluck(this.listI, objVal.keyval);
          //   for (var i = valArray.length - 1; i >= 0; i--) {
          //     // cleanArray.push(parseInt(valArray[i].replace(',', ''), 10));
          //     cleanArray.push(valArray[i]);
          //   }
          //   var from = Math.floor(_.min(cleanArray) / 1000) * 1000;
          //   var to = Math.ceil(_.max(cleanArray) / 1000) * 1000;
          //   this.rangeObj[objVal.keyval] = {
          //     from: from,
          //     to: to
          //   };
          // }, this);
        },
        // @params {Array} this.rangeObj
        // @init {Array} this.rangeObjC
        updateRangeC: function () {
          // this.rangeObjC = _.clone(this.rangeObj, true);
          // $log.log('updaterangeC',this.rangeObjC, this.rangeObj);
        },
        // @description init/reset [current] and call update and set methods
        // @assign {Boolean} this.isSliderActive
        update: function () {
          this.current = -1;
          // calls the method to recreate the query string for the results button
          this.getQuery();
          // calls the method to init/recreate the listI Array
          this.updateModel();
          this.sortList();
          // calls the method to set/update the categoriesI model
          this.setCat();
          // if sliderActive is false calls the method to update the rangeObj model
          // if (!this.isSliderActive){
            // this.updateRange();
          // }
          // if viewListGroups initialized calls the updateList
          if (this.isViewListEnable) {
            this.resetList();
          }
        },
        resetList: function () {
          this.counterList = 1;
          this.viewListGroups = Math.ceil(this.listI.length / this.viewListAmount);
          this.viewListRemanent = this.listI.length % this.viewListAmount;
          this.updateList();
        },
        sortList: function () {
          // $log.log(this.sortListDir);
          var temp = _.sortBy(this.listI, this.viewListSort.keyval);
          this.listI = this.sortListDir === 'descending' ? temp.reverse() : temp;
        },
        // ----------- range methods -----------
        // @description run a comparison loop among rangeObj vs rangeObjC,
        // clean filterObj and add new values to the filterObj
        // @param {Object} this.rangeObj
        // @param {Object} this.rangeObjC
        // @modify {Object} this.filterObj
        checkRange: function () {
          // if (_.isObject(this.rangeObjC)) {
          //   var _key, _value;
          //   _.forEach(this.rangeObj, function (value, key) {
          //     var sli = this.rangeObjC[key];
          //     if (value.from !== sli.from || value.to !== sli.to) {
          //       _key = _.clone(key);
          //       _value = _.clone(value);
          //       _.assign(sli, value);
          //       return false;
          //     }
          //   }, this);
          //   if (_.isObject(_value) && _.isString(_key)) {
          //     this.addOption(_key, _value.from + '-' + _value.to);
          //   }
          // }
        },
        // @param {Object} this.slidersI
        // @modify {Object} this.rangeObj
        // @modify {Object} this.rangeObjC
        // @modify {Object} this.filterObj
        resetRange: function (key) {
          $log.log('resetRange', key);
          // var sli = _.find(this.slidersI, {keyval: key});
          // this.rangeObj[key] = {
          //   from: sli.min,
          //   to: sli.max
          // };
          // _.assign(this.rangeObjC, this.rangeObj[key]);
          // this.filterObj = {};
        },
        // @description private method
        isRangeValue: function (value, key) {
          // $log.log('isRangeValue', value,key);
          return this.rangeObj.hasOwnProperty(key) && value.indexOf('-') > -1;
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
          // this.isSliderActive = this.isRangeValue(key, valueKey);
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
            html = '<span> <i class="fa fa-check"></i> ' + options[0] + '</span>';
            if (_.has(this.filterObj, cat.valueKey)) {
              html = html + '<span class="right"> <i class="search-close fa fa-times"></i> </span>';
            }
          }
          return $sce.trustAsHtml(html);
        },
        labelHide: function(group, index) {
          var cat = this.menuGroup[group][index],
            options = _.keys(cat.options);
          return options.length === 1;
        },
        checkSpecials: function() {
          if (_.where(this.listC, {'is_special': 'TRUE'}).length > 0) {
            this.specials = this.specials || 'Show Specials';
            return true;
          } else {
            return false;
          }
        },
        toogleSpecial: function() {
          if (!_.has(this.filterObj, 'is_special')) {
            this.addOption('is_special', 'TRUE');
            this.specials = 'Show All';
          } else {
            this.filterObj = _.omit(this.filterObj, 'is_special');
            this.specials = 'Show Specials';
          }
        },
        updateList: function() {
          var todrop = this.viewListAmount * (this.viewListGroups - this.counterList);
          if (this.counterList === 1 && this.viewListRemanent !== 0) {
            todrop = todrop - this.viewListAmount;
            this.counterList++;
          }
          this.viewList = _.dropRight( _.clone(this.listI), todrop);
          this.counterList++;
          $log.log('viewList.length',this.viewList.length);
        }
      }
    };
  });
