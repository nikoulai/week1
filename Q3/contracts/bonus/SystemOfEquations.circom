pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matSub.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    signal Ax[n][1];
    signal res, inv;
    // x <== [15, 17, 19];

    // A[0] <== [1, 1, 2];
    // A[1] <== [1, 2, -1];
    // A[3] <== [1, 3, 1];

    // b <== [51, 106, 32];

    // component mul = matMul(n,n,1); //or this
    component mul = matMul(3,3,1);

    // mul.a <== A;
    for (var i=0; i<3; i++) {
        //mul.b <== x;
        mul.b[i][0] <== x[i];
        for (var j=0; j<3; j++) {
            mul.a[i][j] <== A[i][j];
        }
    }
    
    // Ax <== mul.out;
    for (var i=0; i<3; i++) {
        Ax[i][0] <== mul.out[i][0];
    }

    component sub = matSub(3,1);

    // sub.a <== Ax;
    // sub.b <== b;
    for (var i=0; i<3; i++) {
        sub.a[i][0] <== Ax[i][0];
        sub.b[i][0] <== b[i];
    }

    component add = matElemSum(3,1);
    // add.in <== sub.out;
    for (var i=0; i<3; i++) {
        add.a[i][0] <== sub.out[i][0];
    }
    res <== add.out;


    //Logic from isZero
    inv <-- res!=0 ? 1/res : 0;
    out <== -res*inv +1;
    res*out === 0;








}

component main {public [A, b]} = SystemOfEquations(3);