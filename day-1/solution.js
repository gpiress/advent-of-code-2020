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

const firstPart = () => {
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

const secondPart = () => {

    for (let i = 0; i < values.length - 2; i++) {
        let sum = values[i];
        const first = values[i];
        let second = 0;
        let third = 0;

        for (let j = i + 1; j < values.length - 1; j++) {
            second = values[j];
            sum = first + second;

            if (sum >= 2020) {
                break;
            }

            for (let k = j + 1; k < values.length; k++) {
                third = values[k];
                sum = first + second + third;

                if (sum === 2020) {
                    console.log(`${first} * ${second} * ${third}`);
                    console.log(first * second * third);
                    return;
                }

                if (sum > 2020) {
                    break;
                }
            }
        }
    }
}

const computeResults = () => {
    values.sort();
    firstPart();
    secondPart();
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);