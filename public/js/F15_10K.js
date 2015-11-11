#!/usr/bin/env node

'use strict';


var f15 = require('./F15.js');


var v = f15.createShiftVector(1000,-5,5);


for (var i=0; i<30; i++) {
    var  hrstart = process.hrtime();

    for (var j=0; j<10000; j++) {

       var r = f15.compute(v);
    }

    var hrend = process.hrtime(hrstart);
    console.info( hrend[0]*1000+hrend[1]/1000000);


}

