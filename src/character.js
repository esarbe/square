"use strict";
var ATTR_MIN = 1;
var ATTR_MAX = 6;

Object.prototype.clone = function () {
  return JSON.parse(JSON.stringify(this));
}

Array.prototype.max = function () {
  return Math.max.apply(null, this);
}

Array.prototype.flatten = function () {
  return [].concat.apply([], this);
}

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.min = function () {
  return Math.min.apply(null, this);
}

var Matrix = function (template) {

  this.values = (template || {}).values || [
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ],
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ],
    [ ATTR_MIN, ATTR_MIN, ATTR_MIN ]
  ];
}


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

Matrix.prototype.invert = function () {
  return new Matrix({values: invert(this.values)});
}

Matrix.prototype.map = function (f) {

  var mapped = this.values.map(function (row) {
    return row.map(f);
  });

  return new Matrix({values: mapped});
}

Matrix.prototype.mapColumns = function (f) {
  return new Matrix({values: this.invert().values.map(f)}).invert();
}

Matrix.prototype.mapRows = function (f) {
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

Attributes.prototype.isValid = function () {
  var upperBoundsRowwise = attributes.map(upperBound);
  var upperBoundsColumnwise = attributes.invert().map(upperBound).invert();
}

Attributes.prototype.getBounds = function () {
  var upperBoundsRowwise = this.map(upperBound);
  var upperBoundsColumnwise = this.invert().map(upperBound).invert();

  return upperBoundsRowwise.merge(upperBoundsColumnwise, Math.min)
}

Attributes.prototype.getIsIncrementable = function () {
  return evaluateAttributeIncrements(this);  
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

Character.prototype.isValid = function () {
  return this.attributes.isValid();
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
  return differenceToUpperBound > 1 || (differenceToUpperBound == 0 && value < ATTR_MAX);
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

  var upperBoundsRowwise = attributes.mapRows(upperBound);
  var upperBoundsColumnwise = attributes.mapColumns(upperBound);

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
 * returns the coordinates and values of each cell of the matrix
 *
 * @returns {{ value: Object, coord: [Number, Number] }[]}
 */
Matrix.prototype.getValuesAndCoordinates = function () {

  var mapped = this.values.map( function (row, j) {
    return row.map(function (cell, k) {
      return { value: cell, coord: [j, k] };
    });
  });

  return mapped.flatten();
}

function canIncrement (cell) {
  return cell.value === true;
}

function toCellCoordinate (cell) {
  return cell.coord;
}

function getCoordinatesForCellsThatCanBeIncremented (attributes) {
  return attributes.getIsIncrementable().getValuesAndCoordinates().filter(canIncrement).map(toCellCoordinate);
}

exports.Character = Character;
exports.Character.Attributes = Attributes;
exports.upperBound = upperBound;
