var assert = require('assert');
var Square = require('../src/character.js');

describe('Matrix', function () {
  describe('constructor', function () {
    it('should create a new matrix with rectangular values array', function () {
      var m = Square.Matrix.withSize(3,4);

      assert.equal(m.values.length, 3);
    });
  });
});

describe('Character', function () {
  var allMinValues = {
    values: [
      [1,1,1],
      [1,1,1],
      [1,1,1]
    ]
  };

  describe('constructor', function () {
    it('should create a new character', function () {
      var character = new Square.Character();
      var attrValues = character.attributes.getValues();
      assert.deepEqual(attrValues, allMinValues);
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
      [ { value: 4 }, { value: 5 }, { value: 6 } ],
      [ { value: 5 }, { value: 6 }, { value: 5 } ],
      [ { value: 6 }, { value: 5 }, { value: 5 } ]
    ]
  };
  
  var onlyOnIncrementableCellBounds = {
    values: [
      [2, 1, 0],
      [1, 0, 1],
      [0, 1, 1]
    ]
  };

  var onlyOneIncrementableCellValues = {
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

  describe('getBounds', function () {
    it('should return a matrix that contains the upper bound of each cell', function () {
      
      var attrs = new Square.Character.Attributes(onlyOneIncrementableCell);
      var bounds = attrs.getBounds();
      assert.deepEqual(onlyOnIncrementableCellBounds, bounds);
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

  describe('getValues', function () {
    it('should return a matrix with only the bare values of the attributes', function () {
      var attrs = new Square.Character.Attributes(onlyOneIncrementableCell);

      var attrValues = attrs.getValues();

      assert.deepEqual(onlyOneIncrementableCellValues, attrValues);
    });
  });

});

