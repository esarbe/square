"use strict";

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
  this.values = (template || {}).values || [ [] ];
}

Matrix.fromValues = function (values) {
  var m = new Matrix({values: values});
  
  if (!m.isValid()) {
    throw "values has to be a rectangular array"
  }

  return m;
};

Matrix.withSize = function (width, height) {
  var j = 0,
      k = 0,
      values = [];
 
  for (j = 0; j < width; j++) {
    var row = [];
    for(k = 0; k < height; k++) {
      row.push({});
    }
    values.push(row);
  }
 
  return Matrix.fromValues(values);
};

/**
 * check whether the attributes array is rectangular
 */
Matrix.prototype.isValid = function () {
  var lengths = this.values.map( function (row) {
    return row.length;
  });
  
  var accInit = [ lengths[0] || 0, true];

  var allSameLength = lengths.reduce( function ( acc, b) {
    return [acc[0], acc[0] === b && acc[1]]
  }, accInit );

  return allSameLength;
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

/**
 * merge two array of arrays element wise using the given function f
 *
 * @param first first array of arrays to operate on
 * @param second second array of arrays to operate on
 * @param f function that takes two cell values and returns a new value
 * @returns {Array}
 */
Matrix.prototype.merge = function (other, f) {

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

  return new Matrix({values: merge(this.values, other.values, f)});
}

/**
 * returns the coordinates and values of each cell of the matrix
 *
 * @returns {{ value: {}, coord: [Number, Number] }[]}
 */
Matrix.prototype.getValuesAndCoordinates = function () {

  var mapped = this.values.map( function (row, j) {
    return row.map(function (cell, k) {
      return { value: cell, coord: [j, k] };
    });
  });

  return mapped.flatten();
}

Matrix.prototype.crossMapMerge = function (f, g) {
  var rowWise = this.mapRows(f);
  var columnWise = this.mapColumns(f);

  return rowWise.merge(columnWise, g);
}

var Attributes = function (template) {
  
  this.VALUE_MIN = 1;
  this.VALUE_MAX = 6;
  
  if (template === undefined) {
    template = Matrix.withSize(3,3).map ( function () { return { value : Attributes.VALUE_MIN }; });
  }

  Matrix.call(this, template);
}

Attributes.VALUE_MIN = 1;
Attributes.VALUE_MAX = 6;

Attributes.prototype = new Matrix();

Attributes.prototype.incrementAtRandom = function () {

  function canIncrement (cell) {
    return cell.value;
  }

  function toCellCoordinate (cell) {
    return cell.coord;
  }

  var cellCoords = this.getIsIncrementable().getValuesAndCoordinates();
  var coordinatesForIncrementation = cellCoords.filter(canIncrement).map(toCellCoordinate).randomElement();

  var values = this.values.clone();

  var
      i = coordinatesForIncrementation[0],
      k = coordinatesForIncrementation[1];

  values[i][k].value++;
  return new Attributes({values: values});
}

Attributes.prototype.isValid = function () {
  if (!this.attributes.isValid() || this.attributes.length !== this.attributes[0].length ) {
    return false;
  }

  var upperBoundsRowwise = attributes.map(upperBound);
  var upperBoundsColumnwise = attributes.invert().map(upperBound).invert();
}

Attributes.prototype.getBounds = function () {
  return this.getValues().crossMapMerge(upperBound, Math.min);
}

Attributes.prototype.getValues = function () {
  return this.map(function (v) { return v.value; });
}

Attributes.prototype.getIsIncrementable = function () {
  return evaluateAttributeIncrements(this.getValues());
}

var Character = function (template) {
  this.attributes = (template || {}).attributes || new Attributes();
}

Character.prototype.bake = function () {

  function mergeIsIncrementable (attr, isIncrementable) {
    var merged = attr.clone();
    merged["isIncrementable"] = isIncrementable;
    return merged;
  }

  var incrementable = this.attributes.getIsIncrementable();

  var bakedAttributes = this.attributes.merge(incrementable, mergeIsIncrementable);

  return new Character({attributes: bakedAttributes });
}

Character.generateRandom = function () {
  var character = new Character();

  for (var a = 0; a < 18; a++) {
    character = character.incrementAttributeAtRandom();
  }

  return character.bake();
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
 * check if the given value can be incremented by one given the difference to the upper bound
 * @param value
 * @param differenceToUpperBound
 * @returns {boolean} whether the value can be incremented
 */
function cellValueCanBeIncremented (value, differenceToUpperBound) {
  return differenceToUpperBound > 1 || (differenceToUpperBound == 0 && value < Attributes.VALUE_MAX);
}

/**
 * map each attribute (cell) to a boolean that indicates whether it can be incremented
 *
 * @param attributes
 */
function evaluateAttributeIncrements (attributes) {

  function and (a, b) {
    return a && b;
  }

  var upperBoundsRowwise = attributes.mapRows(upperBound);
  var canBeIncrementedRowwise = attributes.merge(upperBoundsRowwise, cellValueCanBeIncremented );

  var upperBoundsColumnwise = attributes.mapColumns(upperBound);
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

exports.Character = Character;
exports.Character.Attributes = Attributes;
exports.Matrix = Matrix
