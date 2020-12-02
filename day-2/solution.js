const readline = require('readline');
const fs = require('fs');

let valid = 0;
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

    let letterCount = 0;
    for (let c of password) {
        if (c === letter) {
            letterCount++;
        }

        if (letterCount > highest) {
            break;
        }
    }

    if (letterCount >= lowest && letterCount <= highest) {
        console.log(`${line} is valid`);
        valid++;
    }
}

const computeResults = () => {
    console.log(valid);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);