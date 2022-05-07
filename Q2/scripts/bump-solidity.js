const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract .*Verifier/;

const verifiers = [
  "HelloWorldVerifier",
  "Multiplier3-plonkVerifier",
  "Multiplier3-groth16Verifier",
];
verifiers.forEach((verifier) => {
  let verifierFullPath = `./contracts/${verifier}.sol`;
  let content = fs.readFileSync(verifierFullPath, { encoding: "utf-8" });
  let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
  bumped = bumped.replace(
    verifierRegex,
    "contract " + verifier.replace("-", "_")
  );

  fs.writeFileSync(verifierFullPath, bumped);
});

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
