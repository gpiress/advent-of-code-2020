const readline = require('readline');
const fs = require('fs');

let firstPartValid = 0;
let secondPartValid = 0;

const firstPart = (first, second, character, password) => {
    let letterCount = 0;
    for (let c of password) {
        if (c === character) {
            letterCount++;
        }

        if (letterCount > second) {
            break;
        }
    }

    if (letterCount >= first && letterCount <= second) {
        firstPartValid++;
    }
}

const secondPart = (first, second, character, password) => {
    if (password[first - 1] === character) {
        return (password[second - 1] !== character);
    }

    return (password[second - 1] === character);
}

const processLine = line => {
    // each line is like : "3-11 k: kkqkkfkkvkgfknkx"
    const lineParts = line.split(" ");
    
    // 3-11
    const lowest = lineParts[0].split("-")[0];
    const highest = lineParts[0].split("-")[1];

    // k:
    const letter = lineParts[1][0];

    // kkqkkfkkvkgfknkx
    const password = lineParts[2];

    // Solution
    firstPart(lowest, highest, letter, password);
    const isValid = secondPart(lowest, highest, letter, password);
    if (isValid) {
        console.log(`${line} is valid`);
        secondPartValid++;
    }
}

const computeResults = () => {
    console.log(`First part: ${firstPartValid}`);
    console.log(`Second part: ${secondPartValid}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);