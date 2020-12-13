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

const busesLeavingNext = inputs => {
    const findStartTime = busesObjects => {
        const findInverse = (n, mod) => {
            let x = 1;
            let temp = BigInt(n) % BigInt(mod);
            while (temp !== BigInt(1)) {
                temp = temp + BigInt(n);
                temp = temp % BigInt(mod);
                x++;
            }

            return x;
        }

        const findRemainder = (busId, offset) => {
            if (offset <= busId) {
                return (busId - offset) % busId;
            }

            let temp = -offset;
            while (temp < 0) {
                temp += busId;
            }
            return temp % busId;
        }

        let N = busesObjects
            .map(busObj => busObj.id)
            .reduce((previous, busId) => BigInt(previous) * BigInt(busId), BigInt(1));

        console.log(`   N: ${N}`);

        const theTime = busesObjects
            .map(busObj => {
                console.log(`   bus: ${busObj.id}. offset: ${busObj.offset}`);
                const bi = findRemainder(busObj.id, busObj.offset);
                console.log('bi calculated');
                const ni = N / BigInt(busObj.id);
                console.log('ni calculated');
                const x = findInverse(ni, busObj.id);
                console.log('xi calculated');
                let product = BigInt(bi) * BigInt(ni) * BigInt(x);
                product = product % N;
                console.log('product calculated');

                console.log(`   bi: ${bi}. ni: ${ni}. xi: ${x}. product: ${product}`);
                return {
                    b: bi,
                    n: ni,
                    x: x,
                    product: product,
                }
            })
            .map(chineseRemObj => chineseRemObj.product)
            .reduce((previous, current) => (previous + current) % N, BigInt(0));

        return (theTime % N);
    };

    // for inputs[1] = "7,13,x,x,59,x,31,19" --> 
    // busIds = [{id: 7, offset: 0}, {id: 13, offset: 1}, {id: 59, offset: 4}, ...]
    const busIds = inputs[1]
        .split(',')
        .map((busId, index) => {
            return { 
                id: busId,
                offset: index
            };
        })
        .filter(busObj => busObj.id !== 'x')
        .map(busObj => {
            return {
                id: +busObj.id,
                offset: busObj.offset
            };
        });

    return findStartTime(busIds);
};


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const firstBusInfo = busToAirport(inputs);
    console.log(JSON.stringify(firstBusInfo));
    console.log(`First part: ${firstBusInfo.busId * firstBusInfo.wait}`);
    console.log(`Second part: ${busesLeavingNext(inputs)}`);
};

// Read from input.in
const readInterface = readline.createInterface({
    input: fs.createReadStream('./input.in'),
    output: undefined,
    console: false
});

readInterface.on('line', processLine);
readInterface.on('close', computeResults);