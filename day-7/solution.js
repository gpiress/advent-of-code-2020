const readline = require('readline');
const fs = require('fs');


// add solution code
let bagContainsRules = {};
let outerBagRules = {};

const parseRules = line => {
    //console.log('   Parsing input');
    if (line === '') {
        return;
    }

    const words = line.split(" ");
    const bagKind = words[0] + ' ' + words[1];

    let innerBags = [];
    let totalInnerBags = 0;
    for (let i = 4; i < words.length; i+=4) {
        if (words[i] === 'no') {
            continue;
        }

        const quantity = +words[i];
        const innerBagKind = words[i+1] + ' ' + words[i+2];

        //console.log(`       ${bagKind} contains ${quantity} ${innerBagKind}`);

        if (outerBagRules.hasOwnProperty(innerBagKind)) {
            outerBagRules[innerBagKind].push(bagKind);
        } else {
            outerBagRules[innerBagKind] = [bagKind];
        }

        totalInnerBags += quantity;
        innerBags.push({
            count: quantity,
            bagKind: innerBagKind,
        });
    }

    bagContainsRules[bagKind] = {
        total: totalInnerBags,
        bags: innerBags,
    };
}

const firstPart = () => {
    //console.log('   Computing results');
    let possibleOuterBags = [];
    let visitedBags = [];

    if (!outerBagRules.hasOwnProperty('shiny gold')) {
        return 0;
    }

    // containersCandidates is an array of strings,
    // with bags that contain shiny gold
    let containersCandidates = outerBagRules['shiny gold'];
    while (containersCandidates.length > 0) {
        const candidate = containersCandidates.shift();
        //console.log(`       Now checking ${candidate}`);

        // If the candidate has already been checked, ignore it
        if (visitedBags.indexOf(candidate) !== -1) {
            continue;
        }
        visitedBags.push(candidate);

        // If there are no rules for this kind of bag, ignore it
        if (!bagContainsRules.hasOwnProperty(candidate)) {
            continue;
        }

        // If the bag can contain at least 1 shiny gold, also add it to possibleOuterBags
        // Exceptionally, if the bag contain at least one possibleOuterBag, add it as possibleOuterBag
        const candidateContains = bagContainsRules[candidate];
        const candidateCarryPossibleBags = candidateContains.bags
            .filter(bag => (possibleOuterBags.indexOf(bag) >= 0)) > 0;

        if (candidateCarryPossibleBags) {
            possibleOuterBags.push(candidate);
        } else if (candidateContains.total >= 1) {
            possibleOuterBags.push(candidate);
        }

        // Also, add all bags that contain candidate to containersCandidates
        if (outerBagRules.hasOwnProperty(candidate)) {
            const candidateOuterBags = outerBagRules[candidate];
            
            candidateOuterBags.forEach(candidateOuterBag => {
                containersCandidates.push(candidateOuterBag);
            });
        }
    }

    return possibleOuterBags;
}

const howManyInnerBags = bag => {
    //console.log(`   Checking ${bag}`);
    if (!bagContainsRules.hasOwnProperty(bag)) {
        return 1;
    }

    const bagContains = bagContainsRules[bag];
    //console.log(`       ${bag} inner bags: ${JSON.stringify(bagContains.bags)}`);

    let total = 0;
    for (let contained of bagContains.bags) {
        total += (contained.count + (contained.count * howManyInnerBags(contained.bagKind)));
    }

    //console.log(`   Total for ${bag}: ${total}`);
    return total;
}

const secondPart = () => {
    return howManyInnerBags('shiny gold');
}

const processLine = line => {
    parseRules(line);
}

const computeResults = () => {
    const possibleOuterBags = firstPart();
    const totalContainedByShinyGold = secondPart();
    console.log(`First part: ${possibleOuterBags.length} - ${possibleOuterBags}`);
    console.log(`Second part: ${totalContainedByShinyGold}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);