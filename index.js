var fs = require('fs'),
express = require('express'),
app = express(),
winston = require('winston'),
loggly = require('winston-loggly'),
App = require("app.json"); // Used for configuration and by Heroku

// Includes termination condition
app.is_solution = require("./is_solution.js");
// Other configuration variables 
app.config = App.new(__dirname + "/app.json");

// configure for openshift or heroku
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'; 
app.set('port', (process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 5555));
app.set('trust proxy', true );
var log_dir = process.env.OPENSHIFT_DATA_DIR || "log";
if (!fs.existsSync(log_dir)){
    fs.mkdirSync(log_dir);
}
// set up static dir
app.use(express.static(__dirname + '/public'))

// set up experimente sequence
var sequence = 0;
var temp = new Date();
var date_str = temp.getFullYear() + "-" + (1 + temp.getMonth()) + "-"+ temp.getDate();

var max_pool_size=10000;

// create logger to console and file
var logger = new (winston.Logger)({
    transports: [
	new (winston.transports.Console)( { level: 'info'} ),
	new (winston.transports.File)({ filename: log_dir+'/nodio-'+date_str+ "-" + sequence+'.log', level: 'info' })
    ]
});

// set up Loggly logger if it is configured by env variables
if ( process.env.LOGGLY_TOKEN && process.env.LOGGLY_PASS && process.env.LOGGLY_USER) {
    logger.add( winston.transports.Loggly, 
		{ inputToken: process.env.LOGGLY_TOKEN ,
		  level: 'info',
		  subdomain: process.env.LOGGLY_USER,
		  json: true,
		  "auth": {
		      "username": process.env.LOGGLY_USER,
		      "password": process.env.LOGGLY_PASS
		  }
		} );
}

// internal variables
var chromosomes = {};
var IPs = {};

// Retrieves a random chromosome
app.get('/random', function(req, res){
    if (Object.keys(chromosomes ).length > 0) {
	var keys = Object.keys(chromosomes );
	var one = keys[ Math.floor(keys.length*Math.random())];
	res.send( { 'chromosome': one } );
	logger.info('get');
    } else {
	res.status(404).send('No chromosomes yet');
    }
    
});

// Retrieves the whole chromosome pool
app.get('/chromosomes', function(req, res){
    res.send( chromosomes );
});

// Retrieves the IPs used
app.get('/IPs', function(req, res){
    res.send( IPs );
});

// Retrieves the sequence number
app.get('/seq_number', function(req, res){
    res.send( { "number": sequence} );
});

// Adds one chromosome to the pool, with fitness
app.put('/one/:chromosome/:fitness/:uuid', function(req, res){
    if ( req.params.chromosome ) {
// Temporal solution for max_pool_size

	if (Object.keys(chromosomes).length > max_pool_size )
	{
        console.log(Object.keys(chromosomes).length);
		var keys = Object.keys(chromosomes );
		var one = keys[ Math.floor(keys.length*Math.random())];
		delete chromosomes[one];

	}

	chromosomes[ req.params.chromosome ] = req.params.fitness; // to avoid repeated chromosomes


	var client_ip;
	if ( ! process.env.OPENSHIFT_NODEJS_IP ) { // this is not openshift
	    client_ip = req.connection.remoteAddress;
	} else {
	    client_ip = req.headers['x-forwarded-for'];
	}

	if ( !IPs[ client_ip ] ) {
	    IPs[ client_ip ]=1;
	} else {
	    IPs[ client_ip ]++;
	}

	logger.info("put", { chromosome: req.params.chromosome,
			     fitness: parseInt(req.params.fitness),
			     IP: client_ip,
	             worker_uuid:req.params.uuid} );
	res.send( { length : Object.keys(chromosomes).length });
	if ( app.is_solution( req.params.chromosome, req.params.fitness, app.config.vars.traps, app.config.vars.b ) ) {
	    console.log( "Solution!");
	    logger.info( "finish", { solution: req.params.chromosome } );
	    chromosomes = {};
	    sequence++;
	    logger.info( { "start": sequence });	    
	}
    } else {
	res.send( { length : 0 });
    }
    
});


// Logs worker info
app.put('/worker/:uuid/:popsize', function(req, res){

	var client_ip;
		if ( ! process.env.OPENSHIFT_NODEJS_IP ) { // this is not openshift
			client_ip = req.connection.remoteAddress;
		} else {
			client_ip = req.headers['x-forwarded-for'];
		}

		logger.info("worker", {
			IP: client_ip,
			worker_uuid:req.params.uuid,
		    pop_size:req.params.popsize} );
		res.send( { length : 0 });

});


// Error check
app.use(function(err, req, res, next){
    //check error information and respond accordingly
    console.error( "Exception in server ", err.stack);
});

// Start listening
app.listen(app.get('port'), server_ip_address, function() {
    console.log("Node app is running at localhost:" + app.get('port'));
    logger.info( { "start": sequence });
})

// Exports for tests
module.exports = app;
