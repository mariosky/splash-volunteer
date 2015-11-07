#!/usr/bin/env node

'use strict';


var f15 = require('./F15.js');


var  nodeo = require('./nodeo/lib/nodeo.js'),
    Classic = nodeo.classic_float,
    utils = nodeo.utils;

var population_size = process.argv[2] || 700;
var chromosome_size = process.argv[3] || 1000;



var eo = new Classic( { population_size: population_size,
    chromosome_size: chromosome_size,
    fitness_func: f15.compute,
    tournament_size:3,
    minvalue:-5.0,
    maxvalue:5.0 } );

console.log( "Testing chromosomes composed of floats...");
console.log( "Experiment will end when fitness negative fitness is equal to 0 ");

var evaluation_count = 0;
do {
    eo.generation();
    evaluation_count+=population_size;
    console.log( "Fitness: " + eo.population[0].fitness.toFixed(4)+ " Evaluations: " + evaluation_count.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));


} while ( eo.population[0].fitness < 0 ); // Fitness is reaching 95% of chromosome size

console.log(eo.population[0]);