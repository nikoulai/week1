const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    //we create the proof and the public signals by giving the input, the compiled circuit and the trusted setup arguments
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    console.log("1x2 =", publicSignals[0]);

    // converts publicSignals from strings to js BigInts
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    //  Creates the data that need to be passed in the smart contracts
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //Splits the data in the different parameters needed by the verifyProof function
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    //verifies the proofs and expects to be true as we have given a right proof
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3_groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/Multiplier3-groth16/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3-groth16/circuit_final.zkey"
    );

    console.log("1x2x3 =", publicSignals[0]);

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];

    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3_plonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "3" },
      "contracts/circuits/Multiplier3-plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3-plonk/circuit_final.zkey"
    );

    console.log("1x2x3=", publicSignals[0]);

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    let [proofSC, pubSigsArStr] = calldata.split(",");
    expect(await verifier.verifyProof(proofSC, JSON.parse(pubSigsArStr))).to.be
      .true;
  });
  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a =
      "0x0ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccca9e6f7cbfda1ae2b1a435be1ad267187797537174402ed2ec05eb2ff98a52424e78412ec4d13fb1f68d326c1f0a4d4d77ef7ffbe7afc5e08f240214ab3fa05b115f0f0616f8a568508a6e354a9baf7a16da751d8e9c24e2f21ae9ecc1d3277c4f85bf9b202a775254eb6753f3811c143d31ba5ff231ccd2072ad935075c53deaf8459f4e3528fcbe842b75a13f3e82f97f5f10d4f1e3f51d517d8a239b894ebe740ad84a66cf7ccfc4fe79301536c913cd68d67825e79101fbbeb4bb2c66863ae8ffa6d68ab8cf21bd2e8a67063286f53d7e6efc6bc6662dfdeffb55acaceec9ca297cd5ebdf1785bc870282d0a44a069192c9c2aa02ad22a6655dd5228057b396409ec0d0f0fd81291efdbf898b2bae902e4dc5921f3b0bd23ab7349076ed183013e4dba331f2a9256b9e690985b4553137ece9f07f4b2a5af61f35ea462980922f3ed72600e330ffac831299b5f6f75139396d1650110db1878cf2992ec52759da54d4bc270d47f6258e712deb817a0fa962ff13480b049871193b8c8628c43795643f450caf072c9e16b4543c8983b5a6ce7e7b67a608a1c47bc326197c0082edd602678c820db47c8c9b6ac9f8a6e6aeae1a25883603dd0add587d244bc88e132675f47ac5c3551fd660ab9f04b1dcd04021b4420518caa9ecf2a998e1221f15efde4045d81b632f8eba997418a5c50e009cd1a4b50285a4847f2986449c947f01f3bc5ac1cbc863eb97b214ea3060d9f74e5f5ee728293cd29fc83ee5b9fa6d17fcd33efdeab57a2c5353bbecc89091258f92034b2767a83dc70952d32a5ef1b66c5d42a5084c8490dfc45cbb2992422503f52ed31bd52dbb21fdad5637add9b5093b1fb0878a536676489c98822f9bc6f6c1ef6a0a5cb8f785444011304332f27a4e0708c85671d9c3987b02f17e2660889a560a0240eef3b92ed0f0af268aa992ec3e9e86b262c53ea8c9e0257bb407a8ac0110";
    let b = ["6"];
    expect(await verifier.verifyProof(a, b)).to.be.false;
  });
});
