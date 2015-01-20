var ATTR_MIN = 1;
var ATTR_MAX = 6;

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

var
  UP = [1,0],
  RIGHT = [0,1],
  DOWN = [-1, 0],
  LEFT = [0, -1];

var ROW = [LEFT, RIGHT];
var COLUMN = [UP, DOWN];

function getNeighboars (matrix, cell, neighbourOffsets) {
  var
    x = cell[0],
    y = cell[1];
  
  var neighbourOffsets = neighbourOffsets || [ UP, RIGHT, DOWN, LEFT ];
  
  var neighbourCoordinates = neighbourOffsets.map( function (offsets) {
   var
      xLength = matrix.length,
      yLength = matrix[0].length;
    var xCoord = (offsets[0] + x + xLength) % (xLength);
    var yCoord = (offsets[1] + y + yLength) % (yLength);

    return [xCoord, yCoord];
  });

  return neighbourCoordinates;
}

function getValueIn (matrix) {
  return function (coord) { return matrix[coord[1]][coord[0]] };
}

function forCellInMatrix (matrix) { 
  return function (f) {
  
    return matrix.map(function (row) {
      return row.map( function (cell) {
        return f(row);
      });
    });
  };
}

function getDominantes (matrix) {
  return forCellInMatrix(matrix)(isDominantIn(matrix));
}

function isDominantIn (matrix) {
  return function (orientation) {
	  return function (cell) {
			return getValueIn(matrix)(cell)   
    };
  };
}

var attrs =
  [
    [ 5, 4, 2 ],
    [ 3, 1, 5 ],
    [ 4, 2, 3 ],
  ];
  
function getDominanteValueForCellAndOrientationIn(matrix) {
  return function (cell, orientation) {
    var isDominant = isDominantIn(matrix)(orientation);
    var getValue = getValueIn(matrix);
  
    return getNeighboars(matrix, cell, orientation).filter(isDominant).map(getValue).max();
  };
}

function getLimitsIn (matrix) {
  var getValue = getValueIn(matrix);
  var getDominanteValueForCellAndOrientation = getDominanteValueForCellAndOrientationIn(matrix);

	return function (cell) {
		var cellValue = getValue(cell);

	  return {
			lowerBounds: 1,
		  upperBounds: 2
		};
	};
}

function getLowerBoundIn (matrix) {
  var getValue = getValueIn(matrix);
  var getDominanteValueForCellAndOrientation = getDominanteValueForCellAndOrientationIn(matrix);


  return function (cell) {
	};
};

function getUpperBoundIn (matrix) {
  
	var getValue = getValueIn(matrix);
  var getDominanteValueForCellAndOrientation = getDominanteValueForCellAndOrientationIn(matrix);
  
	return function (cell) {

	  var colMax = getDominanteValueForCellAndOrientation(cell, COLUMN);
	  var rowMax = getDominanteValueForCellAndOrientation(cell, ROW);

    /*if (isDominantIn(matrix)(cell)(ROW) && isDominantIn(matrix)(cell)(COLUMN)) {
		  return ATTR_MAX; 
		} else if (isDominantIn(matrix)(cell)(ROW)) {
			return colMax - 1; 
		} else if (isDominantIn(matrix)(cell)(COLUMN)) {
		  return rowMax - 1; 
		} else {
		  return Math.min(rowMax, colMax) - 1;
		}*/
    
	};
}

function isCellDominantIn(matrix, cell) {
  return function (orientation) {
	  return isDominantIn(matrix)(cell)(orientation); 
	};
}


console.log(attrs);
console.log(forCellInMatrix(attrs)(getUpperBoundIn(attrs)));
console.log(forCellInMatrix(attrs)(isCellDominantIn(ROW)));

