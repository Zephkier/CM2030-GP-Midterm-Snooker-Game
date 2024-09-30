let ballSettings = { restitution: 1 },
    ballDiameter = (potDiameter / 3) * 2,
    ballRadius = ballDiameter / 2;

let cueBall;

let colouredBalls,
    colouredBallsStored = {},
    respawnColouredBallRandomly = false;

let redBalls;

let speedThreshold = 0.04; //changable: default = 0.04, this determines cue ball's speed in which player can shoot again

let delaying = false,
    ballScore = 0,
    respawning = false,
    respawnKey;

function setupBalls(gameMode) {
    setupCueBall();
    respawnColouredBallRandomly = false;
    if (gameMode == 49 || !gameMode) {
        setupColouredBalls();
        setupRedBalls();
    } else if (gameMode == 50) {
        setupColouredBalls();
        setupRedBalls(1, 1);
    } else if (gameMode == 51) {
        setupColouredBalls(1, 1);
        setupRedBalls(1, 1);
        respawnColouredBallRandomly = true;
    }
}

function drawBalls() {
    if (placingCueBall) {
        cueBall.isSensor = true;
        mouseX = constrain(mouseX, whiteLine.x - whiteLine.semiCircleRadius, whiteLine.x);
        mouseY = constrain(mouseY, midpointY - whiteLine.semiCircleRadius + ballDiameter, midpointY + whiteLine.semiCircleRadius - ballDiameter);
        drawCueBall(mouseX, mouseY);
    } else {
        cueBall.isSensor = false;
        drawCueBall();
    }
    drawColouredBalls();
    drawRedBalls();
    ballGameplay();
}

function setupCueBall() {
    cueBall = Bodies.circle(
        //format
        midpointX - tableWidth / 2 - ballDiameter * 6,
        midpointY,
        ballRadius,
        ballSettings
    );
    World.add(engine.world, [cueBall]);
}

function drawCueBall(x, y) {
    fill(255);
    defaultStrokeSettings();
    if (x && y) {
        Body.setPosition(cueBall, { x: x, y: y });
    }
    drawVertices(cueBall.vertices);
}

function setupColouredBalls(x, y) {
    if (x && y) {
        colouredBalls = {
            green: {
                colour: color(80, 183, 80),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 3,
            },
            brown: {
                colour: color(124, 83, 56),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 4,
            },
            yellow: {
                colour: color(233, 233, 32),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 2,
            },
            blue: {
                colour: color(56, 56, 255),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 5,
            },
            pink: {
                colour: color(237, 120, 178),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 6,
            },
            black: {
                colour: color(20),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 7,
            },
        };
    } else {
        //if editing colouredBalls object, then copy-paste to colouredBallsStored, it is the easiest method to hard-copy an objects (unfortunately)
        //find the comment 'paste here!' (there is only 1 others in this .js file)
        colouredBalls = {
            green: {
                colour: color(80, 183, 80),
                body: Bodies.circle(whiteLine.x, midpointY - whiteLine.semiCircleRadius, ballRadius, ballSettings),
                score: 3,
            },
            brown: {
                colour: color(124, 83, 56),
                body: Bodies.circle(whiteLine.x, midpointY, ballRadius, ballSettings),
                score: 4,
            },
            yellow: {
                colour: color(233, 233, 32),
                body: Bodies.circle(whiteLine.x, midpointY + whiteLine.semiCircleRadius, ballRadius, ballSettings),
                score: 2,
            },
            blue: {
                colour: color(56, 56, 255),
                body: Bodies.circle(midpointX, midpointY, ballRadius, ballSettings),
                score: 5,
            },
            pink: {
                colour: color(237, 120, 178),
                body: Bodies.circle(midpointX + (tableWidth - totalEdgeThickness) / 2, midpointY, ballRadius, ballSettings),
                score: 6,
            },
            black: {
                colour: color(20),
                body: Bodies.circle(midpointX + tableWidth - totalEdgeThickness - (tableLength / 144) * 13.8, midpointY, ballRadius, ballSettings),
                score: 7,
            },
        };
    }
    for (let colouredBall in colouredBalls) {
        if (x && y) {
            x = random(midpointX - tableWidth + totalEdgeThickness + ballDiameter, midpointX + tableWidth - totalEdgeThickness - ballDiameter);
            y = random(midpointY - tableWidth / 2 + totalEdgeThickness + ballDiameter, midpointY + tableWidth / 2 - totalEdgeThickness - ballDiameter);
            Body.setPosition(colouredBalls[colouredBall].body, { x: x, y: y });
        }
        World.add(engine.world, [colouredBalls[colouredBall].body]);
    }
}

