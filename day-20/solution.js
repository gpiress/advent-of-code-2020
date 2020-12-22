const readline = require('readline');
const fs = require('fs');


// add solution code
const createTile = (number, lines) => {
    return {
        number: number,
        lines: lines,
    };
};

const reverseString = stringToReverse => {
    return stringToReverse.split('').reverse().join('');
}

const getTileColumn = (tile, column) => {
    const tileLines = tile.lines;
    return tileLines.map(line => line[column]).join('');
};

const rotateTileRight = tile => {
    const number = tile.number;
    const originalLines = tile.lines;

    let newLines = [];
    for (let i = 0; i < originalLines.length; i++) {
        const newLine = reverseString(getTileColumn(tile, i));
        newLines.push(newLine);
    }

    return createTile(number, newLines);
};

const flipTileHorizontally = tile => {
    const number = tile.number;
    const originalLines = tile.lines;

    let newLines = [];
    for (let i = 0; i < originalLines.length; i++) {
        const newLine = reverseString(originalLines[i]);
        newLines.push(newLine);
    }

    return createTile(number, newLines);
};

const flipTileVertically = tile => {
    const number = tile.number;
    const originalLines = tile.lines;

    let newLines = [];
    for (let i = 0; i < originalLines.length; i++) {
        const newLine = originalLines[originalLines.length - 1 - i];
        newLines.push(newLine);
    }

    return createTile(number, newLines);
};

