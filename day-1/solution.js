const readline = require('readline');
const fs = require('fs');
const { strict } = require('assert');

// Solution logic
let values = [];
const processLine = line => {
    if (!line) {
        return;
    }

    const value = +line;

    if (value > 2020) {
        return;
    }

    values.push(value);
}

const computeResults = () => {
    for (const first of values) {
        const toFind = 2020 - first;
        const second = values.find(element => (element === toFind));
        if (second !== undefined) {
            console.log(`${first} * ${second}`);
            console.log(first * second);
            break;
        }
    }
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);