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
    var _menu1 = {
      year: {
        keyval: 'year',
        menu: {
          order: 15,
          valueLabel: 'Year'
        }
      },
      make: {
        keyval: 'make',
        menu: {
          order: 5,
          valueLabel: 'Make'
        }
      },
      model: {
        keyval: 'model',
        menu: {
          order: 10,
          valueLabel: 'Model'
        }
      },
      trim: {
        keyval: 'trim',
        menu: {
          order: 16,
          valueLabel: 'Trim'
        }
      },
      standardBody: {
        keyval: 'standard_body',
        menu: {
          order: 20,
          valueLabel: 'Body'
        }
      },
      extColorGeneric: {
        keyval: 'ext_color_generic',
        menu: {
          order: 25,
          valueLabel: 'Color'
        }
      },
      transmission: {
        keyval: 'transmission',
        menu: {
          order: 30,
          valueLabel: 'Transmission'
        }
      },
      fuelType: {
        keyval: 'fuel_type',
        menu: {
          order: 35,
          valueLabel: 'Fuel Type'
        }
      },
      price: {
        keyval: 'price',
        slideorder: 5
      },
      mileage: {
        keyval: 'mileage',
        slideorder: 10
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
      }
    };
    var _vtypeList = [
      {
        value: 'used',
        label: 'Pre Owned'
      },
      {
        value: 'new',
        label: 'New'
      }
    ];
    return {
      menu1: _menu1,
      vtypeList: _vtypeList,
      vtypeEnable: false,
      vmakeList: [],
      displayList: false
    };
  });