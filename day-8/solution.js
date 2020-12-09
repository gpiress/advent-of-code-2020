const readline = require('readline');
const fs = require('fs');


// add solution code
let accumulator = 0;
let commands = [];

const firstPart = (commandsToRun) => {
    accumulator = 0;
    let ranTwice = false;
    let i = 0;
    while (i < commandsToRun.length) {
        let command = commandsToRun[i];
        console.log(`       Running command ${i}: ${JSON.stringify(command)}`);

        if (command.executed) {
            ranTwice = true;
            break;
        }

        if (command.command === 'nop') {
            i++;
        }

        if (command.command === 'jmp') {
            i += command.value;
        }

        if (command.command === 'acc') {
            accumulator += command.value;
            i++;
        }

        command.executed = true;
    }

    return {
        acc: accumulator,
        ranTwice: ranTwice
    };
}

const secondPart = () => {
    let execution = firstPart(commands);
    let lastModified = 0;

    while (execution.ranTwice) {
        // Change commands
        if (lastModified >= commands.length) {
            console.log('Something went wrong, no valid variations');
            break;
        }

        console.log(`   Trying new variation. Last modified = ${lastModified}`);
        let newCommands = commands.map(commandObj => Object.assign({}, commandObj, { executed: false }));

        for (let i = lastModified; i < commands.length; i++) {
            let command = newCommands[i];
            if (command.command === 'nop') {
                console.log(`       Changing command ${i} - ${JSON.stringify(command)} to jmp`);
                command.command = 'jmp';
                lastModified = i + 1;
                break;
            }

            if (command.command === 'jmp') {
                console.log(`       Changing command ${i} - ${JSON.stringify(command)} to nop`);
                command.command = 'nop';
                lastModified = i + 1;
                break;
            }
        }

        // Run again
        execution = firstPart(newCommands);
    }
    return execution.acc;
}

const parseCommands = line => {
    let commandParts = line.split(' ');
    let command = commandParts[0];
    let value = +commandParts[1];

    let commandObj = {
        'command': command,
        'value': value,
        'executed': false,
    }

    commands.push(commandObj);
}

const processLine = line => {
    parseCommands(line);
}

const computeResults = () => {
    const accumulatorBeforeSecondRun = firstPart(commands).acc;
    console.log(`First part: ${accumulatorBeforeSecondRun}`);
    console.log(`Second part: ${secondPart()}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);