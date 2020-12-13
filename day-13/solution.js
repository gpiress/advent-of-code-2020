const readline = require('readline');
const fs = require('fs');


// add solution code

const busToAirport = inputs => {
    const minMinuteForBus = (busId, arrivalTime) => {
        let busPasses = 0;
        while (busPasses < arrivalTime) {
            busPasses += busId;
        }

        return busPasses;
    };

    const arrivalTime = +inputs[0];
    // for inputs[1] = "7,13,x,x,59,x,31,19" --> busIds = [7, 13, 59, 31, 19]
    const busIds = inputs[1]
        .split(',')
        .filter(input => input !== 'x')
        .map(idStr => +idStr);

    let minimumMinute = -1;
    let minimumBusId = 0;

    busIds.map(busId => {
        const minBusMinute = minMinuteForBus(busId, arrivalTime);
        if (minimumMinute === -1 || minBusMinute < minimumMinute) {
            minimumMinute = minBusMinute;
            minimumBusId = busId;
        }
    });

    return {
        busId: minimumBusId,
        busArrival: minimumMinute,
        wait: (minimumMinute - arrivalTime),
    };
};


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const firstBusInfo = busToAirport(inputs);
    console.log(JSON.stringify(firstBusInfo));
    console.log(`First part: ${firstBusInfo.busId * firstBusInfo.wait}`);
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