function drawColouredBalls() {
    for (let colouredBall in colouredBalls) {
        fill(colouredBalls[colouredBall].colour);
        defaultStrokeSettings();
        drawVertices(colouredBalls[colouredBall].body.vertices);
    }
}

function setupRedBalls(x, y) {
    redBalls = [];
    let redBall;
    let numberOfColumns = 5;
    if (x && y) {
        for (let columns = 0; columns < numberOfColumns; columns++) {
            for (let ballPerColumn = 0; ballPerColumn <= columns; ballPerColumn++) {
                x = random(midpointX - tableWidth + totalEdgeThickness + ballDiameter, midpointX + tableWidth - totalEdgeThickness - ballDiameter);
                y = random(midpointY - tableWidth / 2 + totalEdgeThickness + ballDiameter, midpointY + tableWidth / 2 - totalEdgeThickness - ballDiameter);
                redBall = Bodies.circle(x, y, ballRadius, ballSettings);
                redBalls.push(redBall);
            }
        }
    } else {
        for (let columns = 0; columns < numberOfColumns; columns++) {
            for (let ballPerColumn = 0; ballPerColumn <= columns; ballPerColumn++) {
                let pinkBallX = midpointX + (tableWidth - totalEdgeThickness) / 2,
                    distanceFromPinkBall = ballDiameter * 1.25,
                    initialX = pinkBallX + distanceFromPinkBall,
                    x = initialX + columns * ballDiameter,
                    subsequentY = ballPerColumn * ballDiameter + (numberOfColumns - columns - 1) * ballRadius,
                    offsetY = ballDiameter * 2,
                    y = midpointY + subsequentY - offsetY;
                redBall = Bodies.circle(x, y, ballRadius, ballSettings);
                redBalls.push(redBall);
            }
        }
    }

    World.add(engine.world, redBalls);
}

function drawRedBalls() {
    for (i = 0; i < redBalls.length; i++) {
        fill(183, 0, 0);
        defaultStrokeSettings();
        drawVertices(redBalls[i].vertices);
    }
}

function ballGameplay() {
    //potting balls
    for (let i = 0; i < pots.length; i++) {
        //potting cue ball
        if (pots[i].isSensor && ballWithinPot(cueBall, pots[i]) && !delaying) {
            //remove
            World.remove(engine.world, [cueBall]);
            //respawn
            delaying = true;
            if (delaying) {
                setTimeout(function () {
                    setupCueBall();
                    placingCueBall = true;
                    delaying = false;
                }, 500);
            }
        }
        //potting coloured balls
        for (let colouredBall in colouredBalls) {
            if (pots[i].isSensor && ballWithinPot(colouredBalls[colouredBall].body, pots[i])) {
                if (potColouredBallNow) {
                    ballScore += colouredBalls[colouredBall].score;
                    potRedBallNow = true;
                    potColouredBallNow = false;
                } else {
                    foulTime = true;
                    foulSequence();
                    noLoop();
                }
                if (redBalls.length == 0) {
                    //remove
                    World.remove(engine.world, [colouredBalls[colouredBall].body]);
                    delete colouredBalls[colouredBall];
                } else {
                    //remove
                    World.remove(engine.world, [colouredBalls[colouredBall].body]);
                    delete colouredBalls[colouredBall];
                    //respawn
                    respawning = true;
                    if (respawning) {
                        respawnKey = colouredBall;
                    }
                }
            }
        }
        //potting red balls
        for (let j = 0; j < redBalls.length; j++) {
            if (pots[i].isSensor && ballWithinPot(redBalls[j], pots[i])) {
                if (potRedBallNow) {
                    ballScore += 1;
                    potRedBallNow = false;
                    potColouredBallNow = true;
                } else {
                    foulTime = true;
                    foulSequence();
                    noLoop();
                }
                //remove
                World.remove(engine.world, redBalls[j]);
                //remove
                redBalls.splice(j, 1);
                j -= 1;
            }
        }
    }
    //if cue ball stopped, then respawn coloured ball and stop other balls
    if (ballStopped(cueBall)) {
        if (respawning) {
            respawnColouredBall(respawnKey);
        }
        for (let colouredBall in colouredBalls) {
            ballStopped(colouredBalls[colouredBall].body);
        }
        for (let i = 0; i < redBalls.length; i++) {
            ballStopped(redBalls[i]);
        }
    }
    //if no more red balls, then forcefully set flags
    if (redBalls.length == 0) {
        potColouredBallNow = true;
        potRedBallNow = false;
    }
    //if (force.basePower too large and) cue ball gets shot outside canvas, then glitched
    if (outOfBounds(cueBall.position)) {
        glitchTime = true;
        glitchSequence();
        noLoop();
    }
}

