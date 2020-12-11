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

    // left
    let left = j - 1;
    while (left >= 0) {
        if (grid[i][left] === '#') {
            occupied++;
            break;
        }

        if (grid[i][left] === 'L') {
            break;
        }
        left--;
    }

    // up-left
    left = j - 1;
    let up = i - 1;
    while (left >= 0 && up >= 0) {
        if (grid[up][left] === '#') {
            occupied++;
            break;
        }

        if (grid[up][left] === 'L') {
            break;
        }
        left--;
        up--;
    }

    // down-left
    left = j - 1;
    let down = i + 1;
    while (left >= 0 && down < grid.length) {
        if (grid[down][left] === '#') {
            occupied++;
            break;
        }

        if (grid[down][left] === 'L') {
            break;
        }
        left--;
        down++;
    }

    // right
    let right = j + 1;
    while (right < grid[i].length) {
        if (grid[i][right] === '#') {
            occupied++;
            break;
        }

        if (grid[i][right] === 'L') {
            break;
        }
        right++;
    }

    // up-right
    right = j + 1;
    up = i - 1;
    while (right < grid[i].length && up >= 0) {
        if (grid[up][right] === '#') {
            occupied++;
            break;
        }

        if (grid[up][right] === 'L') {
            break;
        }
        right++;
        up--;
    }

    // down-right
    right = j + 1;
    down = i + 1;
    while (right < grid[i].length && down < grid.length) {
        if (grid[down][right] === '#') {
            occupied++;
            break;
        }

        if (grid[down][right] === 'L') {
            break;
        }
        right++;
        down++;
    }

    // up
    up = i - 1;
    while (up >= 0) {
        if (grid[up][j] === '#') {
            occupied++;
            break;
        }
        if (grid[up][j] === 'L') {
            break;
        }
        up--;
    }

    // down
    down = i + 1;
    while (down < grid.length) {
        if (grid[down][j] === '#') {
            occupied++;
            break;
        }
        if (grid[down][j] === 'L') {
            break;
        }
        down++;
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
            } else if (current === '#' && occupiedAdjacents >= 5) {
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