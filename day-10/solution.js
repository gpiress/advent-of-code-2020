const readline = require('readline');
const fs = require('fs');


// add solution code
const computeJoltageDiff = inputs => {
    let joltages = [...inputs];
    joltages.sort((a, b) => a - b);

    let oneJoltDiffs = 0;
    let threeJoltDiffs = 1;
    let previous = 0;

    for (let joltage of joltages) {
        const diff = joltage - previous;
        
        if (diff === 1) {
            oneJoltDiffs++;
        } else if (diff === 3) {
            threeJoltDiffs++;
        }

        previous = joltage;
    }

    console.log(`   ${oneJoltDiffs} 1-jolt differences`);
    console.log(`   ${threeJoltDiffs} 3-jolt differences`);

    return oneJoltDiffs * threeJoltDiffs;
};

const computeArrangements = inputs => {
    let joltages = [...inputs];
    joltages.sort((a, b) => a - b);

    let arrangements = 1;
    let previous = 0;

    for (let i = 0; i < joltages.length; i++) {
        let current = joltages[i];
        let diff = current - previous;

        if (diff <= 0) {
            continue;
        }
        console.log(`   Previous: ${previous}. Current: ${current}.`);

        let possible = 0;
        while (diff <= 3) {
            console.log(`       ${current} is a valid alternative.`);
            possible++;
            current = joltages[i + possible];
            diff = current - previous;
        }
        

        if (possible === 1) {
            previous = joltages[i];
            continue;
        }

        const next = joltages[i + possible];
        let possibleRight = 0;
        diff = next - joltages[i + possible - 1];
        while (diff <= 3) {
            possibleRight++;
            diff = next - joltages[i + possible - possibleRight - 1];
        }

        if (possible === 2) {
            if (possibleRight === 1) {
                arrangements *= 2;
            } else if (possibleRight === 2) {
                arrangements *= 3;
            }
            
            previous = joltages[i + 1];
            console.log(`       ${possible} variations possible. New arrangements value: ${arrangements}.`);
        }
        if (possible === 3) {
            if (possibleRight === 1) {
                arrangements *= 4;
            } else if (possibleRight === 2) {
                arrangements *= 6;
            } else if (possibleRight === 3) {
                arrangements *= 7;
            }
            previous = joltages[i + 2];
            console.log(`       ${possible} variations possible. New arrangements value: ${arrangements}.`);
        }
    }

    return arrangements;
}

let inputs = [];
const processLine = line => {
    inputs.push(+line);
};

const computeResults = () => {
    let diffProduct = computeJoltageDiff(inputs);
    console.log(`First part: ${diffProduct}`);
    console.log(`Second part: ${computeArrangements(inputs)}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);