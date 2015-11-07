
importScripts("random.min.js");

self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {

        case 'start':
            start(data.config);
            postMessage({status:'created'});
            break;
        case 'evolve':
            postMessage({status:'starting'});
            do_ea();
            break;
    };

}, false);



function start(config){

    var population_size = config.population_size || 500;
    var chromosome_size = config.chromosome_size || 1000;
    period = config.period;

    eo = new Classic( { population_size: population_size,

        chromosome_size: chromosome_size,
        fitness_func: compute,
        tournament_size:5,
        minvalue:-5.0,
        maxvalue:5.0 } );
    //Worker uuid
    uuid = config.worker_uuid;

    var xmlhttp = new XMLHttpRequest();
    // And puts worker info
    xmlhttp.open("PUT", "/worker/"+uuid+"/"+population_size, true);
    xmlhttp.send();

    var generation_count=0;

}


function do_ea() {

    eo.generation();
    //if ( eo.population[0].fitness == traps*trap_b ) {
    //    console.log('finished before');
    //}

    if ( (eo.generation_count % period === 0) ) {


        // gets a random chromosome from the pool
        var xmlhttp = new XMLHttpRequest();
        var url = "/random";
        xmlhttp.open("GET", url, true);
        xmlhttp.onreadystatechange = function() {


            if (xmlhttp.readyState == 4 ) {

                if (xmlhttp.status == 200 /*|| xmlhttp.status == 304*/)
                {
                    var data = JSON.parse(xmlhttp.responseText);
                    if ( data.chromosome ) {
                        eo.incorporate( data.chromosome );
                    }

                }
                else if ( xmlhttp.status == 404)
                {   console.log("404");
                    //There is no population
                    postMessage(
                        {
                            status:'no_work'

                        });
                    console.log("AFTER 404");
                    //No more work
                    //return;

                }

            }
        }


        xmlhttp.send();

        var xmlhttp2 = new XMLHttpRequest();
        // And puts another one in the pool
        //console.log(eo.population[0].vector);

        xmlhttp2.open("PUT", "/one/"+eo.population[0].vector+"/"+eo.population[0].fitness+"/"+uuid, true);
        xmlhttp2.send();

        //IPs
        var xmlhttp3 = new XMLHttpRequest();
        var url = "/IPs";
        var ips = "";
        xmlhttp3.onreadystatechange = function() {
            if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
                var data = JSON.parse(xmlhttp3.responseText);
                ips = Object.keys( data ).length;


                postMessage(
                    {   status:'working',
                        generation_count:eo.generation_count,
                        best:eo.population[0].vector,
                        fitness:eo.population[0].fitness,'period':period,'ips':ips,
                        pop_size: eo.population.length
                    });


            }


        }
        xmlhttp3.open("GET", url, true);
        xmlhttp3.send();



    }

    if ( eo.population[0].fitness < 0  ) {

        setTimeout(do_ea, 5);

    }

    else{

        // And puts another one in the pool
        var xmlhttp4 = new XMLHttpRequest();
        xmlhttp4.open("PUT", "/one/"+eo.population[0].string+"/"+eo.population[0].fitness+"/"+uuid, true);
        xmlhttp4.send();

        postMessage(
            {
                status:'finished',
                generation_count:eo.generation_count,
                best:eo.population[0].string,
                fitness:eo.population[0].fitness,
                'period':period,
                pop_size: eo.population.length
            });

        console.log('finished after')
        //close();
    }
}






var seed= 0x12345678
var engine = new Random(Random.engines.mt19937().seed(seed));



TPI = (Math.PI + Math.PI)
MAX = 5.0;
MIN = (-MAX);
//DIMENSION = 1000
D= 1000
//GROUP_SIZE = 50
m_GROUP_SIZE = 50





var m_nextNextGaussian = 0;
var m_haveNextNextGaussian =false;

function nextGaussian() {
    var multiplier, v1, v2, s;

    if (m_haveNextNextGaussian) {
        m_haveNextNextGaussian = false;
        return m_nextNextGaussian;
    }

    do {
        v1 = ((2.0 * engine.real(0, 1, true)) - 1.0);
        v2 = ((2.0 * engine.real(0, 1, true)) - 1.0);
        s = ((v1 * v1) + (v2 * v2));
    } while ((s >= 1.0) || (s == 0.0));
    multiplier = Math.sqrt(-2.0 * Math.log(s) / s);

    m_nextNextGaussian = (v2 * multiplier);
    m_haveNextNextGaussian = true;

    return (v1 * multiplier);
}

function createShiftVector( dim,  min,  max) {
    var d = [];
    var hw, middle;
    var s;
    var i;

    hw = (0.5 * (max - min));
    middle = (min + hw);


    for (i = (dim - 1); i >= 0; i--) {
        do {
            s = (middle + (nextGaussian() * hw));
        } while ((s < min) || (s > max));
        d[i] = s;
    }

    return d;
}



