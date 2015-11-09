#!/usr/bin/env node

'use strict';


var f15 = require('./F15.js');


var  nodeo = require('./nodeo/lib/nodeo.js'),
    Classic = nodeo.classic_float,
    utils = nodeo.utils;

var population_size = process.argv[2] || 10000;
var chromosome_size = process.argv[3] || 1000;

var max_evaluation_count = 10000;



console.log( "Testing chromosomes composed of floats...");
console.log( "Experiment will end when fitness negative fitness is equal to 0 ");


console.log(f15.O);


for (var i=0; i<30; i++)
{
    var eo = new Classic( { population_size: population_size,
        chromosome_size: chromosome_size,
        fitness_func: f15.compute,
        tournament_size:3,
        minvalue:-5.0,
        maxvalue:5.0 } );
    var evaluation_count = 0;

    var  hrstart = process.hrtime();
do {
    var  genstart = process.hrtime();
    eo.generation();
   var genend = process.hrtime(genstart);
    console.info("Gen:%d, %dms", i , genend[0]*1000+genend[1]/1000000);

    evaluation_count+=population_size;

   // console.log( "Fitness: " + eo.population[0].fitness.toFixed(4)+ " Evaluations: " + evaluation_count.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));


} while ( /*eo.population[0].fitness < 0 & */ evaluation_count < max_evaluation_count ); // Fitness is reaching 95% of chromosome size
var hrend = process.hrtime(hrstart);
console.info("Run:%d, %dms", i , hrend[0]*1000+hrend[1]/1000000);
}

console.log(F15.O)