//----- helper functions (used in other .js files too) -----//
function ballWithinPot(ballBody, potBody) {
    let distance = dist(ballBody.position.x, ballBody.position.y, potBody.position.x, potBody.position.y);
    return distance < potRadius;
}

function ballStopped(ballBody) {
    if (ballBody.speed < speedThreshold) {
        Body.setVelocity(ballBody, { x: 0, y: 0 });
    }
    if (ballBody.speed == 0) {
        return true;
    }
}

function respawnColouredBall(key) {
    //setup
    let x, y;
    if (respawnColouredBallRandomly) {
        x = random(midpointX - tableWidth + totalEdgeThickness + ballDiameter, midpointX + tableWidth - totalEdgeThickness - ballDiameter);
        y = random(midpointY - tableWidth / 2 + totalEdgeThickness + ballDiameter, midpointY + tableWidth / 2 - totalEdgeThickness - ballDiameter);
        colouredBallsStored = {
            green: {
                colour: color(80, 183, 80),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 3,
            },
            brown: {
                colour: color(124, 83, 56),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 4,
            },
            yellow: {
                colour: color(233, 233, 32),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 2,
            },
            blue: {
                colour: color(56, 56, 255),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 5,
            },
            pink: {
                colour: color(237, 120, 178),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 6,
            },
            black: {
                colour: color(20),
                body: Bodies.circle(x, y, ballRadius, ballSettings),
                score: 7,
            },
        };
    } else {
        //paste here!
        colouredBallsStored = {
            green: {
                colour: color(80, 183, 80),
                body: Bodies.circle(midpointX - tableWidth + totalEdgeThickness + ballDiameter, midpointY - tableWidth / 2 + totalEdgeThickness + ballDiameter, ballRadius, ballSettings),
                score: 3,
            },
            brown: {
                colour: color(124, 83, 56),
                body: Bodies.circle(whiteLine.x, midpointY, ballRadius, ballSettings),
                score: 4,
            },
            yellow: {
                colour: color(233, 233, 32),
                body: Bodies.circle(whiteLine.x, midpointY + whiteLine.semiCircleRadius, ballRadius, ballSettings),
                score: 2,
            },
            blue: {
                colour: color(56, 56, 255),
                body: Bodies.circle(midpointX, midpointY, ballRadius, ballSettings),
                score: 5,
            },
            pink: {
                colour: color(237, 120, 178),
                body: Bodies.circle(midpointX + (tableWidth - totalEdgeThickness) / 2, midpointY, ballRadius, ballSettings),
                score: 6,
            },
            black: {
                colour: color(20),
                body: Bodies.circle(midpointX + tableWidth - totalEdgeThickness - (tableLength / 144) * 13.8, midpointY, ballRadius, ballSettings),
                score: 7,
            },
        };
    }
    //setup
    colouredBalls[key] = {
        colour: colouredBallsStored[key].colour,
        body: colouredBallsStored[key].body,
        score: colouredBallsStored[key].score,
    };
    World.add(engine.world, [colouredBalls[key].body]);
    //draw
    fill(colouredBalls[key].colour);
    defaultStrokeSettings();
    drawVertices(colouredBalls[key].body.vertices);
    respawning = false;
}

function outOfBounds(bodyPosition) {
    if (bodyPosition.x < 0 || bodyPosition.x > width || bodyPosition.y < 0 || bodyPosition.y > height) {
        return true;
    }
}
