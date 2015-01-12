var ATTR_MIN = 1;
var ATTR_MAX = 6;

var
  UP = [1,0],
  RIGHT = [0,1],
  DOWN = [-1, 0],
  LEFT = [0, -1];

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

function getValueFrom (matrix) {
  return function (coord) { return matrix[coord[1]][coord[0]] };
}

function forCellInMatrix (matrix, f) {
  var indices = [0, 1, 2];
  
  var result = [];

  indices.forEach ( function (y) {
    var row = [];
    indices.forEach ( function (x) { 
      row.push(f([x, y]));
    });
    
    result.push(row);
  });
  
  return result;
} 

function getDominantes (matrix) {
  return forCellInMatrix(matrix, isDominantIn(matrix));
}

function isDominantIn (matrix) {
  return function(cell) {
    var max = Math.max;
    var getValue = getValueFrom(matrix);
    var value = getValue(cell);
    var lrValues = getNeighboars(matrix, cell, [LEFT, RIGHT]).map(getValue);
    var udValues = getNeighboars(matrix, cell, [UP, DOWN]).map(getValue);
    
    var lrDominant = value == max(value, max(lrValues[0], lrValues[1]));
    var udDominant = value == max(value, max(udValues[0], udValues[1]));

    return lrDominant || udDominant;
  };
}


var attrs = 
  [
    [ 5, 4, 2 ],
    [ 3, 1, 5 ],
    [ 4, 2, 3 ],
  ];
  
function getDominanteValues(matrix, cell) {
  var isDominant = isDominantIn(matrix);
  var getValue = getValueFrom(matrix);
  
  return getNeighboars(matrix, cell).filter(isDominant).map(getValue)
}

function canBeIncreasedIn(matrix) {
  var getValue = getValueFrom(matrix);
  var isDominant = isDominantIn(matrix);

  return function (cell) {
    if (isDominant(cell) && getValue(cell) < 6) {
      return true;
    } else {
      var minDominante = Math.min.apply(null, getDominanteValues(matrix, cell));
      return (getValue(cell) + 1) > minDominante;
    }
  };
}



//console.log(canBeIncreasedIn(attrs)([0,0]));

console.log(forCellInMatrix(attrs, canBeIncreasedIn(attrs)));

