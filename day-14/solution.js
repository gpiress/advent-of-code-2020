const readline = require('readline');
const fs = require('fs');


// add solution code
const memoryChip = inputs => {
    let memory = [];
    let second_sum = 0;

    const toBinary = number => {
        let temp = number;
        let result = [];
        let i = 35;
        while (i >= 0) {
            const currentPower = 2**i;
            if (temp >= currentPower) {
                result.push(1);
                temp -= currentPower;
            } else {
                result.push(0);
            }
            i--;
        }

        return result;
    };

    const fromBinary = binaryList => {
        let temp = 0;
        for (let i = 0; i < binaryList.length; i++) {
            if (binaryList[i] === 1) {
                temp += (2**(35 - i));
            }
        }

        return temp;
    };

    const applyMask = (binaryList, mask) => {
        let newValue = [...binaryList];
        for (let i in binaryList) {
            if (mask[i] !== 'X') {
                newValue[i] = +mask[i];
            }
        }

        return newValue;
    };

    const applyFloatingMask = (binaryList, mask) => {
        let validPositions = [[]];

        for (let i in binaryList) {
            if (mask[i] === '1') {
                validPositions.forEach(positions => positions.push(1));
            } else if (mask[i] === '0') {
                validPositions.forEach(positions => positions.push(binaryList[i]));
            } else if (mask[i] === 'X') {
                let tempListOfLists = validPositions.map(positions => {
                    let zeroList = [...positions];
                    zeroList.push(0);
                    let oneList = [...positions];
                    oneList.push(1);

                    return [zeroList, oneList];
                });
                validPositions = tempListOfLists.flat();
            }
        }

        return validPositions;
    }

    const changeMemory = (pos, value, mask) => {
        const binaryValue = toBinary(value);
        const maskedBinary = applyMask(binaryValue, mask);
        const maskedNumber = fromBinary(maskedBinary);

        memory[pos] = maskedNumber;
    };

    const changeMaskedMemory = (pos, value, mask) => {
        const memPosBinary = toBinary(pos);
        const memBinaryPositions = applyFloatingMask(memPosBinary, mask);

        memBinaryPositions
            .map(binaryList => fromBinary(binaryList))
            .forEach(memPos => {
                if (memory[memPos] !== undefined) {
                    second_sum -= memory[memPos];
                }
                second_sum += value;
                memory[memPos] = value;
            });
    }

    const firstPart = inputs => {
        memory = [];
        let mask = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
        for (let input of inputs) {
            console.log(`   command: ${input}`);
            const commandParts = input.split(' ');
            if (commandParts[0] === 'mask') {
                mask = commandParts[2];
                continue;
            }
    
            const memoryRegexp = /mem\[(\d+)\] = (\d+)/;
            const matches = input.match(memoryRegexp);
            if (!matches) {
                console.log(`   command invalid: ${input}`);
                return;
            }
    
            const memPos = +matches[1];
            const memValue = +matches[2];
            changeMemory(memPos, memValue, mask);
        }
    
        return memory.reduce((previous, current) => previous + current, 0);
    };

    const secondPart = inputs => {
        memory = [];
        second_sum = 0;

        let mask = "";
        for (let input of inputs) {
            console.log(`   command: ${input}`);
            const commandParts = input.split(' ');
            if (commandParts[0] === 'mask') {
                mask = commandParts[2];
                continue;
            }
    
            const memoryRegexp = /mem\[(\d+)\] = (\d+)/;
            const matches = input.match(memoryRegexp);
            if (!matches) {
                console.log(`   command invalid: ${input}`);
                return;
            }
    
            const memPos = +matches[1];
            const memValue = +matches[2];
            changeMaskedMemory(memPos, memValue, mask);
        }

        console.log("Finished running");
        return second_sum;
    }

    return {
        firstPart: firstPart(inputs),
        //secondPart: -1,
        secondPart: secondPart(inputs),
    };
};


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const solutions = memoryChip(inputs);
    console.log(`First part: ${solutions.firstPart}`);
    console.log(`Second part: ${solutions.secondPart}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);