const readline = require('readline');
const fs = require('fs');


// add solution code

const shipMovements = inputs => {
    let direction = 'E';
    let x = 0;
    let y = 0;

    let waypointX = 10;
    let waypointY = 1;

    const rotateRight = () => {
        let temp = waypointY;
        waypointY = -waypointX;
        waypointX = temp;
    };

    const moveWaypoint = (to, steps) => {
        if (to === 'E') {
            waypointX += steps;
            return;
        }

        if (to === 'W') {
            waypointX -= steps;
            return;
        }

        if (to === 'N') {
            waypointY += steps;
            return;
        }

        if (to === 'S') {
            waypointY -= steps;
            return;
        }
    }

    const move = (to, steps) => {
        if (to !== 'F') {
            moveWaypoint(to, steps);
            return;
        }

        x += (steps * waypointX);
        y += (steps * waypointY);
    };

    const manhattanDistance = () => {
        return Math.abs(x) + Math.abs(y);
    };

    for (let input of inputs) {
        let instruction = input[0];
        let number = +input.substring(1);

        if (instruction === 'R' || instruction === 'L') {
            number = instruction === 'L' ? 360 - number : number;
            while (number > 0) {
                direction = rotateRight();
                number -= 90;
            }
            continue;
        }

        move(instruction, number);
    }

    return manhattanDistance();
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    console.log(`First part: ${shipMovements(inputs)}`);
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