function createRotMatrix(dim) {
    var m;
    var i, j, k;
    var dp, t;

    m = [];

    outer: for (;;) {

        // initialize
        for (i = (dim - 1); i >= 0; i--) {
            var row = []
            for (j = (dim - 1); j >= 0; j--) {
                row[j] = nextGaussian();
            }
            m[i]=row;
        }

        // main loop of gram/schmidt
        for (i = (dim - 1); i >= 0; i--) {

            //
            for (j = (dim - 1); j > i; j--) {

                // dot product
                dp = 0.0;
                for (k = (dim - 1); k >= 0; k--) {
                    dp += (m[i][k] * m[j][k]);
                }

                // subtract
                for (k = (dim - 1); k >= 0; k--) {
                    m[i][k] -= (dp * m[j][k]);
                }
            }

            // normalize
            dp = 0.0;
            for (k = (dim - 1); k >= 0; k--) {
                t = m[i][k];
                dp += (t * t);
            }

            // linear dependency -> restart
            if (dp <= 0.0) {
                continue outer;
            }
            dp = (1.0 / Math.sqrt(dp));

            for (k = (dim - 1); k >= 0; k--) {
                m[i][k] *= dp;
            }
        }

        return m;
    }
}


function createRotMatrix1D(dim) {
    var a;
    var b;
    var i, j, k;

    a = createRotMatrix(dim);
    b = []

    k = 0;
    for (i = 0; i < dim; i++) {
        for (j = 0; j < dim; j++) {
            b[k++] = a[i][j];
        }
    }

    return b;
}

function createPermVector(dim){
    var array = new Array();
    for (i = 0; i < dim; i++) {
        array[i] = i;
    }


    return engine.shuffle(array)
}

function getMatrixDim( m) {
    // era un cast a (int)
    return parseInt( 0.9 + Math.sqrt(m.length));
}


O = createShiftVector(D,MIN,MAX);
P = createPermVector(D);
M = createRotMatrix1D(m_GROUP_SIZE);


function compute (x) {
    var max, gs, d;
    var s;
    var i, e;

    /** the rotation matrix' dimension */
    gs = getMatrixDim(M);


    d = D;
    max = (d / gs);
    var m_tmp = []

    s = 0.0;
    e = 0.0;
    for (i = 0; i < max; i++) {
        s += shiftedPermRotRastrigin(x, O, P, M,//
            e, gs, m_tmp); //
        e += gs;
    }

    return (s * -1 /*
     * + Kernel.shiftedPermRastrigin(x, this.m_o, this.m_p, e,
     * this.m_dimension - e)
     */);
}



/*
 @param x
 the input vector
 @param o
 the global optimum
 @param P
 the permutation
 @param M
 the rotation matrix
 @param start
 the start index
 @param count
 the number of elements to consider in the computation
 @param z
 a temporary array
 @return the result
 */

function shiftedPermRotRastrigin(  x, o,  P,  M, start, count, z) {
    var upper, max;
    var i, j, k;
    var rz, s;

    // compute z
    i = upper = (count - 1);
    j = (i + start);
    for (; i >= 0; i--, j--) {
        k = P[j];
        z[i] = (x[k] - o[k]);
    }

    // rotate and compute function at the same time:
    max = (count * upper);
    s = 0.0;
    for (i = upper; i >= 0; i--) {

        // rotate
        rz = 0.0;
        for (k = upper, j = max + i; k >= 0; k--, j -= count) {
            rz += (M[j] * z[k]);
        }

        // compute function
        s += ((rz * rz) - (10.0 * Math.cos(TPI * rz)) + 10.0);
    }

    return s;
}


// Creating namespace
var ChromosomeFloat={
    // Creates a single chromosome. Includes all utility functions
    Chromosome: function (vector,fitness,minvalue,maxvalue){

        if( minvalue>maxvalue) throw new RangeError ("Function ChromosomeFloat: Minvalue is bigger than maxvalue", "chromosome-float.js");
        this.vector = ( typeof vector!=="undefined" )?vector.slice():[]; // Copying the values, not the reference to the vector.
        this.fitness = fitness || 0.0;
        this.minvalue = minvalue || 0.0;
        this.maxvalue = maxvalue || 1.0;

    }


    // Flips the whole chromosome: maps [minvalue,maxvalue] into [maxvalue, minvalue]
    , invert: function (chrom) {
        return  new ChromosomeFloat.Chromosome(
            chrom.vector.map( function(e) {
                return (-e+chrom.minvalue+chrom.maxvalue);
            }));
    }

    // Changes the value at one point by some other randomly calculated
    , mutate: function (chrom) {
        var toRet=new ChromosomeFloat.Chromosome( chrom.vector );
        toRet.vector[Math.floor(Math.random()*toRet.vector.length)]=toRet.minvalue+Math.random()*(toRet.maxvalue-toRet.minvalue);
        return  toRet;
    }

    // Interchanges a substring between the two parents
    , crossover: function ( chrom1, chrom2 ) {
        var length = chrom1.vector.length;
        var xover_point = Math.floor( Math.random() * length);
        var range = 1 + Math.floor(Math.random() * (length - xover_point) );
        var new_chrom1 = chrom1.vector.slice(0,xover_point)
            .concat(chrom2.vector.slice(xover_point,xover_point+range))
            .concat(chrom1.vector.slice(xover_point+range));
        var new_chrom2 = chrom2.vector.slice(0,xover_point)
            .concat(chrom1.vector.slice(xover_point,xover_point+range))
            .concat(chrom2.vector.slice(xover_point+range));
        return [new ChromosomeFloat.Chromosome(new_chrom1), new ChromosomeFloat.Chromosome(new_chrom2)];
    }

    // Applies operators to the pool
    , reproduction: function (  pool ) {
        var offspring = [];
        while (pool.length ) {
            var first = pool.splice( Math.floor(Math.random()*pool.length), 1 );
            var second = pool.splice( Math.floor(Math.random()*pool.length), 1 );
            var crossovers = ChromosomeFloat.crossover( first[0], second[0] );
            for ( var i in crossovers ) {
                offspring.push( ChromosomeFloat.mutate(crossovers[i]));
            }
        }
        return offspring;
    }

}


