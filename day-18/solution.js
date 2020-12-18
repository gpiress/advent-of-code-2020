const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    const solveSimpleExpression = simpleExpression => {
        // A simple expression has no parenthesis
        const addingParts = simpleExpression.split(' * ');

        const addedParts = addingParts.map(addingExpression => {
            const parts = addingExpression.split(' + ').map(part => +part);

            return parts.reduce((prev, curr) => prev + curr, 0);
        });

        return addedParts.reduce((prev, curr) => prev * curr, 1);
    };

    const removePar = expression => {
        let newExpression = expression;

        for (let i = 0; i < expression.length; i++) {
            let isOpening = expression[i] === '(';
            if (isOpening) {
                let innerMostOpeningIndex = i;
                let innerMostClosingIndex = -1;
                let found = false;

                for (let j = i + 1; j < expression.length; j++) {
                    if (expression[j] === '(') {
                        innerMostOpeningIndex = j;
                    }

                    if (expression[j] === ')') {
                        innerMostClosingIndex = j;
                        found = true;
                        break;
                    }
                }

                if (found) {
                    const simplerExpression = expression.substring(innerMostOpeningIndex + 1, innerMostClosingIndex);
                    console.log(`       Solving simple expression: ${simplerExpression}`);
                    const newResult = solveSimpleExpression(simplerExpression);

                    newExpression = expression.substring(0, innerMostOpeningIndex) + newResult + expression.substring(innerMostClosingIndex + 1);

                    i = innerMostClosingIndex;
                }
            }
        }

        console.log(`   New expression: ${newExpression}`);
        return newExpression;
    };

    const solveExpression = expression => {
        console.log(`   Solving complex expression: ${expression}`);
        let isTherePar = expression.indexOf('(') > -1;
        let newExpression = expression;

        while (isTherePar) {
            newExpression = removePar(newExpression);
            isTherePar = newExpression.indexOf('(') > -1;
        }

        return solveSimpleExpression(newExpression);
    };

    const results = inputs.map(solveExpression);
    console.log(`   Results: ${JSON.stringify(results)}`);
    
    return {
        firstPart: results.reduce((prev, curr) => prev + curr, 0),
        secondPart: -1,
    };
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const result = solve(inputs);
    console.log(`First part: ${result.firstPart}`);
    console.log(`Second part: ${result.secondPart}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);