/**
 * Created by mariosky on 11/3/15.
 */
var Random = require("./random.min");
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

function Test(){

    console.log(nextGaussian());

    console.log(nextGaussian());

    console.log(nextGaussian());

    console.log(nextGaussian());


    console.log(createShiftVector(1000,0,1));

    console.log( engine.shuffle([1,2,3,4,5,6,7,8,9,0]))

    console.log(createRotMatrix(10))
    console.log(createRotMatrix1D(10))
    console.log(createPermVector(10))

    var a = new Array();
    for (i = 0; i < 1000; i++) {
        a[i] = 0;
    }

    console.log( compute(a))

}


var f15 = exports;
f15.compute = compute;
f15.O = O;


