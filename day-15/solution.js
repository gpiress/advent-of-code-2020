const readline = require('readline');
const fs = require('fs');


// add solution code
const memoryGame = inputs => {
    let memory = {};

    const initialNumbers = inputs[0].split(',');
    let turn = 1;
    let lastNumber = -1;
    for (let num of initialNumbers) {
        memory[num] = turn;
        turn++;
        lastNumber = num;
    }

    let currentNumber = 0;
    while (turn < 30000000) {
        if (memory.hasOwnProperty(currentNumber)) {
            // Number has been spoken, need to say the turn diff between them
            const previousTurn = memory[currentNumber];
            memory[currentNumber] = turn;
            currentNumber = turn - previousTurn;

            console.log(`   Turn ${turn}: Number ${currentNumber} was spoken before on turn ${previousTurn}`);
        } else {
            // Number has not been spoken, need to add it to memory and say 0
            memory[currentNumber] = turn;
            currentNumber = 0;

            console.log(`   Turn ${turn}: New number ${currentNumber}`);
        }

        turn++;
    }

    return currentNumber;
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    console.log(`First part: ${memoryGame(inputs)}`);
    console.log(`Second part: ${-1}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);