var Square = {};

(function (Square) {
  "use strict";

  var ATTRIBUTES_VALUE_MAX = 6;

  // might not be efficient, but it works for now
  Object.prototype.clone = function () {
    return JSON.parse(JSON.stringify(this));
  }
 
  function zip () {
    var args = [].slice.call(arguments);
    var longest = args.reduce(function(a,b){
      return a.length>b.length ? a : b
    }, []);

    return longest.map(function(_,i){
      return args.map(function(array){return array[i]})
    });
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

  /**
   * create a new matrix from a rectangular array
   */
  Matrix.fromValues = function (values) {
    var m = new Matrix({values: values});
    
    if (!m.isValid()) {
      throw "values has to be a rectangular array"
    }

    return m;
  };

  /**
   * create a new matrix with given width and height
   */
  Matrix.withSize = function (width, height) {
    var j = 0,
        k = 0,
        values = [];
   
    for (j = 0; j < width; j++) {
      var row = [];
      for(k = 0; k < height; k++) {
        row.push(0);
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
    
    var accInit = [ lengths[0] || 0, true ];

    var allSameLength = lengths.reduce( function ( acc, b) {
      return [acc[0], acc[0] === b && acc[1]]
    }, accInit );

    return allSameLength;
  }
  
  Matrix.prototype.transpose = function () {
    function transpose (matrix) {
      var transposed = matrix[0].map( function (col, i) {
        return matrix.map( function (row) {
          return row[i];
        });
      });

      return transposed;
    }

    return new Matrix({values: transpose(this.values)});
  }

  Matrix.prototype.map = function (f) {
    var mapped = this.values.map(function (row, i) {
      return row.map(function (cell, k) {
        return f(cell, [i, k]);
      } );
    });

    return new Matrix({values: mapped});
  }

  Matrix.prototype.mapColumns = function (f) {
    return new Matrix({values: this.transpose().values.map(f)}).transpose();
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

  /**
   * apply f row and column wise and use g to merge to two
   * resulting matrices
   */
  Matrix.prototype.crossMapMerge = function (f, g) {
    var rowWise = this.mapRows(f);
    var columnWise = this.mapColumns(f);

    return rowWise.merge(columnWise, g);
  }

  class Ruleset {

    incrementRandomAttribute (attributes) {

      function toValue (cell) {
        return cell.value;
      }

      function toCellCoordinate (cell) {
        return cell.coord;
      }

      var cellCoords =
        attributes
          .map(toValue)
          .crossMapMerge(canBeIncremented, and)
          .getValuesAndCoordinates();

      var coordinatesForIncrementation =
        cellCoords
          .filter(toValue)
          .map(toCellCoordinate)
          .randomElement();

      var values = attributes.values.clone();

      var
          i = coordinatesForIncrementation[0],
          k = coordinatesForIncrementation[1];

      values[i][k].value++;
      return Matrix.fromValues(values);
    }

    generateRandom () {
      var attributes = Matrix.withSize(3,3).map( function (cell) { return { value: 1 }} )

      for (var a = 0; a < 18; a++) {
        attributes = this.incrementRandomAttribute(attributes);
      }

      return new Character({attributes: attributes})
    }
  }

  class Character {
     constructor({attributes}) {
       this.attributes = attributes;
     }
  }


  /**
   * check if the given value can be incremented by one given the difference to the upper bound
   * @param value
   * @param differenceToUpperBound
   * @returns {boolean} whether the value can be incremented
   */
  function cellValueCanBeIncremented (value, differenceToUpperBound) {
    return differenceToUpperBound > 1 || (differenceToUpperBound == 0 && value < ATTRIBUTES_VALUE_MAX);
  }

  function and (a, b) {
    return a && b;
  }

  /**
   * for every element in the array, calculate the difference to the max value in the array
   *
   * @param array
   * @returns array of same length as input array
   *   with each cell's value mapped to the difference to the maximum value in the original array
   */
  function upperBound (array) {
    var max = array.max();

    return array.map( function (val) {
      return max - val;
    });
  }

  function canBeIncremented (array) {
    var max = array.max();

    return array.map( function (value) {
      var differenceToMax = max - value;
      return differenceToMax > 1 || (differenceToMax == 0 && value < ATTRIBUTES_VALUE_MAX);
    });
  }

  function canBeDecremented (array) {
    var maxCanBeDecremented = upperBound(array).indexOf(1) === -1;
    var max = array.max();
    var isMax = array.map( function (v) { return v === max });

    return zip(array, isMax).map( function (v) {
      var value = v[0],
        isMax = v[1];
      return (isMax && maxCanBeDecremented) || (!isMax && value > 1);
    });
  }


  Square.Character = Character;
  Square.Matrix = Matrix
  Square.Ruleset = new Ruleset();

}(Square));

if (typeof exports !== 'undefined') {
  exports.Matrix = Square.Matrix;
  exports.Character = Square.Character;
  exports.Ruleset = Square.Ruleset;
}

