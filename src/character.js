var Square = {};

(function (context) {
  "use strict";

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
        row.push({});
      }
      values.push(row);
    }
   
    return Matrix.fromValues(values);
  };

  Matrix.prototype.point = function (template) {
    return new Matrix(template);
  }

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

    return this.point({values: mapped});
  }

  Matrix.prototype.mapColumns = function (f) {
    return this.point({values: this.transpose().values.map(f)}).transpose();
  }

  Matrix.prototype.mapRows = function (f) {
    return this.point({values: this.values.map(f)});
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

    return this.point({values: merge(this.values, other.values, f)});
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

  function Attributes(template) {
    
    this.VALUE_MIN = 1;
    this.VALUE_MAX = 6;
    
    template = template || Matrix.withSize(3,3).map(function () { 
      return { value : Attributes.VALUE_MIN }; });

    Matrix.call(this, template);
  }

  Attributes.prototype.point = function (template) {
    return new Attributes(template);
  }

  Attributes.VALUE_MIN = 1;
  Attributes.VALUE_MAX = 6;

  Attributes.prototype = new Matrix();

  Attributes.prototype.decrement = function (coords) {
    return this.mutate(coords, this.getIsDecrementable, -1);
  }

  Attributes.prototype.increment = function (coords) {
    return this.mutate(coords, this.getIsIncrementable, 1);
  } 
  
  Attributes.prototype.mutate = function (coords, verify, value) {
    var mutationIsValid = verify.call(this);

    if (mutationIsValid.values[coords[0]][coords[1]] === true) {
      var mutated = this.values.clone();
      mutated[coords[0]][coords[1]].value += value;
      return new Attributes({values: mutated});
    } else {
      return this;
    }
  }

  Attributes.prototype.incrementAtRandom = function () {
    function canIncrement (cell) {
      return cell.value;
    }

    function toCellCoordinate (cell) {
      return cell.coord;
    }

    var cellCoords = 
      this
        .getIsIncrementable()
        .getValuesAndCoordinates();

    var coordinatesForIncrementation = 
      cellCoords
        .filter(canIncrement)
        .map(toCellCoordinate)
        .randomElement();

    var values = this.values.clone();

    var
        i = coordinatesForIncrementation[0],
        k = coordinatesForIncrementation[1];

    values[i][k].value++;
    return this.point({values: values});
  }

  Attributes.prototype.isValid = function () {
    if (!this.attributes.isValid() || this.attributes.length !== this.attributes[0].length ) {
      return false;
    }

    var upperBoundsRowwise = attributes.map(upperBound);
    var upperBoundsColumnwise = attributes.transpose().map(upperBound).transpose();
  }

  Attributes.prototype.getValues = function () {
    return this.map(function (v) { return v.value; });
  }

  /**
   * return a Matrix with booleans indicating whether the coresponding
   * cell can be incremented
  */
  Attributes.prototype.getIsIncrementable = function () {
    return this.getValues().crossMapMerge(canBeIncremented, and);
  }

  Attributes.prototype.getIsDecrementable = function () {
    return this.getValues().crossMapMerge(canBeDecremented, and);
  }

  var Character = function (template) {
    this.attributes = new Attributes((template || {}).attributes);
  }

  Character.prototype.bake = function () {

    function merge (propertyName) {
      return function (attr, propertyValue) {
        var merged = attr.clone();
        merged[propertyName] = propertyValue;
        return merged;
      }
    }

    var mergeIsIncrementable = merge("isIncrementable");
    var mergeIsDecrementable = merge("isDecrementable");
    var mergeCoordinates = merge("coords");

    var coordinates = this.attributes.map( function (cell, coords) {
      return coords;
    });

    var incrementable = this.attributes.getIsIncrementable();
    var decrementable = this.attributes.getIsDecrementable();

    var bakedAttributes =
      this.attributes
        .merge(incrementable, mergeIsIncrementable)
        .merge(decrementable, mergeIsDecrementable)
        .merge(coordinates, mergeCoordinates);

    return new Character({attributes: bakedAttributes });
  }

  Character.prototype.decrementAttribute = function (coords) {
    var decremented = this.attributes.decrement(coords); 

    return new Character({attributes: decremented}).bake();
  }
  
  Character.prototype.incrementAttribute = function (coords) {
    var incremented = this.attributes.increment(coords); 

    return new Character({attributes: incremented}).bake();
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
      return differenceToMax > 1 || (differenceToMax == 0 && value < Attributes.VALUE_MAX);
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
  Square.Character.Attributes = Attributes;
  Square.Matrix = Matrix

}(Square));

if (typeof exports !== 'undefined') {
  exports.Character = Square.Character;
  exports.Matrix = Square.Matrix;
}

