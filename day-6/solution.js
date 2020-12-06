const readline = require('readline');
const fs = require('fs');


// add solution code
let groupAnswers = {};
const addPersonAnswers = answers => {
    for (let c of answers) {
        if (!groupAnswers.hasOwnProperty(c)) {
            groupAnswers[c] = 1;
        } else {
            groupAnswers[c] = groupAnswers[c] + 1;
        }
    }
}

const groupDistinctAnswers = groupAnswers => {
    let distinctAnswersCount = 0;
    for (let field in groupAnswers) {
        distinctAnswersCount++;
    }

    return distinctAnswersCount;
}

const groupSameAnswers = (groupAnswers, groupSize) => {
    let sameAnswersCount = 0;
    for (let field in groupAnswers) {
        if (groupAnswers[field] === groupSize) {
            sameAnswersCount++;
        }
    }

    return sameAnswersCount;
}

const printGroupVotes = (groupAnswers, groupSize) => {
    console.log(`Group answers: ${JSON.stringify(groupAnswers)}.`);
    console.log(`Group size: ${groupSize}.`);
    for (let field in groupAnswers) {
        console.log(`   ${field}`);
    }
    console.log(`Group distinct answers: ${groupDistinctAnswers(groupAnswers)}`);
    console.log(`Group same answers: ${groupSameAnswers(groupAnswers, groupSize)}`);
    console.log(" ---- ");
}

let sumOfDistinctAnswers = 0;
let sumOfSameAnswers = 0;
let groupSize = 0;
const firstPart = line => {
    if (line === "") {
        sumOfDistinctAnswers += groupDistinctAnswers(groupAnswers);
        sumOfSameAnswers += groupSameAnswers(groupAnswers, groupSize);
        //printGroupVotes(groupAnswers, groupSize);
        groupAnswers = {};
        groupSize = 0;
    } else {
        addPersonAnswers(line);
        groupSize++;
    }
}

const processLine = line => {
    firstPart(line);
}

const computeResults = () => {
    firstPart('');
    console.log(`First part: ${sumOfDistinctAnswers}`);
    console.log(`Second part: ${sumOfSameAnswers}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./sample.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);