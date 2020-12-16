const readline = require('readline');
const fs = require('fs');


// add solution code
const ticketValidator = inputs => {
    let fieldRulesMap = new Map();
    let myTicket = [];
    let nearbyTickets = [];

    const parseInputs = inputs => {
        let i = 0;
        let input = inputs[i];
        // Parse fields
        while (input != "") {
            const fieldRegexp = /((?:\s*\w+)+)\: (\d+)\-(\d+) or (\d+)\-(\d+)/;
            const matches = input.match(fieldRegexp);
            if (!matches) {
                console.log(`   invalid field: ${input}`);
                return;
            }
    
            const fieldName = matches[1]
            const firstRangeMin = +matches[2];
            const firstRangeMax = +matches[3];
            const secondRangeMin = +matches[4];
            const secondRangeMax = +matches[5];

            const fieldRanges = [[firstRangeMin, firstRangeMax], [secondRangeMin, secondRangeMax]];
            fieldRulesMap.set(fieldName, fieldRanges);

            i++;
            input = inputs[i];
        }

        // Parse my ticket
        while (input != 'your ticket:') {
            i++;
            input = inputs[i];
        }
        i++;
        input = inputs[i];
        myTicket = input.split(',').map(part => +part);

        // Parse nearby tickets
        while (input != 'nearby tickets:') {
            i++;
            input = inputs[i];
        }

        for (let j = i+1; j < inputs.length; j++) {
            const rawTicket = inputs[j];

            if (rawTicket == '') {
                continue;
            }

            const nearbyTicket = rawTicket.split(',').map(part => +part);
            nearbyTickets.push(nearbyTicket);
        }
    };

    let invalidFields = [];
    const isValueInRanges = (value, ranges) => {
        let valid = false;
        for (let range of ranges) {
            if (value >= range[0] && value <= range[1]) {
                valid = true;
                break;
            }
        }

        return valid;
    }

    const isValueInAnyRange = value => {
        let valid = false;

        for (let entry of fieldRulesMap) {
            let name = entry[0];
            let ranges = entry[1];

            valid = isValueInRanges(value, ranges);

            if (!valid) {
                console.log(`       Field ${name}: Invalid value [${value}]`);
            } else {
                break;
            }
        }

        if (!valid) {
            console.log(`       [${value}] invalid value for all fields`);
            invalidFields.push(value);
        }
        return valid;
    };

    const ticketHasAnyInvalidField = ticket => {
        console.log(`   Validating ticket: ${ticket}`);
        const invalidFieldsLength = ticket
            .map(isValueInAnyRange)
            .filter(fieldValid => fieldValid === false)
            .length;

        return invalidFieldsLength > 0;
    };

    const potentialFieldsForValues = (values, usedFields) => {
        // For every field, see if ALL values lie within ranges
        // If yes, it is a potential field
        // Otherwise, not
        let potentialFields = [];

        for (let entry of fieldRulesMap) {
            let fieldName = entry[0];
            let ranges = entry[1];

            // Don't try fields that are already used
            if (usedFields.has(fieldName)) {
                continue;
            }

            valid = true;
            for (let value of values) {
                if (isValueInRanges(value, ranges) === false) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                potentialFields.push(fieldName);
            }
        }

        return potentialFields;
    }

    const assignFieldsToTickets = validNearbyTickets => {
        let potentialFieldsPerCol = [];
        let fieldsPerCol = [];
        let usedFields = new Set();
        const fieldsLength = validNearbyTickets[0].length;

        for (let i = 0; i < fieldsLength; i++) {
            const fieldValues = validNearbyTickets.map(ticket => ticket[i]);
            const potentialFields = potentialFieldsForValues(fieldValues, usedFields);

            potentialFieldsPerCol[i] = potentialFields;
            console.log(`       Column [${i}] potential fields: ${potentialFields}`);

            if (potentialFields.length === 1) {
                fieldsPerCol[i] = potentialFields[0];
                usedFields.add(potentialFields[0]);
            }
        }

        let columnsWithMultiplePotential = potentialFieldsPerCol.filter(fields => fields.length >= 1).length;
        while (columnsWithMultiplePotential > 0) {
            potentialFieldsPerCol = potentialFieldsPerCol.map(fields => fields.filter(field => !usedFields.has(field)));
            console.log(`       Potential fields after clean: ${JSON.stringify(potentialFieldsPerCol)}`);

            potentialFieldsPerCol.forEach((fields, index) => {
                if (fields.length === 1) {
                    usedFields.add(fields[0]);
                    fieldsPerCol[index] = fields[0];
                }
            });

            columnsWithMultiplePotential = potentialFieldsPerCol.filter(fields => fields.length >= 1).length;
        }

        console.log(`   Fields per col: ${JSON.stringify(fieldsPerCol)}`);
        return fieldsPerCol;
    };

    const productOfDepartureFields = (ticket, fields) => {
        let product = 1;
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].startsWith('departure')) {
                product *= ticket[i];
            }
        }

        return product;
    };

    parseInputs(inputs);

    const nearbyValidTickets = nearbyTickets
        .filter(ticket => ticketHasAnyInvalidField(ticket) === false);

    const fieldsInOrder = assignFieldsToTickets(nearbyValidTickets);

    const ticketVerificationError = invalidFields.reduce((prev, curr) => prev + curr, 0);
    return {
        ticketVerificationError: ticketVerificationError,
        productOfDepartureFields: productOfDepartureFields(myTicket, fieldsInOrder),
    };
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const result = ticketValidator(inputs);
    console.log(`First part: ${result.ticketVerificationError}`);
    console.log(`Second part: ${result.productOfDepartureFields}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);