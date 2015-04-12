var assert = require('assert');
var Square = require('../src/character.js');


describe('Character', function () {

	describe('constructor', function () {
	  it('should create a new character', function () {
		 	character = new Square.Character();
   });
	});

  describe('generateRandom', function () {
    it('should create a new random character', function () {
		  Square.Character.generateRandom();
		});	
	}); 
});
