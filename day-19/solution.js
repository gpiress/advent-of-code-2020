const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    const parseInputs = inputs => {
        let rules = new Map();
        let characterRules = new Map();
        let messages = [];

        let i = 0;
        let input = inputs[i];
        while (input != '') {
            const ruleParts = input.split(':');
            const ruleNumber = +ruleParts[0];
            const ruleAlternatives = ruleParts[1].split('|').map(rule => rule.trim());

            rules.set(ruleNumber, ruleAlternatives);

            if (ruleAlternatives.length === 1 && ruleAlternatives[0].startsWith('"')) {
                characterRules.set(ruleAlternatives[0][1], ruleNumber);
            }

            i++;
            input = inputs[i];
        }

        for (let j = i + 1; j < inputs.length; j++) {
            messages.push(inputs[j]);
        }

        return {
            rules: rules,
            characterRules: characterRules,
            messages: messages,
        };
    };

    const isRuleDefinedYet = (alternatives, ruleDefinition) => {
        // ruleDefinition is something like "4 1 5"
        const ruleParts = ruleDefinition.trim().split(' ').map(part => +part);
        const undefinedParts = ruleParts.filter(part => {
            //console.log(`           Checking if part ${part} is defined`);
            return !alternatives.has(part);
        });
        
        //console.log(`           ${ruleDefinition}: ${undefinedParts.length} undefined parts`);
        return undefinedParts.length === 0;
    };

    const isRuleEightDefined = (alternatives) => {
        return alternatives.has(42);
    };

    const isRuleElevenDefined = (alternatives) => {
        return alternatives.has(42) && alternatives.has(31);
    };

    const generateAlternatives = (alternatives, ruleDefinition) => {
        let variations = [''];
        // ruleDefinition is something like "4 1 5"
        const ruleParts = ruleDefinition.trim().split(' ').map(part => +part);

        for (let ruleNumber of ruleParts) {
            const ruleNumberVariations = alternatives.get(ruleNumber);
            //console.log(`           Rule variations for ${ruleNumber} => ${JSON.stringify( Array.from(ruleNumberVariations) )}`);

            variations = variations
                .map(previousVariation => {
                    let newVariations = [];
                    for (let newRuleVariation of ruleNumberVariations) {
                        newVariations.push(previousVariation + newRuleVariation);
                    }

                    //console.log(`           New variations => ${JSON.stringify( newVariations )}`);

                    return newVariations;
                })
                .flat();
        }

        return variations;
    };

    const generateAllDefinitionsAlternatives = (alternatives, ruleDefinitions) => {
        let ruleAlternatives = new Set();
        ruleDefinitions.forEach(ruleDef => {
            const newVariations = generateAlternatives(alternatives, ruleDef);
            newVariations.forEach(variation => {
                ruleAlternatives.add(variation);
            });
        });

        return ruleAlternatives;
    }

    const computeInnerRules = (alternatives, rules) => {
        let undefinedRules = 0;
        for (let number of rules.keys()) {
            if (alternatives.has(number)) {
                continue;
            }

            //console.log(`   Currently defined rules: ${JSON.stringify( Array.from(alternatives.keys()) )}`);
            const ruleDefinitions = rules.get(number);

            if (number === 8) {
                if (isRuleEightDefined(alternatives)) {
                    console.log('   Handling special case 8');
                    const eightAlternatives = generateAllDefinitionsAlternatives(alternatives, ['42']);

                    // Make sure now this rule number is marked as defined
                    alternatives.set(number, eightAlternatives);
                } else {
                    undefinedRules++;
                }

                continue;
            }

            if (number === 11) {
                if (isRuleElevenDefined(alternatives)) {
                    console.log('   Handling special case 11');
                    let specialDefinitions = ['42 31'];
                    
                    const elevenAlternatives = generateAllDefinitionsAlternatives(alternatives, specialDefinitions);

                    // Make sure now this rule number is marked as defined
                    alternatives.set(number, elevenAlternatives);
                } else {
                    undefinedRules++;
                }

                continue;
            }

            let isDefinedYet = true;
            for (let ruleDef of ruleDefinitions) {
                //console.log(`       Rule ${number}: Checking if ${ruleDef} is defined`);
                if (!isRuleDefinedYet(alternatives, ruleDef)) {
                    // If a single rule alternative isn't yet defined, can't generate possibilities
                    isDefinedYet = false;
                    break;
                }
            }

            if (!isDefinedYet) {
                //console.log(`       Rule ${number}: Not defined yet`);
                undefinedRules++;
            } else {
                //console.log(`       All parts of rule ${number} are defined. Generating all variations`);
                // All parts of it are defined, let's go crazy on generation alternatives
                const ruleAlternatives = generateAllDefinitionsAlternatives(alternatives, ruleDefinitions);

                // Make sure now this rule number is marked as defined
                alternatives.set(number, ruleAlternatives);
            }
        }

        return {
            undefined: undefinedRules,
        };
    };

    const computeAllAlternatives = (rules, characterRules) => {
        let alternatives = new Map();
        let undefinedRules = 1;

        for (let character of characterRules.keys()) {
            const ruleNumber = +characterRules.get(character);
            alternatives.set(ruleNumber, new Set().add(character));
        }

        while (undefinedRules !== 0) {
            problematicRules = computeInnerRules(alternatives, rules);
            undefinedRules = problematicRules.undefined;
        }

        return alternatives;
    };

    const doesItMatchRuleZero = (allAlternatives, message) => {
        const fortyTwoAlternatives = allAlternatives.get(42);
        const thirtyOneAlternatives = allAlternatives.get(31);

        let fortyTwoCount = 0;
        let thirtyOneCount = 0;

        let fortyTwoMatchSize = Array.from(fortyTwoAlternatives)[0].length;
        let thirtyOneMatchSize = Array.from(thirtyOneAlternatives)[0].length;

        let messageSize = message.length;
        let i = 0;
        
        // Messages follow the pseudo-regex:
        // - 42+ 31+

        // So they can:
        // - Be a mix of both, but #42 always > #31

        //console.log(`Validating message ${message}, message size: ${message.length}`);

        let fortyTwoMatches = true;
        while (fortyTwoMatches && i < messageSize) {
            let newMatch = message.substring(i, i + fortyTwoMatchSize);

            fortyTwoMatches = fortyTwoAlternatives.has(newMatch);
            if (fortyTwoMatches) {
                fortyTwoCount++;
                i = i + fortyTwoMatchSize;
            }
        }

        let thirtyOneMatches = true;
        while (thirtyOneMatches && i < messageSize) {
            let newMatch = message.substring(i, i + thirtyOneMatchSize);

            thirtyOneMatches = thirtyOneAlternatives.has(newMatch);
            if (thirtyOneMatches) {
                thirtyOneCount++;
                i = i + thirtyOneMatchSize;
            }
        }

        if (i != messageSize) {
            // Leftover characters
            return false;
        }

        if (thirtyOneCount >= fortyTwoCount) {
            return false;
        }

        if (thirtyOneCount === 0) {
            return false;
        }
        
        return true;
    };

    const printOverlaps = (firstSet, secondSet) => {
        for (let value of firstSet) {
            if (secondSet.has(value)) {
                console.log(`   ${value} fits both 42 and 31`);
            }
        }
    }

    const firstPart = (rules, characterRules, messages) => {
        const allAlternatives = computeAllAlternatives(rules, characterRules);

        printOverlaps(allAlternatives.get(42), allAlternatives.get(31));

        const matchesZero = messages.filter(message => doesItMatchRuleZero(allAlternatives, message));

        /*
        console.log('Valid messages:');
        console.log('---------------');
        matchesZero.forEach(message => console.log(`    ${message}`));
        */

        return matchesZero.length;
    };

    const { rules, characterRules, messages } = parseInputs(inputs);

    const firstPartResult = firstPart(rules, characterRules, messages);
    
    return {
        firstPart: firstPartResult,
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