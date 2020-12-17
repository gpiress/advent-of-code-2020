const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    let state = [];
    let minZ = -1;
    let maxZ = 1;
    let minX = 0;
    let maxX = 3;
    let minY = 0;
    let maxY = 3;
    let minW = -1;
    let maxW = 1;

    const setInitialState = () => {
        // 27 entries in x, y, z dimensions
        let z = minZ;
        let y = minY;
        let x = minX;
        let w = minW;

        while (w <= maxW) {
            z = minZ;
            while (z <= maxZ) {
                y = minY;
                while (y < maxY) {
                    x = minX;
                    while (x < maxX) {
                        let newObj = {
                            x: x,
                            y: y,
                            z: z,
                            w: w,
                            state: '.',
                            active: false,
                        };
    
                        //console.log(`   Adding ${JSON.stringify(newObj)} to state`);
                        state.push(newObj);
                        x++;
                    }
                    y++;
                }
                z++;
            }
            w++;
        }
    };

    const updateBoundaries = (x, y, z, w) => {
        if (x < minX) {
            minX = x;
            return;
        }

        if (x > maxX) {
            maxX = x;
            return;
        }

        if (y < minY) {
            minY = y;
            return;
        }

        if (y > maxY) {
            maxY = y;
            return;
        }

        if (z < minZ) {
            minZ = z;
            return;
        }

        if (z > maxZ) {
            maxZ = z;
            return;
        }

        if (w < minW) {
            minZ = z;
            return;
        }

        if (w > maxW) {
            maxW = w;
            return;
        }
    };

    const findCube = (state, x, y, z, w) => {
        //console.log(`   Finding object [${x}, ${y}, ${z}]`);
        let cubes = state.filter(obj => {
            return obj.x === x && obj.y === y && obj.z === z && obj.w === w;
        });

        if (cubes.length === 0) {
            updateBoundaries(x, y, z, w);
            let newCube = { x: x, y: y, z: z, w: w, state: '.', active: false };
            cubes = [newCube];
            state.push(newCube);
        }

        return cubes[0];
    };

    const getNeighbors = a => {

        let neighbors = [];

        for (let x = a.x - 1; x <= a.x + 1; x++) {
            for (let y = a.y - 1; y <= a.y + 1; y++) {
                for (let z = a.z - 1; z <= a.z + 1; z++) {
                    for (let w = a.w - 1; w <= a.w + 1; w++) {
                        if (x === a.x && y === a.y && z === a.z && w === a.w) {
                            continue;
                        }
                        let cube = findCube(state, x, y, z, w);
                        neighbors.push(cube);
                    }
                }
            }
        }
        
        return neighbors;
    };

    const parseInput = (input, index) => {
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (char === '#') {
                let object = findCube(state, index, i, 0, 0);
                getNeighbors(object);
                object.state = '#';
                object.active = true;
            }
        }
    };

    const cycle = () => {
        let newState = state.map(obj => Object.assign({}, obj));

        const activeObjs = state.filter(obj => obj.active);

        console.log(`       Evaluating ${activeObjs.length} active objects`);
        activeObjs.forEach(obj => {
            //console.log(`   Figuring out if ${JSON.stringify(obj)} should stay active`);
            const neighbors = getNeighbors(obj);
            const activeNeighbors = neighbors.filter(neighbor => neighbor.active);

            // If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. 
            // Otherwise, the cube becomes inactive.
            if (activeNeighbors.length !== 2 && activeNeighbors.length !== 3) {
                let newStateObj = findCube(newState, obj.x, obj.y, obj.z, obj.w);
                newStateObj.active = false;
                newStateObj.state = '.';
            }
        });

        const inactiveObjs = state.filter(obj => obj.active === false);
        console.log(`       Evaluating ${inactiveObjs.length} inactive objects`);
        inactiveObjs.forEach(obj => {

            //console.log(`   Figuring out if ${JSON.stringify(obj)} should become active`);
            const neighbors = getNeighbors(obj);
            const activeNeighbors = neighbors.filter(neighbor => neighbor.active);

            // If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. 
            // Otherwise, the cube becomes inactive.
            if (activeNeighbors.length === 3) {
                let newStateObj = findCube(newState, obj.x, obj.y, obj.z, obj.w);
                newStateObj.active = true;
                newStateObj.state = '#';
            }
        });

        return newState;
    };

    const printState = state => {
        console.log(`   Printing state`);
        for (let z = minZ; z <= maxZ; z++) {
            console.log(`   State for z = ${z}`);
            for (let x = minX; x < maxX; x++) {
                let cubes = [];
                for (let y = minY; y < maxY; y++) {
                    cubes.push(findCube(state, x, y, z));
                }

                const states = cubes.reduce((prev, curr) => prev + curr.state, '');
                console.log(`       ${states}`);
            }
        }
    }

    const firstPart = () => {
        const cycles = 6;
        for (let i = 0; i < cycles; i++) {
            let newState = cycle();
            state = newState;
            console.log(`   Cycle ${i} computed`);
        }

        //printState(state);
    
        const activeCubs = state.filter(cube => cube.active).length;

        return activeCubs;
    }

    setInitialState();
    console.log("   Initial state set");
    inputs.map(parseInput);
    console.log("   Inputs parsed");

    
    return {
        firstPart: firstPart(),
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