const solve = inputs => {
    const parseInputs = inputs => {
        let tiles = [];

        let i = 0;
        while (i < inputs.length) {
            if (inputs[i] == '') {
                i++;
                continue;
            }

            if (inputs[i].startsWith('Tile')) {
                // inputs[i] is like "Tile (\d+):"
                const tileNumber = inputs[i].split(' ')[1].split(':')[0];
                let j = i + 1;
                let tileLines = [];

                while (tileLines.length < 10) {
                    tileLines.push(inputs[j]);
                    j++;
                }

                tiles.push(createTile(+tileNumber, tileLines));
                i = j + 1;
            }
        }
        
        return tiles;
    };

    const canBeNeighbors = (tile, otherTile) => {
        const canMatch = (tileBorder, otherTile) => {
            const lastIndex = otherTile.lines.length - 1;
            const possibleOtherBorders = [
                otherTile.lines[lastIndex],
                otherTile.lines[0],
                getTileColumn(otherTile, 0),
                getTileColumn(otherTile, lastIndex),

                reverseString(otherTile.lines[lastIndex]),
                reverseString(otherTile.lines[0]),
                reverseString(getTileColumn(otherTile, lastIndex)),
                reverseString(getTileColumn(otherTile, 0)),
            ];

            if (possibleOtherBorders.indexOf(tileBorder) > -1) {
                return true;
            }
        };

        let directions = [];
        let canBe = false;

        const lastIndex = tile.lines.length - 1;

        // UP
        if (canMatch(tile.lines[0], otherTile)) {
            directions.push('UP');
            canBe = true;
        }

        // DOWN
        if (canMatch(tile.lines[lastIndex], otherTile)) {
            directions.push('DOWN');
            canBe = true;
        }

        // LEFT
        if (canMatch(getTileColumn(tile, 0), otherTile)) {
            directions.push('LEFT');
            canBe = true;
        }

        // RIGHT
        if (canMatch(getTileColumn(tile, lastIndex), otherTile)) {
            directions.push('RIGHT');
            canBe = true;
        }

        return {
            directions: directions,
            canBe, canBe,
        };
    };

    const canBeNeighborStrict = (tile, otherTile) => {
        let directions = [];
        let canBe = false;

        const lastIndex = tile.lines.length - 1;

        // UP
        if (tile.lines[0] === otherTile.lines[lastIndex]) {
            directions.push('UP');
            canBe = true;
        }

        // DOWN
        if (tile.lines[lastIndex] === otherTile.lines[0]) {
            directions.push('DOWN');
            canBe = true;
        }

        // LEFT
        if (getTileColumn(tile, 0) === getTileColumn(otherTile, lastIndex)) {
            directions.push('LEFT');
            canBe = true;
        }

        // RIGHT
        if (getTileColumn(tile, lastIndex) === getTileColumn(otherTile, 0)) {
            directions.push('RIGHT');
            canBe = true;
        }

        return {
            canBe, canBe,
            directions: directions,
        };
    };

    const adjustTileForStateNumber = (originalTile, number) => {
        // [0, 3] -- only rotations
        // [4, 7] -- rotations + flipHor
        // [8, 11] -- rotations + flipVer
        const rotations = number % 4;
        const flippedHor = (number >= 4 && number < 8) ? true : false;
        const flippedVert = (number >= 8 && number < 11) ? true : false;

        let tempTile = createTile(originalTile.number, originalTile.lines);
        for (let i = 0; i < rotations; i++) {
            tempTile = rotateTileRight(tempTile);
        }

        tempTile = flippedHor ? flipTileHorizontally(tempTile) : tempTile;
        tempTile = flippedVert ? flipTileVertically(tempTile) : tempTile;
        
        return {
            newTile: tempTile,
            rotations,
            flippedHor,
            flippedVert,
        };
    }

    // Compute all possible neighbors for all variations of tile
    const getAllNeighborsForTile = (tile, tiles) => {
        let allNeighbors = [];

        // ALL_POSSIBILITIES = #rotations + #rotated_flips_hor + #rotated_flips_vert
        const ALL_POSSIBILITIES = 4 + 4 + 4;
        let i = 0;
        while (i < ALL_POSSIBILITIES) {
            //console.log(`   Finding all neighbors for ${JSON.stringify(tempTile, undefined, 4)}`);
            let { newTile, rotations, flippedHor, flippedVert } = adjustTileForStateNumber(tile, i);
            let uniqueNeighbors = new Set();
            let rightNeighbors = [];
            let leftNeighbors = [];
            let upNeighbors = [];
            let downNeighbors = [];

            for (let otherTile of tiles) {
                if (tile.number === otherTile.number) {
                    continue;
                }
    
                let j = 0
                while (j < ALL_POSSIBILITIES) {
                    let otherNewTileState = adjustTileForStateNumber(otherTile, j);
                    let otherNewTile = otherNewTileState.newTile;

                    const { canBe, directions } = canBeNeighborStrict(newTile, otherNewTile);
                    if (canBe) {
                        uniqueNeighbors.add(otherTile.number);
                        if (directions.indexOf('UP') > -1) {
                            upNeighbors.push({ number: otherTile.number, state: j });
                        }

                        if (directions.indexOf('DOWN') > -1) {
                            downNeighbors.push({ number: otherTile.number, state: j });
                        }

                        if (directions.indexOf('LEFT') > -1) {
                            leftNeighbors.push({ number: otherTile.number, state: j });
                        }

                        if (directions.indexOf('RIGHT') > -1) {
                            rightNeighbors.push({ number: otherTile.number, state: j });
                        }
                    }

                    j++;
                }
            }

            // Ignore alternatives that have no possible neighbors
            if (uniqueNeighbors.size >= 2) {
                allNeighbors.push({
                    uniqueNeighbors: Array.from(uniqueNeighbors),
                    rightNeighbors: rightNeighbors,
                    leftNeighbors: leftNeighbors,
                    upNeighbors: upNeighbors,
                    downNeighbors: downNeighbors,
                    state: i,
                });
            }

            i++;
        }

        return allNeighbors;
    };

    const buildAdjancencyMap = tiles => {
        let adjacencyMap = new Map();

        tiles.forEach(tile => {
            const tilePossibleNeighbors = getAllNeighborsForTile(tile, tiles);
            adjacencyMap.set(tile.number, tilePossibleNeighbors);
        });

        return adjacencyMap;
    };

    const findBordersNumbers = adjacencyMap => {
        let borders = [];
        for (let tileNumber of adjacencyMap.keys()) {
            const possibleNeighbors = adjacencyMap.get(tileNumber);

            const tileProlificVariations = possibleNeighbors.filter(neighborInfo => neighborInfo.uniqueNeighbors.length > 2);
            if (tileProlificVariations.length === 0) {
                // Can't get the tile to any state where it has more than 2 neighbor tiles!
                borders.push(tileNumber);
            }
        }

        return borders;
    };

    const getTileByNumber = (tiles, tileNumber) => {
        return tiles.filter(tile => tile.number === tileNumber)[0];
    };

    const buildPuzzle = (borderNumbers, adjacencyMap, tiles) => {
        const isNumberInNeighborList = (neighborList, number) => {
            const matching = neighborList.filter(neighborInfo => neighborInfo.number === number); 
            return matching.length > 0;
        };

        const doesTileFit = (tile, adjacencyMap, puzzle, x, y) => {
            const lastIndex = puzzle.length - 1;

            const leftNeighbor = y > 0 ? puzzle[x][y - 1] : undefined;
            const rightNeighbor = y < lastIndex ? puzzle[x][y + 1] : undefined
            const upNeighbor = x > 0 ? puzzle[x - 1][y] : undefined;
            const downNeighbor = x < lastIndex ? puzzle[x + 1][y] : undefined;

            if (leftNeighbor === undefined && rightNeighbor === undefined && upNeighbor === undefined && downNeighbor === undefined) {
                //console.error(`Something went wrong. No neighbors set for pos { x: ${x}, y: ${y} }, anything could fit.`);
                return { fits: true, positions: adjacencyMap.get(tile.number) };
            }

            let validStates = [];
            let statesPopulated = false;

            if (leftNeighbor) {
                //console.log(`   [${tile.number}]: Checking left neighbors`);
                let validInnerStates = new Set();
                const neighborNumber = leftNeighbor.tile.number;
                const neighborState = leftNeighbor.state;
                let neighborNeighbors = adjacencyMap.get(neighborNumber);
                // Only check for the state the tile actually is on the board
                const validNeighborNeighbors = neighborNeighbors.filter(neighbors => neighbors.state === neighborState);

                validNeighborNeighbors
                    .filter(neighbors => isNumberInNeighborList(neighbors.rightNeighbors, tile.number))
                    .forEach(neighbors => {
                        const neighborsInfo = neighbors.rightNeighbors;
                        const matchingInfo = neighborsInfo.filter(info => info.number === tile.number);
                        matchingInfo
                            .map(info => info.state)
                            .forEach(state => validInnerStates.add(state));
                    });
                
                if (!statesPopulated) {
                    validStates = Array.from(validInnerStates);
                    statesPopulated = true;
                }
            }

            if (rightNeighbor) {
                //console.log(`   [${tile.number}]: Checking right neighbors`);
                let validInnerStates = new Set();
                const neighborNumber = rightNeighbor.tile.number;
                const neighborState = rightNeighbor.state;
                let neighborNeighbors = adjacencyMap.get(neighborNumber);
                // Only check for the state the tile actually is on the board
                const validNeighborNeighbors = neighborNeighbors.filter(neighbors => neighbors.state === neighborState);

                validNeighborNeighbors
                    .filter(neighbors => isNumberInNeighborList(neighbors.leftNeighbors, tile.number))
                    .forEach(neighbors => {
                        const neighborsInfo = neighbors.leftNeighbors;
                        const matchingInfo = neighborsInfo.filter(info => info.number === tile.number);
                        matchingInfo
                            .map(info => info.state)
                            .forEach(state => validInnerStates.add(state));
                    });
                
                if (!statesPopulated) {
                    validStates = Array.from(validInnerStates);
                    statesPopulated = true;
                } else {
                    // Remove states that are already present but not in validInnerStates'
                    validStates = validStates.filter(state => validInnerStates.has(state));
                }
            }

            if (upNeighbor) {
                //console.log(`   [${tile.number}]: Checking up neighbors`);
                let validInnerStates = new Set();
                const neighborNumber = upNeighbor.tile.number;
                const neighborState = upNeighbor.state;
                let neighborNeighbors = adjacencyMap.get(neighborNumber);
                // Only check for the state the tile actually is on the board
                const validNeighborNeighbors = neighborNeighbors.filter(neighbors => neighbors.state === neighborState);

                validNeighborNeighbors
                    .filter(neighbors => isNumberInNeighborList(neighbors.downNeighbors, tile.number))
                    .forEach(neighbors => {
                        const neighborsInfo = neighbors.downNeighbors;
                        const matchingInfo = neighborsInfo.filter(info => info.number === tile.number);
                        matchingInfo
                            .map(info => info.state)
                            .forEach(state => validInnerStates.add(state));
                    });
                
                if (!statesPopulated) {
                    validStates = Array.from(validInnerStates);
                    statesPopulated = true;
                } else {
                    // Remove states that are already present but not in validInnerStates'
                    validStates = validStates.filter(state => validInnerStates.has(state));
                }
            }

            if (downNeighbor) {
                //console.log(`   [${tile.number}]: Checking down neighbors`);
                let validInnerStates = new Set();
                const neighborNumber = downNeighbor.tile.number;
                const neighborState = downNeighbor.state;
                let neighborNeighbors = adjacencyMap.get(neighborNumber);
                // Only check for the state the tile actually is on the board
                const validNeighborNeighbors = neighborNeighbors.filter(neighbors => neighbors.state === neighborState);

                validNeighborNeighbors
                    .filter(neighbors => isNumberInNeighborList(neighbors.upNeighbors, tile.number))
                    .forEach(neighbors => {
                        const neighborsInfo = neighbors.upNeighbors;
                        const matchingInfo = neighborsInfo.filter(info => info.number === tile.number);
                        matchingInfo
                            .map(info => info.state)
                            .forEach(state => validInnerStates.add(state));
                    });
                
                if (!statesPopulated) {
                    validStates = Array.from(validInnerStates);
                    statesPopulated = true;
                } else {
                    // Remove states that are already present but not in validInnerStates'
                    validStates = validStates.filter(state => validInnerStates.has(state));
                }
            }

            if (validStates.length === 0) {
                return {
                    fits: false,
                    positions: [],
                };
            }

            const initialPositions = adjacencyMap.get(tile.number);
            const candidates = initialPositions.filter(position => validStates.indexOf(position.state) > -1);

            return {
                fits: true,
                positions: candidates,
            };
        };

        const findFittingPositions = (tile, adjacencyMap, usedTiles, puzzle, x, y, lastIndex) => {
            const { fits, positions } = doesTileFit(tile, adjacencyMap, puzzle, x, y);

            if (!fits) {
                console.log(`       Tile ${tile.number} does not fit in pos [${x}, ${y}]`);
                return [];
            }

            let allPossiblePosition = adjacencyMap.get(tile.number);
            const fittingPositions = allPossiblePosition.filter(position => {
                //console.log(`Filtering some weird positions: ${JSON.stringify(positions, undefined, 4)}`);
                const matchingPositions = positions.filter(otherPosition => position.state === otherPosition.state);
                return matchingPositions.length > 0;
            });

            let isLeftEmpty = y > 0 && puzzle[x][y - 1] === undefined;
            let isRightEmpty = y < lastIndex && puzzle[x][y + 1] === undefined;
            let isUpEmpty = x > 0 && puzzle[x - 1][y] === undefined;
            let isDownEmpty = x < lastIndex && puzzle[x + 1][y] === undefined;

            const reallyFittingPositions = fittingPositions
                .filter(position => !isLeftEmpty ? true : position.leftNeighbors.filter(left => !usedTiles.has(left.number)).length > 0)
                .filter(position => !isRightEmpty ? true : position.rightNeighbors.filter(right => !usedTiles.has(right.number)).length > 0)
                .filter(position => !isUpEmpty ? true : position.upNeighbors.filter(up => !usedTiles.has(up.number)).length > 0)
                .filter(position => !isDownEmpty ? true : position.downNeighbors.filter(down => !usedTiles.has(down.number)).length > 0);
            
            
            //console.log('');
            //console.log(`       ${reallyFittingPositions.length} Really fitting positions for tile ${tile.number} in pos [${x}, ${y}] -- ${JSON.stringify(reallyFittingPositions, undefined, 4)}`);
            return reallyFittingPositions;
        };

        const getToVisitTiles = (rightNeighbors, leftNeighbors, upNeighbors, downNeighbors, x, y, maxIndex, sideSize) => {
            let toVisitNodes = [];
            
            if (y < sideSize - 1) {
                if (rightNeighbors.length === 1) {
                    let toVisit = { number: rightNeighbors[0].number, x: x, y: y + 1 };
                    toVisitNodes.unshift(toVisit);
                } else {
                    rightNeighbors.forEach(right => {
                        let toVisit = { number: right.number, x: x, y: y + 1 };
                        toVisitNodes.push(toVisit);
                    });
                }
            }

            if (y > 0) {
                if (leftNeighbors.length === 1) {
                    let toVisit = { number: leftNeighbors[0].number, x: x, y: y - 1 };
                    toVisitNodes.unshift(toVisit);
                } else {
                    leftNeighbors.forEach(left => {
                        let toVisit = { number: left.number, x: x, y: y - 1 };
                        toVisitNodes.push(toVisit);
                    });
                }
            }

            if (x > 0) {
                if (upNeighbors.length === 1) {
                    let toVisit = { number: upNeighbors[0].number, x: x - 1, y: y };
                    toVisitNodes.unshift(toVisit);
                } else {
                    upNeighbors.forEach(up => {
                        let toVisit = { number: up.number, x: x - 1, y: y };
                        toVisitNodes.push(toVisit);
                    });
                }
            }

            if (x < sideSize - 1) {
                if (downNeighbors.length === 1) {
                    let toVisit = { number: downNeighbors[0].number, x: x + 1, y: y };
                    toVisitNodes.unshift(toVisit);
                } else {
                    downNeighbors.forEach(down => {
                        let toVisit = { number: down.number, x: x + 1, y: y };
                        toVisitNodes.push(toVisit);
                    });
                }
            }
            
            return toVisitNodes;
        };

        const sideSize = Math.floor(Math.sqrt(tiles.length));
        const lastIndex = tiles[0].lines.length - 1;
        let puzzle = [];
        let emptySlots = tiles.length;
        for (let i = 0; i < sideSize; i++) {
            let puzzleLine = [];
            for (let j = 0; j < sideSize; j++) {
                puzzleLine.push(undefined);
                emptySlots++;
            }
            puzzle.push(puzzleLine);
        }

        // top-left tile can be any of the border tiles
        let usedTiles = new Set();
        const topLeftNumber = borderNumbers[0];
        let toVisit = [ { number: topLeftNumber, x: 0, y: 0 } ];

        while (emptySlots > 0) {
            if (toVisit.length === 0) {
                break;
            }
            const { number, x, y } = toVisit.shift();

            if (usedTiles.has(number)) {
                //console.log(`   Tile ${number} already on the board`);
                continue;
            }

            //console.log(`   Trying to fit tile ${number} at pos { x: ${x}, y: ${y} }`);
            const visitingTile = getTileByNumber(tiles, number);

            const fittingPositions = findFittingPositions(visitingTile, adjacencyMap, usedTiles, puzzle, x, y, sideSize - 1);
            if (fittingPositions.length === 0) {
                console.warn(`      The dream is over, couldn't fit tile ${number}.`);
                continue;
            }

            // Put tile in the right position
            const { state, rightNeighbors, leftNeighbors, upNeighbors, downNeighbors } = fittingPositions[0];
            const { newTile } = adjustTileForStateNumber(visitingTile, state);

            //console.log(`   Tile ${number} fits in pos [${x}, ${y}], with state ${state}.`);
            //console.log(JSON.stringify(newTile));
            
            puzzle[x][y] = { tile: newTile, state: state };
            usedTiles.add(number);
            emptySlots--;

            // Add neighbors to visit
            // Visit first the more restricted one, for example if the tile only has 1 left neighbor possible
            let toVisitTempNodes = getToVisitTiles(rightNeighbors, leftNeighbors, upNeighbors, downNeighbors, x, y, lastIndex, sideSize);

            toVisit = toVisit.concat(toVisitTempNodes);
        }

        return puzzle;
    };

    const buildImage = puzzle => {
        const getImageFromTile = tile => {
            // Gotta remove borders, that is, first and last lines, first and last columns
            let imageLines = [];
            let tileSize = tile.lines.length;

            for (let i = 1; i < tileSize - 1; i++) {
                const tileLine = tile.lines[i];
                imageLines.push(tileLine.substring(1, tileSize - 1));
            }
            return imageLines;
        };

        let tileLength = puzzle[0][0].tile.lines.length;
        let imageLines = Array.from({ length: puzzle.length * (tileLength - 2) }).fill('');
        for (let i = 0; i < puzzle.length; i++) {
            for (let j = 0; j < puzzle.length; j++) {
                const { tile } = puzzle[i][j];
                const tileImage = getImageFromTile(tile);

                const startLine = i * (tileLength - 2);
                for (let k = startLine; k < startLine + tileImage.length; k++) {
                    imageLines[k] += tileImage[k - startLine];
                }
            }
        }

        return imageLines;
    };

    const countEmptySeaTiles = image => {
        const hereBeMonsters = imageTile => {
            let imageLines = imageTile.lines;
            let count = 0;
            let startingPositions = [];

            const monsterPattern = [
                [18],
                [0, 5, 6, 11, 12, 17, 18, 19],
                [1, 4, 7, 10, 13, 16],
            ];

            for (let i = 1; i < imageLines.length - 1; i++) {
                for (let j = 0; j < imageLines.length - 20; j++) {
                    let isMatch = true;

                    // Check middle line first since it's the most restricted
                    for (let k = 0; k < monsterPattern[1].length; k++) {
                        const indexToCheck = j + monsterPattern[1][k];
                        if (imageLines[i][indexToCheck] !== '#') {
                            isMatch = false;
                            break;
                        }
                    }

                    if (!isMatch) {
                        continue;
                    }

                    // Check third line next since it's more restricted
                    for (let k = 0; k < monsterPattern[2].length; k++) {
                        const indexToCheck = j + monsterPattern[2][k];
                        if (imageLines[i + 1][indexToCheck] !== '#') {
                            isMatch = false;
                            break;
                        }
                    }

                    if (!isMatch) {
                        continue;
                    }

                    // Finally check the first line
                    const indexToCheck = j + 18;
                    isMatch = imageLines[i - 1][indexToCheck] === '#';

                    if (isMatch) {
                        console.log(`   Found monster starting at pos [${i}, ${j}]`);
                        count++;
                        startingPositions.push({ x: i, y: j });
                    }
                }
            }

            return {
                count,
                startingPositions,
            };
        };

        const seaTilesPerLine = line => {
            const lineAsList = line.split('');
            return lineAsList.filter(letter => letter === '#').length;
        }

        const ALL_POSSIBILITIES = 4 + 4 + 4;

        let imageTile = createTile(1, image);
        let i = 0;
        let count = 0;
        while (i < ALL_POSSIBILITIES) {        
            imageTile = adjustTileForStateNumber(imageTile, i).newTile;
            console.log(`Trying to find monsters in state ${i}`);
            const monstersFound = hereBeMonsters(imageTile);
            count = monstersFound.count;

            if (count > 0) {
                break;
            }
            i++;
        }

        const MONSTER_TILE_COUNT = 15;
        const totalSeaTiles = imageTile.lines.reduce((prev, curr) => prev + seaTilesPerLine(curr), 0);

        return totalSeaTiles - (MONSTER_TILE_COUNT * count);
    }

    let scrambledTiles = parseInputs(inputs);
    let adjacencyMap = buildAdjancencyMap(scrambledTiles);
    let borderNumbers = findBordersNumbers(adjacencyMap);

    console.log("Found border candidates:");
    borderNumbers.forEach(border => console.log(`   ${border}`));
    console.log("-------------------------");
    console.log('');

    const puzzle = buildPuzzle(borderNumbers, adjacencyMap, scrambledTiles);
    
    console.log("-------------------------");
    console.log('');
    console.log("Found puzzle solution:");
    console.log("-------------------------");
    console.log('');
    for (let i = 0; i < puzzle.length; i++) {
        let newLine = [];
        for (let j = 0; j < puzzle.length; j++) {
            if (puzzle[i][j]) {
                newLine.push(puzzle[i][j].tile.number);
            } else {
                newLine.push(-999);
            }
        }
        console.log(newLine.join('  '));
    }

    const image = buildImage(puzzle);
    console.log("-------------------------");
    console.log('');
    console.log("Built original image:");
    console.log("-------------------------");
    console.log('');
    image.forEach(line => console.log(line));
    console.log("-------------------------");
    console.log('');

    return {
        firstPart: borderNumbers.reduce((prev, curr) => prev * curr, 1),
        secondPart: countEmptySeaTiles(image),
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