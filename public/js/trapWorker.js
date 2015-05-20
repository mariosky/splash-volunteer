

self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
        start();
        postMessage('WORKER STARTED');
        break;
    case 'evolve':
        do_ea();
        break;
        };
  
    }, false);




function start(){
	
    var population_size = 128;
        period = 100;
        traps = 40;
    var trap_len = 4;
        trap_b =  2;
    var chromosome_size = traps*trap_len;
    
    var trap_fitness = new trap.Trap(  { "l": trap_len, 
					 "a": 1, 
					 "b": trap_b, 
					 "z": trap_len -1  } );
    
    eo = new Nodeo( { population_size: population_size,
			    chromosome_size: chromosome_size,
			    fitness_func: trap_fitness } );
   

    var generation_count=0;
	
}

function do_ea() {
    eo.generation();

    

    if ( (eo.generation_count % period === 0) ) {
        postMessage( 
            {generation_count:eo.generation_count, 
             best:eo.population[0].string, 
             fitness:eo.population[0].fitness});
    
        // gets a random chromosome from the pool
        var xmlhttp = new XMLHttpRequest();
        var url = "/random";
        xmlhttp.open("GET", url, true);
        xmlhttp.onreadystatechange = function() {
           if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var data = JSON.parse(xmlhttp.responseText);
                if ( data.chromosome ) {
                    eo.incorporate( data.chromosome );
                   }
                }

            }
        xmlhttp.send();
          
        var xmlhttp2 = new XMLHttpRequest();
        // And puts another one in the pool
        xmlhttp2.open("PUT", "/one/"+eo.population[0].string+"/"+eo.population[0].fitness, true);
        xmlhttp2.send();

        //IPs
        var xmlhttp3 = new XMLHttpRequest();
        var url = "/IPs";
        xmlhttp3.onreadystatechange = function() {
            if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
                var data = JSON.parse(xmlhttp3.responseText);
                }

            }
        xmlhttp3.open("GET", url, true);
        xmlhttp3.send();
    }

    if ( eo.population[0].fitness < traps*trap_b ) {
        setTimeout(do_ea, 5);
    }
    else{

        // And puts another one in the pool
        var xmlhttp4 = new XMLHttpRequest();
        xmlhttp4.open("PUT", "/one/"+eo.population[0].string+"/"+eo.population[0].fitness, true);
        xmlhttp4.send();

    }
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
    this.generation_count=0;
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
    var new_population = this.population[0].reproduction(chosen);
    this.evaluation(new_population);
    this.population = the_best.concat( new_population );
    this.rank(); // ranking twice????
    this.generation_count++;
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

trap = {}
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

functions = {}
functions.ltrap = ltrap;

var utils = {};

// Create a random chromosome
utils.random= function (length){
    var chromosome = '';
    for ( var i = 0; i < length; i++ ){
    chromosome = chromosome + ((Math.random() >= 0.5)? "1": "0") ;
    }
    
    return chromosome;
};

// Computes maxOnes fitness
utils.max_ones = function (chromosome){
    var ones = 0;
    console.log( "MO " + chromosome);
    for ( var i=0; i < chromosome.length; i++ ){ 
    ones += parseInt(chromosome.charAt(i));
    }
    return ones;
};

// Creates a single chromosome. Includes all utility functions
function Chromosome(string,fitness){
    this.string = string;
    this.fitness = fitness;

    // functions
    this.invert = invert;
    this.mutate = mutate;
    this.crossover=crossover;
    this.reproduction=reproduction;
}



// Bit-flips the whole chromosome
function invert (chromosome) {
    var inverted='';
    for (var i = 0; i < chromosome.string.length; i ++ ) {
    inverted += chromosome.string.charAt(i).match(/1/)?"0":"1";
    }
    return new Chromosome (inverted);
}

// Bit-flips a single bit
function mutate (chromosome ) {

    var mutation_point = Math.floor( Math.random() * chromosome.string.length);
    var temp = chromosome.string;
    var flip_bit = temp.charAt(mutation_point).match(/1/)?"0":"1";
    var clone = temp.substring(0,mutation_point) +
    flip_bit + 
    temp.substring(mutation_point+1,temp.length) ;
    return new Chromosome( clone );
}

// Interchanges a substring between the two parents
function crossover ( chrom1, chrom2 ) {
    var length = chrom1.string.length;
    var xover_point = Math.floor( Math.random() * length);
    var range = 1 + Math.floor(Math.random() * (length - xover_point) );
    var new_chrom1 = chrom1.string.substr(0,xover_point);
    var new_chrom2 = chrom2.string.substr(0,xover_point);
    new_chrom1+= chrom2.string.substring(xover_point,xover_point+range) +
    chrom1.string.substring(xover_point+range,length);
    new_chrom2+= chrom1.string.substring(xover_point,xover_point+range) +
    chrom2.string.substring(xover_point+range,length);
    return [new Chromosome(new_chrom1), new Chromosome(new_chrom2)];
}

// Applies operators to the pool
function reproduction(  pool ) {
/*jshint validthis: true */
    var offspring = [];
    while (pool.length ) {
    var first = pool.splice( Math.floor(Math.random()*pool.length), 1 );
    var second = pool.splice( Math.floor(Math.random()*pool.length), 1 );
    var crossovers = this.crossover( first[0], second[0] );
    for ( var i in crossovers ) {
        offspring.push( this.mutate(crossovers[i]));
    }
    }
    return offspring;
}

function incorporate( chromosome ) {
//    console.log(chromosome);
    if ( chromosome.length != this.chromosome_size )
    throw "Bad chromosome length" + chromosome.length + "!=" + this.chromosome_size ;
    var new_guy = new Chromosome( chromosome,
                  this.fitness_obj.apply( chromosome ) );
    this.population.push( new_guy );
    this.rank();
    this.population.pop(); // extracts the last
    
}