function Classic( options ) {
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

    if ( !this.minvalue || !this.maxvalue ) {
        this.minvalue=0.0;
        this.maxvalue=1.0;
    }

    this.population = [];
//    console.log( this.fitness_obj.apply );
    do {
        var vector=[];
        for( var i=0; i<this.chromosome_size; ++i ) {
            vector[i]=Math.random()*(this.maxvalue-this.minvalue)+this.minvalue;
        }
        var chromosome = new CF.Chromosome( vector,
            this.fitness_obj.apply( vector ) );
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
        new_guys[i].fitness = this.fitness_obj.apply( new_guys[i].vector );
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
    var new_population = CF.reproduction( chosen);
    this.evaluation(new_population);
    this.population = the_best.concat( new_population );
    this.rank(); // ranking twice????
    this.generation_count++;
}


var CF={
    // Creates a single chromosome. Includes all utility functions
    Chromosome: function (vector,fitness,minvalue,maxvalue){

        if( minvalue>maxvalue) throw new RangeError ("Function ChromosomeFloat: Minvalue is bigger than maxvalue", "chromosome-float.js");
        this.vector = ( typeof vector!=="undefined" )?vector.slice():[]; // Copying the values, not the reference to the vector.
        this.fitness = fitness || 0.0;
        this.minvalue = minvalue || 0.0;
        this.maxvalue = maxvalue || 1.0;

    }


    // Flips the whole chromosome: maps [minvalue,maxvalue] into [maxvalue, minvalue]
    , invert: function (chrom) {
        return  new ChromosomeFloat.Chromosome(
            chrom.vector.map( function(e) {
                return (-e+chrom.minvalue+chrom.maxvalue);
            }));
    }

    // Changes the value at one point by some other randomly calculated
    , mutate: function (chrom) {
        var toRet=new ChromosomeFloat.Chromosome( chrom.vector );
        toRet.vector[Math.floor(Math.random()*toRet.vector.length)]=toRet.minvalue+Math.random()*(toRet.maxvalue-toRet.minvalue);
        return  toRet;
    }

    // Interchanges a substring between the two parents
    , crossover: function ( chrom1, chrom2 ) {
        var length = chrom1.vector.length;
        var xover_point = Math.floor( Math.random() * length);
        var range = 1 + Math.floor(Math.random() * (length - xover_point) );
        var new_chrom1 = chrom1.vector.slice(0,xover_point)
            .concat(chrom2.vector.slice(xover_point,xover_point+range))
            .concat(chrom1.vector.slice(xover_point+range));
        var new_chrom2 = chrom2.vector.slice(0,xover_point)
            .concat(chrom1.vector.slice(xover_point,xover_point+range))
            .concat(chrom2.vector.slice(xover_point+range));
        return [new ChromosomeFloat.Chromosome(new_chrom1), new ChromosomeFloat.Chromosome(new_chrom2)];
    }

    // Applies operators to the pool
    , reproduction: function (  pool ) {
        var offspring = [];
        while (pool.length ) {
            var first = pool.splice( Math.floor(Math.random()*pool.length), 1 );
            var second = pool.splice( Math.floor(Math.random()*pool.length), 1 );
            var crossovers = ChromosomeFloat.crossover( first[0], second[0] );
            for ( var i in crossovers ) {
                offspring.push( ChromosomeFloat.mutate(crossovers[i]));
            }
        }
        return offspring;
    }

}


function incorporate( chromosome ) {
    //console.log(chromosome);

    chromosome = chromosome.split(',').map(parseFloat);
    if ( chromosome.length != this.chromosome_size )
        throw "Bad chromosome length" + chromosome.length + "!=" + this.chromosome_size ;

    var new_guy = new CF.Chromosome( chromosome,
        this.fitness_obj.apply( chromosome ),-5.0,5.0 );
    this.population.push( new_guy );
    this.rank();
    this.population.pop(); // extracts the last

}