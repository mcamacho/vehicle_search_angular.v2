'use strict';

/**
 * @ngdoc function
 * @name vehicleSearchOpt.factory:sourceFactory
 * @description
 * # sourceFactory
 * Contains the menu object hash, the default vehicle condition types
 */
angular.module('vehicleSearchOpt', [])
  .factory('sourceFactory', function () {
    var _menuGroupOrder = ['Basic', 'Advanced'];
    var _menu = {
      make: {
        keyval: 'make',
        menu: {
          group: 'Basic',
          button: true,
          order: 5,
          valueLabel: 'Make'
        }
      },
      model: {
        keyval: 'model',
        menu: {
          group: 'Basic',
          button: true,
          order: 10,
          valueLabel: 'Model'
        }
      },
      trim: {
        keyval: 'standard_trim',
        menu: {
          group: 'Basic',
          button: true,
          order: 13,
          valueLabel: 'Trim'
        }
      },
      year: {
        keyval: 'year',
        menu: {
          group: 'Basic',
          button: true,
          order: 15,
          valueLabel: 'Year'
        }
      },
      standardBody: {
        keyval: 'standard_body',
        menu: {
          group: 'Advanced',
          button: true,
          order: 20,
          valueLabel: 'Body'
        }
      },
      extColorGeneric: {
        keyval: 'ext_color_generic',
        menu: {
          group: 'Advanced',
          button: true,
          order: 25,
          valueLabel: 'Color'
        }
      },
      transmission: {
        keyval: 'transmission',
        menu: {
          group: 'Advanced',
          button: true,
          order: 30,
          valueLabel: 'Transmission'
        }
      },
      fuelType: {
        keyval: 'fuel_type',
        menu: {
          group: 'Advanced',
          button: true,
          order: 35,
          valueLabel: 'Fuel Type'
        }
      },
      price: {
        keyval: 'price',
        menu: {
          group: 'Range',
          slider: true,
          order: 5,
          valueLabel: 'Price'
        }
      },
      mileage: {
        keyval: 'mileage',
        menu: {
          group: 'Range',
          slider: true,
          order: 10,
          valueLabel: 'Mileage'
        }
      },
      vin: {
        keyval: 'vin'
      },
      image1: {
        keyval: 'image_1'
      },
      extColorCode: {
        keyval: 'ext_color_code'
      },
      evoxId: {
        keyval: 'evox_id'
      },
      msrp: {
        keyval: 'msrp'
      },
      certified: {
        keyval: 'certified'
      },
      special: {
        keyval: 'is_special'
      }
    };
    var _sortList = ['year','model','standardBody','mileage','price'];
    var _vtypeList = [
      {
        value: 'new',
        label: 'New'
      },
      {
        value: 'used',
        label: 'Pre Owned'
      },
      {
        value: 'certified',
        label: 'Certified'
      }
    ];
    return {
      dataUrl: 'http://api.dealerx.com/_api/',
      menuGroupOrder: _menuGroupOrder,
      menu: _menu,
      vtypeList: _vtypeList,
      vmakeList: [],
      isVtypeEnable: false,
      isViewListEnable: false,
      isUrlHistoryEnable: true,
      viewListAmount: 10,
      vtypeIndex: 0,
      predata: [],
      viewUpdateCall: null,
      sortList: _sortList,
      sortListDir: 'ascending',
      viewListSortKey: 'year',
      postdatacall: function(query){
        return query;
      }
    };
  });