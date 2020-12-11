const readline = require('readline');
const fs = require('fs');


// add solution code

/*
L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL

Spot states are:
L - free seat
# - occupied seat
. - floor

Ruleas are:

- If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
- If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
- Otherwise, the seat's state does not change.
*/

const adjacentSeats = (i, j, grid) => {
    let occupied = 0;

    if (j > 0) {
        // left
        if (grid[i][j-1] === '#') {
            occupied++;
        }

        // up-left
        if (i > 0) {
            if (grid[i-1][j-1] === '#') {
                occupied++;
            }
        }

        // down-left
        if (i < grid.length - 1) {
            if (grid[i+1][j-1] === '#') {
                occupied++;
            }
        }
    }

    if (j < grid[i].length - 1) {
        // right
        if (grid[i][j+1] === '#') {
            occupied++;
        }

        // up-right
        if (i > 0) {
            if (grid[i-1][j+1] === '#') {
                occupied++;
            }
        }

        // down-right
        if (i < grid.length - 1) {
            if (grid[i+1][j+1] === '#') {
                occupied++;
            }
        }
    }

    // up
    if (i > 0) {
        if (grid[i-1][j] === '#') {
            occupied++;
        }
    }

    // down
    if (i < grid.length - 1) {
        if (grid[i+1][j] === '#') {
            occupied++;
        }
    }

    return occupied;
}

const setCharAt = (str, index, chr) => {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

/*
Ruleas are:

- If a seat is empty (L) and there are no occupied seats adjacent to it, the seat becomes occupied.
- If a seat is occupied (#) and four or more seats adjacent to it are also occupied, the seat becomes empty.
- Otherwise, the seat's state does not change.
*/
const iterate = grid => {
    let newGrid = [];
    let changedSeats = 0;
    let occupiedSeats = 0;

    for (let i = 0; i < grid.length; i++) {
        let newLine = grid[i];
        for (let j = 0; j < grid[i].length; j++) {
            let current = grid[i][j];
            if (current === '.') {
                continue;
            }

            if (current === '#') {
                occupiedSeats++;
            }

            const occupiedAdjacents = adjacentSeats(i, j, grid);
            if (current === 'L' && occupiedAdjacents === 0) {
                newLine = setCharAt(newLine, j, '#');
                changedSeats++;
            } else if (current === '#' && occupiedAdjacents >= 4) {
                newLine = setCharAt(newLine, j, 'L');
                changedSeats++;
            }
        }
        newGrid[i] = newLine;
    }

    return {
        grid: newGrid,
        changedSeats: changedSeats,
        occupiedSeats: occupiedSeats,
    };
};

const findEquilibrium = grid => {
    let changedSeats = -1;
    let occupiedSeats = 0;
    let newGrid = [...grid];
    while (changedSeats != 0) {
        let newState = iterate(newGrid);
        newGrid = newState.grid;
        changedSeats = newState.changedSeats;
        occupiedSeats = newState.occupiedSeats;
    }

    return occupiedSeats;
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    let occupiedSeats = findEquilibrium(inputs);
    console.log(`First part: ${occupiedSeats}`);
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