const readline = require('readline');
const fs = require('fs');

let areaMap = [];

const treesInSlope = (moveRight, moveDown) => {
    const startRow = 0;
    const finalRow = areaMap.length;

    const startCol = 0;
    const totalCols = areaMap[0].length;

    let row = startRow;
    let col = startCol;

    let trees = 0;
    while (row < finalRow) {
        if (areaMap[row][col] === '#') {
            trees++;
        }

        row += moveDown;
        col = (col + moveRight) % totalCols;
    }

    return trees;
}

const firstPart = () => {
    return treesInSlope(3, 1);
}

const secondPart = () => {
    /*
    Right 1, down 1.
    Right 3, down 1. (This is the slope you already checked.)
    Right 5, down 1.
    Right 7, down 1.
    Right 1, down 2.
    */
    return (treesInSlope(1, 1) * treesInSlope(3, 1) * treesInSlope(5, 1) * treesInSlope(7, 1) * treesInSlope(1, 2));
}

const processLine = line => {
    // each line is like : "..#...##...###.........#..#..#."
    // . are open spaces
    // # are trees
    areaMap.push(line);
}

const computeResults = () => {
    console.log(`First part: ${firstPart()}`);
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