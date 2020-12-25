const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    const parseInputs = inputs => {
        const parseInput = input => {
            if (input === '') {
                return undefined;
            }

            let x = 0;
            let y = 0;

            for (let i = 0; i < input.length; i++) {
                if (input[i] === 's') {
                    x--;
                    if (input[i + 1] === 'e') {
                        y++;
                        i++;
                    } else if (input[i + 1] === 'w') {
                        y--;
                        i++;
                    }
                } else if (input[i] === 'n') {
                    x++;
                    if (input[i + 1] === 'e') {
                        y++;
                        i++;
                    } else if (input[i + 1] === 'w') {
                        y--;
                        i++;
                    }
                } else if (input[i] === 'e') {
                    y += 2;
                } else if (input[i] === 'w') {
                    y -= 2;
                }
            }

            //console.log(`   New tile at [${x}, ${y}]`);

            return { x, y, color: 'white' };
        };

        const tileDirections = inputs.map(parseInput).filter(direction => direction !== undefined);
        return tileDirections;
    };

    const goOverTiles = tileDirections => {
        let flippedTiles = new Set();

        for (let tile of tileDirections) {
            const tileHash = `x=${tile.x};y=${tile.y}`;
            if (flippedTiles.has(tileHash)) {
                flippedTiles.delete(tileHash);
                tile.color = 'white';
            } else {
                flippedTiles.add(tileHash);
                tile.color = 'black';
            }
        }

        return {
            tiles: tileDirections,
            blackTiles: flippedTiles,
        };
    };
    
    const getTileNeighbours = (tiles, x, y) => {
        const findNeighbour = (tiles, x, y) => {
            const maybeNeighbour = tiles.filter(tile => (tile.x === x && tile.y === y));

            if (maybeNeighbour.length > 0) {
                return maybeNeighbour[0];
            }

            const newTile = { x: x, y: y, color: 'white' };
            tiles.push(newTile);
            return newTile;
        };

        let tilesCopy = tiles.map(tile => Object.assign({}, tile));
        let neighbours = [
            findNeighbour(tilesCopy, x - 1, y - 1),
            findNeighbour(tilesCopy, x + 1, y - 1),
            findNeighbour(tilesCopy, x, y - 2),
            findNeighbour(tilesCopy, x, y + 2),
            findNeighbour(tilesCopy, x - 1, y + 1),
            findNeighbour(tilesCopy, x + 1, y + 1),
        ];

        return { newTiles: tilesCopy, neighbours: neighbours };
    }

    const dailyFlip = (tiles, blackTiles, allTiles) => {
        let tilesCopy = tiles.map(tile => Object.assign({}, tile));
        let blackTilesCopy = new Set(blackTiles);
        let allTilesCopy = new Set(allTiles);

        let newNeighbours = [];

        for (let tile of tiles) {
            const tileHash = `x=${tile.x};y=${tile.y}`;
            let tileCopy = tilesCopy.filter(t => (t.x === tile.x && t.y === tile.y))[0];

            let { newTiles, neighbours } = getTileNeighbours(tiles, tile.x, tile.y);

            if (tile.x === 0 && tile.y === 2) {
                console.log(JSON.stringify(neighbours, undefined, 4));
            }

            const neighboursBlack = neighbours.filter(neighbour => neighbour.color === 'black');
            //const neighboursWhite = neighbours.filter(neighbour => neighbour.color === 'white');

            if (tileCopy.color === 'black' && (newTiles.length > tiles.length)) {
            //if (newTiles.length > tiles.length) {
                neighbours.filter(n => {
                        const neighborHash = `x=${n.x};y=${n.y}`;
                        return !allTilesCopy.has(neighborHash);
                    }).forEach(newNeighbour => {
                        const neighborHash = `x=${newNeighbour.x};y=${newNeighbour.y}`;
                        newNeighbours.push(newNeighbour);
                        allTilesCopy.add(neighborHash);
                    });
            }

            if (tile.color === 'white' && neighboursBlack.length === 2) {
                blackTilesCopy.add(tileHash);
                tileCopy.color = 'black';
            }

            if ((tile.color === 'black' && neighboursBlack.length === 0) 
                || (tile.color === 'black' && neighboursBlack.length > 2)) {
                //console.log(`   Flipping tile [${tile.x}, ${tile.y}] to white`);
                blackTilesCopy.delete(tileHash);
                tileCopy.color = 'white';
            }
        }

        let added = 0;
        for (let tile of newNeighbours) {
            let tileCopy = Object.assign({}, tile);
            const tileHash = `x=${tile.x};y=${tile.y}`;
            //console.log(`   Adding new neighbour ${tileHash}`);

            const { neighbours } = getTileNeighbours(tiles, tile.x, tile.y);
            const neighboursBlack = neighbours.filter(neighbour => neighbour.color === 'black');

            if (neighboursBlack.length === 2) {
                blackTilesCopy.add(tileHash);
                tileCopy.color = 'black';

                //console.log(`   New tile [${tile.x}, ${tile.y}] is flipping to black.`);
                //console.log(`   Neighbours: ${JSON.stringify(neighboursBlack, undefined, 4)}`);

                tilesCopy.push(tileCopy);
                added++;
            }
        }
        //console.log(`   Adding ${added} new neighbours`);

        return {
            tiles: tilesCopy,
            blackTiles: blackTilesCopy,
            allTiles, allTilesCopy,
        };
    };

    const secondPart = (tiles, blackTiles) => {
        const TOTAL_DAYS = 2;
        let dailyTiles = tiles.map(tile => Object.assign({}, tile));
        let dailyBlackTiles = new Set(blackTiles);
        let allDailyTiles = new Set();

        dailyTiles.forEach(t => {
            const tileHash = `x=${t.x};y=${t.y}`;
            allDailyTiles.add(tileHash);
        });

        //console.log(JSON.stringify( Array.from(dailyBlackTiles), undefined, 4 ));

        let i = 1;
        while (i <= TOTAL_DAYS) {
            let dailyResult = dailyFlip(dailyTiles, dailyBlackTiles, allDailyTiles);
            dailyTiles = dailyResult.tiles;
            dailyBlackTiles = dailyResult.blackTiles;
            allDailyTiles = dailyResult.allTiles;

            console.log(`Day ${i}: ${dailyBlackTiles.size}`);
            i++;
        }

        return {
            dailyTiles: dailyTiles,
            dailyBlackTiles: dailyBlackTiles,
        };
    };

    const hashTile = tile => {
        return `x=${tile.x};y=${tile.y}`;
    };

    const tests = () => {
        const createTestObjects = tilesList => {
            let testTiles = tilesList.map(t => Object.assign({}, t));
            let testBlackTiles = new Set();
            let testAllTiles = new Set();

            testTiles.map(t => hashTile(t)).forEach(hashT => testAllTiles.add(hashT));
            testTiles.filter(t => t.color === 'black').map(t => hashTile(t)).forEach(hashT => testBlackTiles.add(hashT));

            return {
                testTiles, testBlackTiles, testAllTiles
            };
        };

        const testOneBlackTile = () => {
            // One black tile alone becomes white
            const oneBlackTileAlone = { x: 0, y: 0, color: 'black' };
            let { testTiles, testBlackTiles, testAllTiles } = createTestObjects([oneBlackTileAlone]);

            console.log('Testing single initial black tile after 1 day case:');
            const { tiles, blackTiles, allTiles } = dailyFlip(testTiles, testBlackTiles, testAllTiles);

            console.log('  Results:');
            console.log(`   Black tiles --- expected: 0, actual: ${blackTiles.size}`);
            console.log(`   All tiles --- expected: 1, actual: ${tiles.length}`);
            console.log(' ------ ');
        };

        const testBlackTilesGenerateNewNeighbour = () => {
            // Two black tiles next to each other stay black and create 2 new black tiles
            const oneBlackTile = { x: 0, y: 0, color: 'black' };
            const otherBlackTile = { x: 0, y: 2, color: 'black' };
            let { testTiles, testBlackTiles, testAllTiles } = createTestObjects([oneBlackTile, otherBlackTile]);

            console.log('Testing 2 neighbour black tiles after 1 day case:');
            const { tiles, blackTiles, allTiles } = dailyFlip(testTiles, testBlackTiles, testAllTiles);

            const newBlackTile = { x: 1, y: 1, color: 'black' };

            console.log('  Results:');
            console.log(`   Black tiles --- expected: 4, actual: ${blackTiles.size}`);
            console.log(`   All tiles --- expected: 4, actual: ${tiles.length}`);
            console.log(`   Tile [1, 1] black --- expected: true, actual: ${blackTiles.has(hashTile(newBlackTile))}`);
            console.log(`   Tile [0, 0] black --- expected: true, actual: ${blackTiles.has(hashTile(oneBlackTile))}`);
            console.log(' ------ ');
        };

        const testBlackTilesWithAGap_shouldBecomeWhite_andGenerateNewNeighbour = () => {
            // Two black tiles with a gap between will become white but create 1 black tiles
            const oneBlackTile = { x: 0, y: 0, color: 'black' };
            const otherBlackTile = { x: 0, y: 4, color: 'black' };
            let { testTiles, testBlackTiles, testAllTiles } = createTestObjects([oneBlackTile, otherBlackTile]);

            console.log('Testing 2  black tiles with a gap in between after 1 day case:');
            const { tiles, blackTiles, allTiles } = dailyFlip(testTiles, testBlackTiles, testAllTiles);

            const newBlackTile = { x: 0, y: 2, color: 'black' };

            console.log('  Results:');
            console.log(`   Black tiles --- expected: 1, actual: ${blackTiles.size}`);
            console.log(`   All tiles --- expected: 3, actual: ${tiles.length}`);
            console.log(`   Tile [1, 1] black --- expected: true, actual: ${blackTiles.has(hashTile(newBlackTile))}`);
            console.log(`   Tile [0, 0] black --- expected: true, actual: ${!blackTiles.has(hashTile(oneBlackTile))}`);
            console.log(' ------ ');
        };

        const testBlackTilesTriangle_shouldStayBlack_andGenerate3NewNeighbours = () => {
            const oneBlackTile = { x: 0, y: 0, color: 'black' };
            const otherBlackTile = { x: 1, y: 1, color: 'black' };
            const anotherBlackTile = { x: 0, y: 2, color: 'black' };
            let { testTiles, testBlackTiles, testAllTiles } = createTestObjects([oneBlackTile, otherBlackTile, anotherBlackTile]);

            console.log('Testing 3 black tiles triangle after 1 day case:');
            const { tiles, blackTiles, allTiles } = dailyFlip(testTiles, testBlackTiles, testAllTiles);

            const newBlackTile = { x: 1, y: -1, color: 'black' };

            //console.log(JSON.stringify(tiles, undefined, 4));

            console.log('  Results:');
            console.log(`   Black tiles --- expected: 6, actual: ${blackTiles.size}`);
            console.log(`   All tiles --- expected: 6, actual: ${tiles.length}`);
            console.log(`   Tile [1, -1] black --- expected: true, actual: ${blackTiles.has(hashTile(newBlackTile))}`);
            console.log(`   Tile [0, 0] black --- expected: true, actual: ${blackTiles.has(hashTile(oneBlackTile))}`);
            console.log(' ------ ');
        };

        const testBlackTilesDiamond_shouldPartiallyBecomeWhite_andGenerate4NewNeighbours = () => {
            const oneBlackTile = { x: 0, y: 0, color: 'black' };
            const otherBlackTile = { x: 1, y: 1, color: 'black' };
            const anotherBlackTile = { x: 0, y: 2, color: 'black' };
            const oneMoreBlackTile = { x: -1, y: 1, color: 'black' };
            let { testTiles, testBlackTiles, testAllTiles } = createTestObjects([oneBlackTile, otherBlackTile, anotherBlackTile, oneMoreBlackTile]);
            //console.log(`Test tiles: ${JSON.stringify(testTiles)}`);
            console.log('Testing black tiles diamond after 1 day case:');
            const { tiles, blackTiles, allTiles } = dailyFlip(testTiles, testBlackTiles, testAllTiles);

            const newBlackTile = { x: 1, y: -1, color: 'black' };

            console.log(JSON.stringify(tiles, undefined, 4));

            console.log('  Results:');
            console.log(`   Black tiles --- expected: 6, actual: ${blackTiles.size}`);
            console.log(`   All tiles --- expected: 8, actual: ${tiles.length}`);
            console.log(`   Tile [1, -1] black --- expected: true, actual: ${blackTiles.has(hashTile(newBlackTile))}`);
            console.log(`   Tile [0, 0] black --- expected: false, actual: ${blackTiles.has(hashTile(oneBlackTile))}`);
            console.log(`   Tile [0, 2] black --- expected: false, actual: ${blackTiles.has(hashTile(anotherBlackTile))}`);
            console.log(' ------ ');
        };
        
        console.log('');
        console.log(' == Tests == ');
        testOneBlackTile();
        testBlackTilesGenerateNewNeighbour();
        testBlackTilesWithAGap_shouldBecomeWhite_andGenerateNewNeighbour();
        testBlackTilesTriangle_shouldStayBlack_andGenerate3NewNeighbours();
        testBlackTilesDiamond_shouldPartiallyBecomeWhite_andGenerate4NewNeighbours();
    };

    const getBlackNeighboursCountByHash = (tileHash, blackTiles) => {
        const x = +tileHash.split(';')[0].split('=')[1];
        const y = +tileHash.split(';')[1].split('=')[1];

        //console.log(`       Checking tile at [${x}, ${y}]`);

        const neighboursHashes = [
            hashTile({ x: x, y: y - 2}),
            hashTile({ x: x, y: y + 2}),
            hashTile({ x: x - 1, y: y - 1}),
            hashTile({ x: x - 1, y: y + 1}),
            hashTile({ x: x + 1, y: y - 1}),
            hashTile({ x: x + 1, y: y + 1}),
        ];

        //console.log(`       Neighbours ${JSON.stringify(neighboursHashes)}`);

        const blackNeighboursCount = neighboursHashes.filter(hash => blackTiles.has(hash)).length;
        return { count: blackNeighboursCount, neighboursHashes };
    };

    const dailyFlipHashes = blackTiles => {
        let newBlackTiles = new Set(blackTiles);
        let newNeighboursHashes = new Set();

        //console.log(`   Starting with: ${JSON.stringify( Array.from(blackTiles) )}`);

        for (let tileHash of blackTiles) {
            const { count, neighboursHashes } = getBlackNeighboursCountByHash(tileHash, blackTiles);
            const shouldFlip = count === 0 || count > 2;
            if (shouldFlip) {
                //console.log(`   Tile ${tileHash} was black. Not anymore.`);
                newBlackTiles.delete(tileHash);
            }

            const newNeighbours = neighboursHashes.filter(hash => !blackTiles.has(hash));
            newNeighbours.forEach(hash => newNeighboursHashes.add(hash));
        }

        //console.log(' --- ');
        //console.log('Checking new neighbours');
        for (let tileHash of newNeighboursHashes) {
            const { count } = getBlackNeighboursCountByHash(tileHash, blackTiles);
            const shouldFlip = count === 2;
            if (shouldFlip) {
                //console.log(`   Tile ${tileHash} was white. Not anymore.`);
                newBlackTiles.add(tileHash);
            }
        }

        return newBlackTiles;
    };

    const secondPartHashes = blackTiles => {
        const TOTAL_DAYS = 100;
        let dailyBlackTiles = new Set(blackTiles);

        let i = 1;
        while (i <= TOTAL_DAYS) {
            dailyBlackTiles = dailyFlipHashes(dailyBlackTiles);
            console.log(`Day ${i}: ${dailyBlackTiles.size}`);
            i++;
        }

        return dailyBlackTiles.size;
    }

    /*
    tests();

    return {
        firstPart: -1,
        secondPart: -1,
    };
    */

    const tileDirections = parseInputs(inputs);
    const { tiles, blackTiles } = goOverTiles(tileDirections);
    //const { dailyTiles, dailyBlackTiles } = secondPart(tiles, blackTiles);
    
    return {
        firstPart: blackTiles.size,
        secondPart: secondPartHashes(blackTiles),
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