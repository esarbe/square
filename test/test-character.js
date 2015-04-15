var assert = require('assert');
var Square = require('../src/character.js');

describe('Character', function () {

  describe('constructor', function () {
    it('should create a new character', function () {
      var character = new Square.Character();
    });
  });

  describe('generateRandom', function () {
    it('should create a new random character', function () {
      var random = Square.Character.generateRandom();
    });
  }); 
});

describe('Attributes', function () {

  var onlyOneIncrementableCell = {
    values: [
      [ 4, 5, 6 ],
      [ 5, 6, 5 ],
      [ 6, 5, 5 ]
    ]
  };

  var isIncrementableCheck = [
    [ true,  false, false],
    [ false, false, false ],
    [ false, false, false ] 
  ];

  describe('constructor with template', function () {
    it('should create a new Attributes object using the template\'s values', function () {
      var attrs = new Square.Character.Attributes(onlyOneIncrementableCell);

      assert.deepEqual(attrs.values, onlyOneIncrementableCell.values);
    });
  });

  describe('getIsIncrementable', function () {
    it('should return a matrix that contains the truth values ' +
         'for whether a cell can be incremented by one', function () {
      var attrs = new Square.Character.Attributes(onlyOneIncrementableCell);

      var isIncrementableValues = attrs.getIsIncrementable().values;
      assert.deepEqual(isIncrementableValues, isIncrementableCheck);
    });
  });


});

