const readline = require('readline');
const fs = require('fs');

let highestSeatId = 0;

const seatIdFromBoardingPass = boardingPass => {
    let min = 0;
    let max = 127;
    let row = 0;

    // 7 letters to identify row
    for (let i = 0; i < 7; i++) {
        const fOrB = boardingPass[i];
        if (fOrB === 'F') {
            // If the last char, situation is like [43, 44], just pick 43
            if (i === 6) {
                row = min;
            }

            // In the first case you want it to go from [0, 127] to [0, 63]
            const newMax = Math.floor((min + max) / 2);
            max = newMax;
        } else {
            if (i === 6) {
                row = max;
            }

            // In the first case you want it to go from [0, 127] to [64, 127]
            const newMin = Math.ceil((min + max) / 2);
            min = newMin;
        }
    }

    let col = 0;
    min = 0;
    max = 7;

    // 3 letters to identify col
    for (let i = 7; i < 10; i++) {
        const fOrB = boardingPass[i];
        if (fOrB === 'L') {
            // If the last char, situation is like [6, 7], just pick 6
            if (i === 9) {
                col = min;
            }

            // In the first case you want it to go from [0, 7] to [0, 3]
            const newMax = Math.floor((min + max) / 2);
            max = newMax;
        } else {
            if (i === 9) {
                col = max;
            }

            // In the first case you want it to go from [0, 7] to [4, 7]
            const newMin = Math.ceil((min + max) / 2);
            min = newMin;
        }
    }

    //console.log(`   Boarding pass ${boardingPass}. Row ${row}, Col ${col}`);

    return (row * 8) + col;
}

let seatIds = [];
const firstPart = boardingPass => {
    let seatId = seatIdFromBoardingPass(boardingPass);
    seatIds.push(+seatId);

    if (seatId > highestSeatId) {
        highestSeatId = seatId;
    }
}

const checkMissingSeatId = () => {
    seatIds.sort((a, b) => a - b);
    let candidate = 0;

    for (let i = 1; i < seatIds.length; i++) {
        //console.log(`Seat id: ${seatIds[i]}`);
        if (seatIds[i] - seatIds[i-1] === 2) {
            candidate = seatIds[i] - 1;
            console.log(`No one seating on ${candidate}`);
        }
    }

    return candidate;
}

const processLine = line => {
    firstPart(line);
}

const computeResults = () => {
    console.log(`First part: ${highestSeatId}`);
    const candidate = checkMissingSeatId();
    console.log(`Second part: ${candidate}`);
}

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./sample.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);