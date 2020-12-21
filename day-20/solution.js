const readline = require('readline');
const fs = require('fs');


// add solution code
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

                tiles.push({ number: +tileNumber, lines: tileLines });
                i = j + 1;
            }
        }
        
        return tiles;
    };

    const getTileColumn = (tile, col) => {
        return tile.lines.reduce((prev, curr) => prev + curr[col], '');
    }

    const rotateTileRight = tile => {
        let newTile = Object.assign({}, tile);

        let newLines = [];
        for (let i = 0; i < tile.lines[0].length; i++) {
            const col = getTileColumn(tile, i);
            newLines.push(col.split('').reverse().join(''));
        }

        newTile.lines = newLines;
        return newTile;
    };

    const flipTileVertical = tile => {
        let newTile = Object.assign({}, tile);

        let newLines = [];
        for (let i = 0; i < tile.lines.length; i++) {
            const row = tile.lines[tile.lines.length - 1 - i];
            newLines.push(row);
        }

        newTile.lines = newLines;
        return newTile;
    };

    const flipTileHorizontal = tile => {
        let newTile = Object.assign({}, tile);

        let newLines = [];
        for (let i = 0; i < tile.lines.length; i++) {
            const row = tile.lines[i];
            const reversedRow = row.split('').reverse().join('');
            newLines.push(reversedRow);
        }

        newTile.lines = newLines;
        return newTile;
    };

    const canBorderMatch = (border, otherTile) => {
        const otherBorders = new Set([
            getTileColumn(otherTile, 0),
            getTileColumn(otherTile, 9),
            getTileColumn(otherTile, 0).split('').reverse().join(''),
            getTileColumn(otherTile, 9).split('').reverse().join(''),
            otherTile.lines[0],
            otherTile.lines[0].split('').reverse().join(''),
            otherTile.lines[9],
            otherTile.lines[9].split('').reverse().join(''),
        ]);

        return otherBorders.has(border);
    };

    const getDetailedNeighbors = (tile, tiles) => {
        const UP = "DIRECTION_UP";
        const DOWN = "DIRECTION_DOWN";
        const LEFT = "DIRECTION_LEFT";
        const RIGHT = "DIRECTION_RIGHT";
        const NONE = "NONE";

        const canFitTogether = (tile, otherTile) => {
            const firstRow = tile.lines[0];
            const lastRow = tile.lines[9];
            const firstCol = getTileColumn(tile, 0);
            const lastCol = getTileColumn(tile, 9);

            if (canBorderMatch(firstRow, otherTile)) {
                return { direction: UP, tile: otherTile.number };
            }

            if (canBorderMatch(lastRow, otherTile)) {
                return { direction: DOWN, tile: otherTile.number };
            }

            if (canBorderMatch(firstCol, otherTile)) {
                return { direction: LEFT, tile: otherTile.number };
            }

            if (canBorderMatch(lastCol, otherTile)) {
                return { direction: RIGHT, tile: otherTile.number };
            }

            return { direction: NONE };
        };

        const otherTilesMatches = tiles
            .filter(otherTile => otherTile.number !== tile.number)
            .map(otherTile => canFitTogether(tile, otherTile));

        let initialNeighborsState = {
            up: [],
            down: [],
            left: [],
            right: [],
            total: 0,
        };

        return otherTilesMatches
            .reduce((previous, otherTileMatch) => {
                if (otherTileMatch.direction === UP) {
                    previous.up.push(otherTileMatch.tile);
                    previous.total++;
                }

                if (otherTileMatch.direction === DOWN) {
                    previous.down.push(otherTileMatch.tile);
                    previous.total++;
                }

                if (otherTileMatch.direction === LEFT) {
                    previous.left.push(otherTileMatch.tile);
                    previous.total++;
                }

                if (otherTileMatch.direction === RIGHT) {
                    previous.right.push(otherTileMatch.tile);
                    previous.total++;
                }

                return previous;
            }, initialNeighborsState);
    };

    const getPossibleNeighbors = tiles => {
        let possibleNeighbors = new Map();
        for (let tile of tiles) {
            let neighborsPerRotation = [];
            let maxRotation = -1;
            let maxNeighbors = -1;
            
            let tempTile = Object.assign({}, tile);
            for (let i = 0; i < 12; i++) {
                const tileNeighbors = getDetailedNeighbors(tempTile, tiles);
                neighborsPerRotation.push(tileNeighbors);

                if (tileNeighbors.total > maxNeighbors) {
                    maxRotation = i;
                    maxNeighbors = tileNeighbors.total;
                }

                tempTile = rotateTileRight(tempTile);
                if (i % 4 === 0) {
                    tempTile = Object.assign({}, tile);
                }

                if (i >= 4 && i < 8) {
                    tempTile = flipTileVertical(tempTile);
                }

                if (i >= 8) {
                    tempTile = flipTileHorizontal(tempTile);
                }
            }

            const neighborInfo = {
                maxRotation: maxRotation,
                maxNeighbors: maxNeighbors,
                rotations: neighborsPerRotation,
            }
            possibleNeighbors.set(tile.number, neighborInfo);
        }

        return possibleNeighbors;
    };

    const printBadTiles = possibleNeighbors => {
        console.log(`   Tiles with < 2 neighbors:`);
        for (let entry of possibleNeighbors) {
            if (entry[1].maxNeighbors < 2) {
                console.log(`   ${JSON.stringify(entry[0])}: ${ JSON.stringify( entry[1] ) }`);
            }
        }
    };

    const getDistinctNeighbors = rotations => {
        return rotations.reduce((previous, current) => {
            current.up.forEach(tile => previous.add(tile));
            current.down.forEach(tile => previous.add(tile));
            current.left.forEach(tile => previous.add(tile));
            current.right.forEach(tile => previous.add(tile));

            return previous;
        }, new Set()); 
    };

    const getRestrictedTiles = possibleNeighbors => {
        let restrictedTiles = [];
        for (let entry of possibleNeighbors) {
            if (entry[1].maxNeighbors === 2) {
                const restrictedRotations = entry[1].rotations.filter(rotation => rotation.total === 2);
                const validRotations = entry[1].rotations
                    .map((rotation, index) => {
                        if (rotation.total !== 2) {
                            return undefined;
                        }

                        return { index: index, up: rotation.up, down: rotation.down, left: rotation.left, right: rotation.right };
                    })
                    .filter(rotation => rotation !== undefined);
                //console.log(`   Tile ${entry[0]} has only 2 neighbors in ${restrictedRotations.length} variations:`);

                const allPossibleNeighbors = getDistinctNeighbors(restrictedRotations);

                if (allPossibleNeighbors.size === 2) {
                    restrictedTiles.push({ number: entry[0], validNeighbors: allPossibleNeighbors, validRotations: validRotations });
                }
            }
        }

        return restrictedTiles;
    }

    const printRestrictedTiles = restrictedTiles => {
        console.log('Really restricted tiles (only 2 valid neighbors):');
        console.log('-------------------------------------------------');
        
        restrictedTiles.map(tile => {
            console.log(`   Tile ${tile.number} has only ${ JSON.stringify( Array.from(tile.validNeighbors) )} as possible neighbors. Valid rotations are ${ JSON.stringify(tile.validRotations) }`);
        });
    }

    const firstPart = restrictedTiles => {
        if (restrictedTiles.length === 4) {
            console.log('   Only 4 possible borders. Lucky!');

            return restrictedTiles.reduce((prev, curr) => prev * curr.number, 1);
        } else {
            console.log(`   Too many possible borders <${restrictedTiles.length}>. Unlucky!`);
        }

        return -1;
    };

    const createImage = (tiles, neighbors, restrictedTiles) => {
        console.log(`   Creating image!`);
        const arrangeTileToTopLeft = (tile, rotation) => {
            let tempTile = Object.assign({}, tile);
            //console.log(`       Arranging first tile to border: ${JSON.stringify(tempTile, undefined, 4)}`);
            //console.log(`       Rotations: ${JSON.stringify(rotation, undefined, 4)}`);
            let rightTile = -1;
            let downTile = -1;
            if (rotation.down.length === 1 && rotation.left.length === 1) {
                tempTile = rotateTileRight(tempTile);
                tempTile = rotateTileRight(tempTile);
                tempTile = rotateTileRight(tempTile);

                downTile = rotation.left[0];
                rightTile = rotation.down[0];
            }

            if (rotation.up.length === 1 && rotation.left.length === 1) {
                tempTile = rotateTileRight(tempTile);
                tempTile = rotateTileRight(tempTile);

                downTile = rotation.up[0];
                rightTile = rotation.left[0];
            }

            if (rotation.up.length === 1 && rotation.right.length === 1) {
                tempTile = rotateTileRight(tempTile);

                downTile = rotation.right[0];
                rightTile = rotation.up[0];
            }

            if (rotation.down.length === 1 && rotation.right.length === 1) {
                downTile = rotation.down[0];
                rightTile = rotation.right[0];
            }

            return { tile: tempTile, right: rightTile, down: downTile };
        };

        const adjustTileToMatchBorder = (tile, borderToMatch, direction) => {
            let tempTile = Object.assign({}, tile);
            const lastIndex = tempTile.lines.length - 1;

            let firstRow = tempTile.lines[0];
            let lastRow = tempTile.lines[lastIndex];
            let firstCol = getTileColumn(tempTile, 0);
            let lastCol = getTileColumn(tempTile, lastIndex);

            const currentBorders = [firstRow, lastRow, firstCol, lastCol];

            const flippedTileHor = flipTileHorizontal(tempTile);
            const flippedBordersHorizontal = [
                flippedTileHor.lines[0],
                flippedTileHor.lines[lastIndex],
                getTileColumn(flippedTileHor, 0),
                getTileColumn(flippedTileHor, lastIndex),
            ];

            const flippedTileVert = flipTileVertical(tempTile);
            const flippedBordersVertical = [
                flippedTileVert.lines[0],
                flippedTileVert.lines[lastIndex],
                getTileColumn(flippedTileVert, 0),
                getTileColumn(flippedTileVert, lastIndex),
            ];

            if (direction === 'UP') {
                if (firstRow === borderToMatch) {
                    return tempTile;
                }

                if (currentBorders.indexOf(borderToMatch) > -1) {
                    // only rotations needed
                    while (firstRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstRow = tempTile.lines[0];
                    }

                    return tempTile;
                }

                if (flippedBordersHorizontal.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileHor);
                    firstRow = tempTile.lines[0];
                    while (firstRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstRow = tempTile.lines[0];
                    }

                    return tempTile;
                }

                if (flippedBordersVertical.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileVert);
                    firstRow = tempTile.lines[0];
                    while (firstRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstRow = tempTile.lines[0];
                    }

                    return tempTile;
                }
            }

            if (direction === 'DOWN') {
                if (lastRow === borderToMatch) {
                    return tempTile;
                }

                if (currentBorders.indexOf(borderToMatch) > -1) {
                    // only rotations needed
                    while (lastRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastRow = tempTile.lines[lastIndex];
                    }

                    return tempTile;
                }

                if (flippedBordersHorizontal.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileHor);
                    lastRow = tempTile.lines[lastIndex];
                    while (lastRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastRow = tempTile.lines[lastIndex];
                    }

                    return tempTile;
                }

                if (flippedBordersVertical.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileVert);
                    lastRow = tempTile.lines[lastIndex];;
                    while (lastRow !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastRow = tempTile.lines[lastIndex];
                    }

                    return tempTile;
                }
            }

            if (direction === 'LEFT') {
                if (firstCol === borderToMatch) {
                    return tempTile;
                }

                if (currentBorders.indexOf(borderToMatch) > -1) {
                    // only rotations needed
                    while (firstCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstCol = getTileColumn(tempTile, 0);
                    }

                    return tempTile;
                }

                if (flippedBordersHorizontal.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileHor);
                    firstCol = tempTile.lines[0];
                    while (firstCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstCol = getTileColumn(tempTile, 0);
                    }

                    return tempTile;
                }

                if (flippedBordersVertical.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileVert);
                    firstCol = tempTile.lines[0];
                    while (firstCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        firstCol = getTileColumn(tempTile, 0);
                    }

                    return tempTile;
                }
            }

            if (direction === 'RIGHT') {
                if (lastCol === borderToMatch) {
                    return tempTile;
                }

                if (currentBorders.indexOf(borderToMatch) > -1) {
                    // only rotations needed
                    while (lastCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastCol = getTileColumn(tempTile, lastIndex);
                    }

                    return tempTile;
                }

                if (flippedBordersHorizontal.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileHor);
                    lastCol = getTileColumn(tempTile, lastIndex);
                    while (lastCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastCol = getTileColumn(tempTile, lastIndex);
                    }

                    return tempTile;
                }

                if (flippedBordersVertical.indexOf(borderToMatch) > -1) {
                    tempTile = Object.assign({}, flippedTileVert);
                    lastCol = getTileColumn(tempTile, lastIndex);
                    while (lastCol !== borderToMatch) {
                        tempTile = rotateTileRight(tempTile);
                        lastCol = getTileColumn(tempTile, lastIndex);
                    }

                    return tempTile;
                }
            }

            return undefined;
        };

        const adjustTileToFitGrid = (newTile, newTilePos, tileGrid) => {
            let adjusted = false;
            let adjustedTile = undefined;

            // UP
            if (newTilePos.x > 0) {
                const neighbor = tileGrid[newTilePos.x - 1][newTilePos.y];
                if (neighbor !== undefined) {
                    const rowToMatch = neighbor.lines[neighbor.lines.length - 1];
                    adjustedTile = adjustTileToMatchBorder(newTile, rowToMatch, 'UP');
                    adjusted = true;
                }
            }

            // DOWN
            if (newTilePos.x < tileGrid.length) {
                const neighbor = tileGrid[newTilePos.x + 1][newTilePos.y];
                if (neighbor !== undefined) {
                    const rowToMatch = neighbor.lines[0];

                    if (adjusted && adjustedTile.lines[adjustedTile.lines.length - 1] !== rowToMatch) {
                        console.log(`       Shit happened, already adjusted tile ${newTile.number} but it doesn't match DOWN neighbor`);
                        console.log(`           Found: <${adjustedTile.lines[adjustedTile.lines.length - 1]}>, expected: <${rowToMatch}>`);
                        return undefined;
                    }
                    adjustedTile = adjustTileToMatchBorder(newTile, rowToMatch, 'UP');
                    adjusted = true;
                }
            }

            // LEFT
            if (newTilePos.y > 0) {
                const neighbor = tileGrid[newTilePos.x][newTilePos.y - 1];
                if (neighbor !== undefined) {
                    const colToMatch = getTileColumn(neighbor, neighbor.lines.length - 1);

                    if (adjusted && getTileColumn(adjustedTile, 0) !== colToMatch) {
                        console.log(`       Shit happened, already adjusted tile ${newTile.number} but it doesn't match LEFT neighbor`);
                        console.log(`           Found: <${getTileColumn(adjustedTile, 0)}>, expected: <${colToMatch}>`);
                        return undefined;
                    }
                    console.log(`           Trying to match ${newTile.number} to the right of tile ${neighbor.number}`);
                    adjustedTile = adjustTileToMatchBorder(newTile, colToMatch, 'LEFT');
                    console.log(`           Adjusted tile ${newTile.number} to the right of tile ${neighbor.number}`);
                    adjusted = true;
                }
            }

            if (newTilePos.y < tileGrid.length) {
                const neighbor = tileGrid[newTilePos.x][newTilePos.y + 1];
                if (neighbor !== undefined) {
                    const colToMatch = getTileColumn(neighbor, 0);

                    if (adjusted && getTileColumn(adjustedTile, neighbor.lines.length - 1) !== colToMatch) {
                        console.log(`       Shit happened, already adjusted tile ${newTile.number} but it doesn't match RIGHT neighbor`);
                        console.log(`           Found: <${getTileColumn(adjustedTile, neighbor.lines.length - 1)}>, expected: <${colToMatch}>`);
                        return undefined;
                    }
                    adjustedTile = adjustTileToMatchBorder(newTile, colToMatch, 'RIGHT');
                    adjusted = true;
                }
            }

            return adjustedTile;
        };

        const getValidPositionsInGrid = (tileGrid, validNeighborsNumbers) => {
            let emptyPositions = [];

            for (let i = 0; i < tileGrid.length; i++) {
                for (let j = 0; j < tileGrid.length; j++) {
                    if (tileGrid[i][j] === undefined) {
                        emptyPositions.push({ x: i, y: j });
                    }
                }
            }

            const validEmptyPositions = emptyPositions.filter(position => {
                const { x, y } = position;
                let neighbors = [];
                const lastPos = tileGrid.length - 1;

                if (x > 0 && tileGrid[x - 1][y] !== undefined) {
                    neighbors.push(tileGrid[x - 1][y]);
                }

                if (x < lastPos && tileGrid[x + 1][y] !== undefined) {
                    neighbors.push(tileGrid[x + 1][y]);
                }

                if (y > 0 && tileGrid[x][y - 1] !== undefined) {
                    neighbors.push(tileGrid[x][y - 1]);
                }

                if (y < lastPos && tileGrid[x][y + 1] !== undefined) {
                    neighbors.push(tileGrid[x][y + 1]);
                }

                const invalidNeighbors = neighbors.filter(neighbor => !validNeighborsNumbers.has(neighbor.number));
                return neighbors.length > 0 && invalidNeighbors.length === 0;
            });

            return validEmptyPositions;
        };

        const getTileByNumber = (tiles, number) => {
            return tiles.filter(tile => tile.number === number)[0];
        };
        
        const validRotation = restrictedTiles[3].validRotations[0];
        const toBeTopLeft = getTileByNumber(tiles, restrictedTiles[3].number);
        const { tile, right, down } = arrangeTileToTopLeft(toBeTopLeft, validRotation);
        const topLeft = tile;

        console.log(`Adjusted top-left tile: ${JSON.stringify(tile, null, 4)}`);

        let visited = new Set();
        visited.add(topLeft.number);

        let toVisit = [
            right, 
            down,
        ];

        const sideSize = Math.floor(Math.sqrt(tiles.length));
        let tileGrid = [];
        for (let i = 0; i < sideSize; i++) {
            let newLine = [];
            for (let j = 0; j < sideSize; j++) {
                newLine.push(undefined);
            }
            tileGrid.push(newLine);
        }

        tileGrid[0][0] = topLeft;

        while (toVisit.length > 0) {
            let currentTileNumber = toVisit.shift();
            console.log(`   Visiting tile number ${currentTileNumber}`);
            let currTile = Object.assign({}, getTileByNumber(tiles, currentTileNumber));

            let currNeighborInfo = neighbors.get(currentTileNumber);
            let currValidNeighbors = getDistinctNeighbors(currNeighborInfo.rotations);

            let validPositions = getValidPositionsInGrid(tileGrid, currValidNeighbors);
            let fitFound = false;
            for (let i = 0; i < validPositions.length; i++) {
                const currPos = validPositions[i];
                console.log(`       Trying to fit tile ${currentTileNumber} at pos ${JSON.stringify(currPos)}`);
                let adjustedTile = adjustTileToFitGrid(currTile, currPos, tileGrid,  currValidNeighbors);

                if (adjustedTile !== undefined) {
                    fitFound = true;
                    tileGrid[currPos.x][currPos.y] = adjustedTile;
                    console.log(`       Managed to fit tile ${currentTileNumber} at pos ${JSON.stringify(currPos)}`);
                    break;
                }
            }
            
            if (fitFound) {
                visited.add(currentTileNumber);
                // Add new tiles to visit
                for (let neighbor of currValidNeighbors) {
                    if (!visited.has(neighbor)) {
                        toVisit.push(neighbor);
                    }
                }
            }
        }
        

        return "some image here";
    };

    const findSeaMonters = image => {
        // might have to rotate or flip the image!
        return { image: image, seaMonsterTiles: -1 };
    }

    const secondPart = (tiles, neighbors, restrictedTiles) => {
        const image = createImage(tiles, neighbors, restrictedTiles);
        const { newImage, seaMonsterTiles } = findSeaMonters(image);

        const nonSeaMonsterHashes = -1;

        return nonSeaMonsterHashes;
    }

    const printTiles = tiles => {
        console.log('Tile numbers:');
        console.log('-------------');
        console.log('');

        console.log(`   ${tiles[0].number}      ${tiles[1].number}      ${tiles[2].number}`);
        console.log('');
        console.log(`   ${tiles[3].number}      ${tiles[4].number}      ${tiles[5].number}`);
        console.log('');
        console.log(`   ${tiles[6].number}      ${tiles[7].number}      ${tiles[8].number}`);
        console.log('');
        console.log('');
        console.log('Tile lines:');
        console.log('-------------');
        console.log('');

        for (let i = 0; i < 3; i++) {
            let firstTile = i * 3;
            for (let j = 0; j < 10; j++) {
                const tileLine = tiles[firstTile].lines[j] + '      ' + tiles[firstTile + 1].lines[j] + '       ' + tiles[firstTile + 2].lines[j];
                console.log(`   ${tileLine}`);
            }

            console.log('');
            console.log('');
        }
    };

    const tiles = parseInputs(inputs);
    const neighbors = getPossibleNeighbors(tiles);
    printBadTiles(neighbors);
    const restrictedTiles = getRestrictedTiles(neighbors);
    printRestrictedTiles(restrictedTiles);
    //printTiles(tiles);
    
    return {
        firstPart: firstPart(restrictedTiles),
        secondPart: secondPart(tiles, neighbors, restrictedTiles),
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