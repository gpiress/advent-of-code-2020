const readline = require('readline');
const fs = require('fs');


// add solution code
const solve = inputs => {
    const parseInputs = inputs => {
        let playerOneDeck = [];
        let i = 1;
        while (inputs[i].trim() !== '') {
            playerOneDeck.push( +(inputs[i].trim()) );
            i++;
        }

        let playerTwoDeck = [];
        i++;
        i++;
        while (inputs[i].trim() !== '') {
            playerTwoDeck.push( +(inputs[i].trim()) );
            i++;

            if (i >= inputs.length) {
                break;
            }
        }
        
        return {
            playerOneDeck,
            playerTwoDeck
        };
    };

    const round = (playerOneDeck, playerTwoDeck) => {
        let playerOneDeckCopy = [...playerOneDeck];
        let playerTwoDeckCopy = [...playerTwoDeck];
        //console.log(`Player 1's deck: ${playerOneDeckCopy}`);
        //console.log(`Player 2's deck: ${playerTwoDeckCopy}`);

        const topOneCard = playerOneDeckCopy.shift();
        const topTwoCard = playerTwoDeckCopy.shift();

        //console.log(`Player 1 plays: ${topOneCard}`);
        //console.log(`Player 2 plays: ${topTwoCard}`);

        if (topOneCard > topTwoCard) {
            //console.log('Player 1 wins the round!');
            playerOneDeckCopy.push(topOneCard);
            playerOneDeckCopy.push(topTwoCard);
        } else {
            //console.log('Player 2 wins the round!');
            playerTwoDeckCopy.push(topTwoCard);
            playerTwoDeckCopy.push(topOneCard);
        }

        const gameEnded = (playerOneDeckCopy.length === 0 || playerTwoDeckCopy.length === 0);

        return {
            playerOneDeck: playerOneDeckCopy,
            playerTwoDeck: playerTwoDeckCopy,
            gameEnded: gameEnded,
        };
    };

    const computeScores = playerDeck => {
        if (playerDeck.length === 0) {
            return 0;
        }

        let score = 0;
        for (let i = playerDeck.length - 1; i >= 0; i--) {
            score += (playerDeck[i] * (playerDeck.length - i));
        }

        return score;
    };

    const simulateGame = (playerOneDeck, playerTwoDeck) => {
        let i = 1;

        //console.log(`-- Round ${i} --`);
        let roundResults = round(playerOneDeck, playerTwoDeck);
    
        let newPlayerOneDeck = roundResults.playerOneDeck;
        let newPlayerTwoDeck = roundResults.playerTwoDeck;
        let gameEnded = roundResults.gameEnded;
        i++;
        while (!gameEnded) {
            //console.log('');
            //console.log(`-- Round ${i} --`);
            
            roundResults = round(newPlayerOneDeck, newPlayerTwoDeck);
            newPlayerOneDeck = roundResults.playerOneDeck;
            newPlayerTwoDeck = roundResults.playerTwoDeck;
            gameEnded = roundResults.gameEnded;
            i++;
        }

        // Post game
        const playerOneScore = computeScores(newPlayerOneDeck);
        const playerTwoScore = computeScores(newPlayerTwoDeck);
        //console.log('');
        //console.log('');
        //console.log('== Post-game results ==');
        //console.log(`Player 1's deck: ${newPlayerOneDeck}`);
        //console.log(`Player 2's deck: ${newPlayerTwoDeck}`);
        //console.log(`Player 1's score: ${playerOneScore}`);
        //console.log(`Player 2's score: ${playerTwoScore}`);

        return {
            playerOneScore,
            playerTwoScore,
        };
    };

    // playsPerGame is a map of <int, Set<Round>>
    let playsPerGame = new Map();
    let lastGamePlayed = 1;

    const hasRoundBeenPlayed = (gameNumber, playerOneDeck, playerTwoDeck) => {
        if (!playsPerGame.has(gameNumber)) {
            return false;
        }

        const currentPlayString = JSON.stringify({ playerOneDeck: playerOneDeck, playerTwoDeck: playerTwoDeck });
        const previousPlays = playsPerGame.get(gameNumber);

        return previousPlays.has(currentPlayString);
    };

    const updatePlaysPerGame = (gameNumber, playerOneDeck, playerTwoDeck) => {
        /*
        //console.log(`Updating playes per game for game ${gameNumber} with:`);
        //console.log(`   Player one deck - ${playerOneDeck}`);
        //console.log(`   Player two deck - ${playerTwoDeck}`);
        */
        const newEntry = {
            playerOneDeck: [...playerOneDeck],
            playerTwoDeck: [...playerTwoDeck],
        };
        const newEntryString = JSON.stringify(newEntry);

        if (!playsPerGame.has(gameNumber)) {
            let plays = new Set();
            plays.add(newEntryString);
            playsPerGame.set(gameNumber, plays);
        } else {
            let existingPlays = playsPerGame.get(gameNumber);
            existingPlays.add(newEntryString);
            playsPerGame.set(gameNumber, existingPlays);
        }
    };

    const recursiveRound = (playerOneDeck, playerTwoDeck, roundNumber, gameNumber) => {
        //console.log('');
        //console.log(`-- Round ${roundNumber} (Game ${gameNumber}) --`);

        let playerOneDeckCopy = [...playerOneDeck];
        let playerTwoDeckCopy = [...playerTwoDeck];
        //console.log(`Player 1's deck: ${playerOneDeckCopy}`);
        //console.log(`Player 2's deck: ${playerTwoDeckCopy}`);

        // Rule 1: If the same round has been played in the SAME game before, player 1 wins the round
        // Check if this game had the same round before
        if (hasRoundBeenPlayed(gameNumber, playerOneDeckCopy, playerTwoDeckCopy)) {
            //console.log('Round has been played before.');
            //console.log('Player 1 wins the GAME!');

            return {
                playerOneDeck: playerOneDeckCopy,
                playerTwoDeck: playerTwoDeckCopy,
                score: computeScores(playerOneDeckCopy),
                gameEnded: true,
            };
        } else {
            updatePlaysPerGame(gameNumber, playerOneDeckCopy, playerTwoDeckCopy);
        }

        const topOneCard = playerOneDeckCopy.shift();
        const topTwoCard = playerTwoDeckCopy.shift();

        //console.log(`Player 1 plays: ${topOneCard}`);
        //console.log(`Player 2 plays: ${topTwoCard}`);

        // Rule 2: If both players have at least as many cards remaining in
        // their deck as the value of the card they just drew, play a new
        // game with a subset of cards
        if ((playerOneDeckCopy.length >= topOneCard) && (playerTwoDeckCopy.length >= topTwoCard)) {
            
            let smallerPlayerOneDeck = playerOneDeckCopy.filter((value, index) => index < topOneCard);
            let smallerPlayerTwoDeck = playerTwoDeckCopy.filter((value, index) => index < topTwoCard);

            lastGamePlayed++;
            let innerGameNumber = lastGamePlayed;
            //console.log(`Starting game ${innerGameNumber} to decide!`);

            let innerRound = 1;
            let innerGameEnded = false;
            let innerGame;

            while (!innerGameEnded) {
                innerGame = recursiveRound(smallerPlayerOneDeck, smallerPlayerTwoDeck, innerRound, innerGameNumber);
                innerGameEnded = innerGame.gameEnded;
                smallerPlayerOneDeck = innerGame.playerOneDeck;
                smallerPlayerTwoDeck = innerGame.playerTwoDeck;

                innerRound++;
            }

            if (smallerPlayerOneDeck.length > 0) {
                //console.log(`Player 1 wins inner game ${innerGameNumber} and the round!`);
                playerOneDeckCopy.push(topOneCard);
                playerOneDeckCopy.push(topTwoCard);
            } else {
                //console.log(`Player 1 wins inner game ${innerGameNumber} and the round!`);
                playerTwoDeckCopy.push(topTwoCard);
                playerTwoDeckCopy.push(topOneCard);
            }
        } else {
            if (topOneCard > topTwoCard) {
                //console.log('Player 1 wins the round!');
                playerOneDeckCopy.push(topOneCard);
                playerOneDeckCopy.push(topTwoCard);
            } else {
                //console.log('Player 2 wins the round!');
                playerTwoDeckCopy.push(topTwoCard);
                playerTwoDeckCopy.push(topOneCard);
            }
        }

        const gameEnded = (playerOneDeckCopy.length === 0 || playerTwoDeckCopy.length === 0);

        let winningScore = computeScores(playerOneDeckCopy);
        if (gameEnded && winningScore === 0) {
            winningScore = computeScores(playerTwoDeckCopy);
        }

        return {
            playerOneDeck: playerOneDeckCopy,
            playerTwoDeck: playerTwoDeckCopy,
            score: winningScore,
            gameEnded: gameEnded,
        };
    };

    const simulateRecursiveCombat = (playerOneDeck, playerTwoDeck) => {
        let newPlayerOneDeck = [...playerOneDeck];
        let newPlayerTwoDeck = [...playerTwoDeck];
        let gameEnded = false;

        let score;
        let round = 1;
        while (!gameEnded) {    
            let roundResults = recursiveRound(newPlayerOneDeck, newPlayerTwoDeck, round, 1);
            newPlayerOneDeck = roundResults.playerOneDeck;
            newPlayerTwoDeck = roundResults.playerTwoDeck;
            gameEnded = roundResults.gameEnded;
            score = roundResults.score;

            round++;
        }

        // Post game
        //console.log('');
        //console.log('');
        //console.log('== Post-game results ==');
        //console.log(`Player 1's deck: ${newPlayerOneDeck}`);
        //console.log(`Player 2's deck: ${newPlayerTwoDeck}`);
        //console.log(`Winner score: ${score}`);

        return {
            score: score,
        };
    }

    const { playerOneDeck, playerTwoDeck } = parseInputs(inputs);

    //const { playerOneScore, playerTwoScore } = simulateGame(playerOneDeck, playerTwoDeck);
    const { score } = simulateRecursiveCombat(playerOneDeck, playerTwoDeck);
    
    return {
        //firstPart: playerOneScore > 0 ? playerOneScore : playerTwoScore,
        firstPart: -1,
        secondPart: score,
    };
}


let inputs = [];
const processLine = line => {
    inputs.push(line);
};

const computeResults = () => {
    const result = solve(inputs);
    //console.log(`First part: ${result.firstPart}`);
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