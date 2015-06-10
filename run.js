var Square = require('./src/character.js');
var count =  function (buckets, curr) {
  buckets[curr.value.value] = buckets[curr.value.value] || [];
  buckets[curr.value.value][curr.coord[0]] = buckets[curr.value.value][curr.coord[0]] || [];
  buckets[curr.value.value][curr.coord[0]][curr.coord[1]] = (buckets[curr.value.value][curr.coord[0]][curr.coord[1]] || 0) + 1;
	return buckets;
}

var chars = [];
var buckets = [];
for (i = 0; i < 100000; i++) {
  Square.Character.generateRandom().attributes.getValuesAndCoordinates().reduce(count, buckets);
}

console.log(JSON.stringify(buckets));
