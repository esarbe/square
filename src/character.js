var ATTR_MIN = 1;
var ATTR_MAX = 6;

Array.prototype.max = function () {
  return Math.max.apply(null, this);
};

Array.prototype.zipWithIndex = function () {

	var zipped = this.map( function (elem, index) {
	  return [elem, index];
	});

	return zipped;
};

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
}

Array.prototype.flatten = function () {
  var flattened = [];

	return this.reduce( function (sink, elem) {
	
	});
};

Array.prototype.min = function () {
  return Math.min.apply(null, this);
};

function invert (matrix) {
	var inverted = [];

	matrix.forEach( function (row, i) {
    row.forEach( function (cell, k) {
			inverted[k] = inverted[k] || []
      inverted[k][i] = matrix[i][k];
		});	
	});
 
	return inverted;
}


function newMatrix() {
  return [
		  [ 1, 1, 1 ],
			[ 1, 1, 1 ],
			[ 1, 1, 1 ]
		];
}

function upperBound (row) {
  var max = row.max();

	// return the difference to the maximum value in the row
	return row.map( function (val) {
		return max - val;
	});
}

// fold two matrices given the function f
// f folds two cells
function fold (m0, m1, f) {
  var folded = [];
  m0.forEach( function (row, i) {
		folded[i] = [];
	  row.forEach( function (cell, k) {
		  folded[i][k] = f(m0[i][k], m1[i][k]);
		});
	});

  return folded;
}

function cellCanBeIncreasedByOne (b, m) {
  if (b == 0 && m < ATTR_MAX) {
	  return true;
	} else return (b > 1); 
}

function and (a, b) {
  return a && b;
}

function evaluateMatrixIncrements (matrix) {
  var ubh = matrix.map(upperBound);
  var ubv = invert(invert(matrix).map(upperBound));

  var cbiboh = fold(ubh, matrix, cellCanBeIncreasedByOne );
  var cbibov = fold(ubv, matrix, cellCanBeIncreasedByOne );

  return fold(cbiboh, cbibov, and);
}

function getValuesAndCoordinates (matrix) {
  var cells = [];
	matrix.forEach( function (row, index0) {
	  row.forEach( function (cell, index1) {
	    cells.push({value: cell, coord: [index0, index1]});
		});
	});

  return cells;
}

function generateCharacter () {
	var character = newMatrix();
  
  for (var a = 0; a < 18; a++) {
    character = incChar(character);
	}

	return character;
}

var attrs =
  [
    [ 6, 4, 3 ],
    [ 2, 1, 4 ],
    [ 4, 2, 1 ],
  ];

var attrs2 =
  [
    [ 6, 6, 6 ],
    [ 6, 6, 6 ],
    [ 6, 6, 6 ],
  ];


Character = {
  inc: incChar,
	build: newMatrix 
}

function canIncrement (cell) {
  return cell.value === true;
}

function copyChar (character) {
  var copy = character.map(function (row) {
    return row.map ( function (cell) {
		  return cell;
		});
	});

	return copy;
}

function printCharacter (character) {
  character.forEach( function (row) {
	  console.log(row);
	});
}

function incChar (character ) {
  var incrCell = getCoordsForIncr(copyChar(character)).randomElement();
  var
	  i = incrCell[0],
	  k = incrCell[1];	
	
	character[i][k]++;    
  return character;
}

function getCoordsForIncr (matrix) {
  return getValuesAndCoordinates(evaluateMatrixIncrements(matrix)).filter(canIncrement).map(function (cell) { return cell.coord });
}

var inc = getCoordsForIncr(attrs).randomElement()

printCharacter(generateCharacter());
