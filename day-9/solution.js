const readline = require('readline');
const fs = require('fs');


// add solution code
let previousNumbers = [];

const isSum = number => {
    let numbersCopy = [...previousNumbers];
    numbersCopy.sort((a, b) => a - b);

    let found = false;
    for (let i = 0; i < numbersCopy.length - 1; i++) {
        const first = numbersCopy[i];
        if (first > number) {
            break;
        }

        for (let j = i + 1; j < numbersCopy.length; j++) {
            const second = numbersCopy[j];
            const sum = first + second;

            if (sum === number) {
                found = true;
                break;
            }

            if (sum > number) {
                break;
            }
        }

        if (found) {
            break;
        }
    }
    return found;
};


const inputNumber = (input, preambleSize) => {
    if (previousNumbers.length < preambleSize) {
        previousNumbers.push(input);
        return true;
    }

    if (isSum(input)) {
        previousNumbers.shift();
        previousNumbers.push(input);
        return true;
    }

    return false;
};

const findBrokenNumber = (inputNumbers, preambleSize) => {
    let firstNonValid = -1;
    let foundBroken = false;

    for (let i = 0; i < inputNumbers.length; i++) {
        const isValid = inputNumber(inputNumbers[i], preambleSize);
        if (!isValid && !foundBroken) {
            firstNonValid = inputNumbers[i];
            foundBroken = true;
        }
    }

    return firstNonValid;
};

const arraySum = array => {
    return array.reduce((previous, current) => previous + current);
}

const arraySumMaxAndMin = array => {
    const arrayCopy = [...array];
    arrayCopy.sort((a, b) => a - b);

    return (arrayCopy[0] + arrayCopy[arrayCopy.length - 1]);
}

const findContiguousSet = (inputNumbers, desiredSum) => {
    let contiguousSet = [];

    let found = false;
    for (let i = 0; i < inputNumbers.length; i++) {
        const current = inputNumbers[i];

        if (current < desiredSum) {
            contiguousSet.push(current);

            let setSum = arraySum(contiguousSet);
            while (setSum > desiredSum) {
                contiguousSet.shift();
                setSum = arraySum(contiguousSet);
            }

            if ((setSum === desiredSum) && (contiguousSet.length > 1)) {
                found = true;
                break;
            }
        } else {
            // Found a number equal or higher than desiredSum
            // need to reset the contiguous set
            contiguousSet = [];
        }
    }

    if (found) {
        return arraySumMaxAndMin(contiguousSet);
    }

    return -1;
};

let inputs = [];
const processLine = line => {
    inputs.push(+line);
};

const computeResults = () => {
    const preambleSize = 25;
    let invalidNumber = findBrokenNumber(inputs, preambleSize);
    console.log(`First part: ${invalidNumber}`);
    console.log(`Second part: ${findContiguousSet(inputs, invalidNumber)}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);