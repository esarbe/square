"use strict";

var ATTR_MIN = 1;
var ATTR_MAX = 6;

Object.prototype.clone = function () {
  return JSON.parse(JSON.stringify(this));
}

Array.prototype.max = function () {
  return Math.max.apply(null, this);
};

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.min = function () {
  return Math.min.apply(null, this);
};

function invert (matrix) {
  var inverted = [];

  matrix.forEach( function (row, i) {
    row.forEach( function (cell, k) {
      inverted[k] = inverted[k] || [];
      inverted[k][i] = matrix[i][k];
    });
  });

  return inverted;
}

var Matrix = function (template) {

  this.values = (template || {}).values || [
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ],
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ],
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ]
  ];
};

Matrix.prototype.invert = function () {
  return new Matrix({values: invert(this.values)});
}

Matrix.prototype.map = function (f) {
  return new Matrix({values: this.values.map(f)});
}

Matrix.prototype.merge = function (other, f) {
  return new Matrix({values: merge(this.values, other.values, f)});
}

var Character = function (template) {
  this.attributes = (template || {}).attributes || new Attributes();
}

var Attributes = function (template) {
  Matrix.call(this, template);
}

Attributes.prototype = new Matrix();

Attributes.prototype.incrementAtRandom = function () {

  var coordinatesForIncrementation = getCoordinatesForCellsThatCanBeIncremented(this).randomElement();

  var values = this.values.clone();

  var
      i = coordinatesForIncrementation[0],
      k = coordinatesForIncrementation[1];

  values[i][k]++;
  return new Attributes({values: values});
}

Character.generateRandom = function () {
  var character = new Character();

  for (var a = 0; a < 18; a++) {
    character = character.incrementAttributeAtRandom();
  }

  return character;
}

Character.prototype.incrementAttributeAtRandom = function () {

  var attributes = this.attributes.incrementAtRandom();
  return new Character({attributes: attributes})
}

Character.prototype.toString = function () {
  return JSON.stringify(this);
}

/**
 * merge two array of arrays element wise using the given function f
 *
 * @param first first array of arrays to operate on
 * @param second second array of arrays to operate on
 * @param f function that takes two cell values and returns a new value
 * @returns {Array}
 */
function merge (first, second, f) {
  var merged = [];
  first.forEach( function (row, i) {
    merged[i] = [];
	row.forEach( function (cell, k) {
	  merged[i][k] = f(first[i][k], second[i][k]);
	});
  });

  return merged;
}

/**
 * check if the given value can be incremented by one given the difference to the upper bound
 * @param value
 * @param differenceToUpperBound
 * @returns {boolean} whether the value can be incremented
 */
function cellValueCanBeIncremented (value, differenceToUpperBound) {
  return differenceToUpperBound > 1 || value < ATTR_MAX;
}

function and (a, b) {
  return a && b;
}

/**
 * map each attribute (cell) to a boolean that indicates whether it can be incremented
 *
 * @param attributes
 */
function evaluateAttributeIncrements (attributes) {

  var upperBoundsRowwise = attributes.map(upperBound);
  var upperBoundsColumnwise = attributes.invert().map(upperBound).invert();

  var canBeIncrementedRowwise = attributes.merge(upperBoundsRowwise, cellValueCanBeIncremented );
  var canBeIncrementedColumnwise = attributes.merge(upperBoundsColumnwise, cellValueCanBeIncremented );

  return canBeIncrementedRowwise.merge(canBeIncrementedColumnwise, and);
}

/**
 * for every element in the array, calculate the difference to the max value in the array
 *
 * @param array
 * @returns array of same length as input array
 *   with each cell's value mapped to the difference to the maximum value in the row
 */
function upperBound (array) {
  var max = array.max();

  return array.map( function (val) {
    return max - val;
  });
}

/**
 * returns an array of tuples with coordinates and value for each cell of the array of arrays
 *
 * @param arrayOfArrays
 * @returns {Array}
 */
Matrix.prototype.getValuesAndCoordinates = function () {

  var mapped = this.values.map( function (row, j) {
    return row.map(function (cell, k) {
      return { value: cell, coord: [j, k] };
    });
  });

  var flatMapped = [].concat.apply([], mapped);

  return flatMapped;
}

function canIncrement (cell) {
  return cell.value === true;
}

function toCellCoordinate (cell) {
  return cell.coord;
}

function getCoordinatesForCellsThatCanBeIncremented (attributes) {
  return evaluateAttributeIncrements(attributes).getValuesAndCoordinates().filter(canIncrement).map(toCellCoordinate);
}

console.log(Character.generateRandom().toString());
//console.log(getCoordinatesForCellsThatCanBeIncremented(new Attributes()));
//console.log(new Attributes().incrementAtRandom().values);
