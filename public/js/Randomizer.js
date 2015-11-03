/**
 * Created by mariosky on 11/3/15.
 */
var Random = require("./random.min");


var mt = Random.engines.mt19937();



var seed= 0x12345678
var engine = new Random(Random.engines.mt19937().seed(seed));



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







console.log(nextGaussian());

console.log(nextGaussian());

console.log(nextGaussian());

console.log(nextGaussian());


console.log(createShiftVector(1000,0,1));

console.log( engine.shuffle([1,2,3,4,5,6,7,8,9,0]))
