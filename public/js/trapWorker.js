


function evolve(){
	
    var population_size = 128;
    var period = 100;
    var traps = 40;
    var trap_len = 4;
    var trap_b =  2;
    var chromosome_size = traps*trap_len;
    
    var trap_fitness = new trap.Trap(  { "l": trap_len, 
					 "a": 1, 
					 "b": trap_b, 
					 "z": trap_len -1  } );
    
    var eo = new Nodeo( { population_size: population_size,
			    chromosome_size: chromosome_size,
			    fitness_func: trap_fitness } );
   

    var generation_count=0;
	alert(eo.population[0].fitness);
}



function Nodeo( options ) {
/*jshint validthis: true */
    for ( var i in options ) {
	this[i] = options[i];
    }
    if ( ! this.population_size ) {
	return new Error ("0 population size");
    }
    if ( ! this.fitness_func ) {
	return new Error ("No fitness func");
    } else if ( typeof( this.fitness_func) === 'function' ) {
	this.fitness_obj = new Fitness( options.fitness_func );
    } else {
	this.fitness_obj = this.fitness_func;
    }
    if ( !this.tournament_size ) {
	this.tournament_size = 2;
    }
    if ( !this.pool_size ) {
	this.pool_size = this.population_size - 2;
    }

    if ( !this.chromosome_size || isNaN(this.chromosome_size) ) {
	throw "Chromosome size error";
    }
    this.population = [];
//    console.log( this.fitness_obj.apply );
    do {
	var this_string = utils.random( this.chromosome_size );
	var chromosome = new Chromosome( this_string,
					 this.fitness_obj.apply( this_string ) );
	this.population.push( chromosome );
    } while( this.population.length < this.population_size );

    // Methods
    this.tournament_selection = tournament_selection;
    this.evaluation = evaluation;
    this.generation= generation;
    this.rank=rank;
    this.incorporate=incorporate;
};



// create fitness function object if it does not exist
function Fitness ( f ) {
 /*jshint validthis: true */  
    this.apply = f;  
}

// Selects a new population of size pool_size via comparing tournament_size chromosomes and taking the best
function tournament_selection( tournament_size, pool_size ) {
/*jshint validthis: true */
    var pool = [];
    if ( tournament_size <= 1 ) {
	return new Error ("Tournament size too small");
    }
    do {
//	var joust = [];
	var best =  this.population[ Math.floor(Math.random()*this.population.length) ] ;
	for ( var i = 1; i < tournament_size; i ++) {
	    var another= this.population[ Math.floor(Math.random()*this.population.length) ];
	    if ( another.fitness > best.fitness) {
		best = another;
	    }
	}
	pool.push( best );
    } while (pool.length < pool_size );
    return pool;
}

// Evaluates all the population not in cache
function evaluation( new_guys ) {
/*jshint validthis: true */
    for (var i in new_guys) {	
	new_guys[i].fitness = this.fitness_obj.apply( new_guys[i].string );
    }
}

// sort population
function rank () {
    /*jshint validthis: true */
    var sorted_population = this.population.sort( function(a,b){ return b.fitness - a.fitness; } );
    this.population = sorted_population;
}

// Single generation
function generation() {
    /*jshint validthis: true */
    var chosen = this.tournament_selection( this.tournament_size, this.pool_size);
    this.rank(); // to get the best
    var the_best = [this.population[0],this.population[1]];
    var new_population = this.population[0].reproduction( chosen);
    this.evaluation(new_population);
    this.population = the_best.concat( new_population );
    this.rank(); // ranking twice????
}



function Trap( options ) {
    for ( var i in options ) {
	this[i] = options[i];
    }
    if ( !this.l ) {
	this.l = 3;
    }
    if ( !this.a ) {
	this.a = 1;
    }
    if ( !this.b ) {
	this.l = 2;
    }
    if ( !this.z ) {
	this.a = this.l-1;
    }

    // Methods
    this.apply = apply;
}

trap.Trap = Trap;

// Applies trap function to chromosome using instance values
function apply( chromosome ){
    return functions.ltrap(chromosome, this.l, this.a, this.b, this.z);    
}




// L-trap function
ltrap = function(x,l,a,b,z) {
    var total = 0;
    for ( var i = 0;  i < x.length; i+= l ) {
	var this_substr = x.substr(  i, l );
	var num_ones = 0;
	for ( var j = 0;  j < this_substr.length; j++ ) {
	  num_ones += (this_substr.substring(j,j+1) === "1"); 
	}
	var this_result;
	if ( num_ones <= z ) {
	  this_result = a*(z-num_ones)/z;
	} else {
	  this_result = b*(num_ones -z)/(l-z);
	}
	total += this_result;
//	console.log("Total " + i + " :"+total + " num_ones " + num_ones );
    }

    return total;
};

functions.ltrap = ltrap;
