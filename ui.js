let force = {
    basePower: 0,
    factor: {
        min: 1,
        max: (tableLength / tableWidth) * 10, //outputs to 20
    },
    dist: {
        min: ballRadius * 1.5,
        max: tableWidth / 4,
    },
};

let cueStick = {
        thickness: ballRadius,
        len: tableWidth * 0.8,
        tip: {
            x: 0,
            y: 0,
        },
        movement: {
            x: 0,
            y: 0,
        },
        toCueBall: {
            x: 0,
            y: 0,
        },
    },
    shootingCueStick = false;

let guideLine = {};

let foulTime = false,
    glitchTime = false;

let collidedWith = {
    text: "nothing yet...",
    textColour: 255,
};

function setupUI() {
    force.basePower = map(ballRadius, 5, 16, 0.0001, 0.004);
    setupCueStick();
    setupGuideLine();
}

function drawUI() {
    if (!placingCueBall && ballStopped(cueBall)) {
        drawCueStick();
        drawGuideLine();
    }
    drawTexts();
    if (redBalls.length == 0 && Object.keys(colouredBalls).length == 0) {
        drawEndGameText();
    }
}

function setupCueStick() {
    cueStick.toCueBall.x = cueBall.position.x - mouseX;
    cueStick.toCueBall.y = cueBall.position.y - mouseY;
    cueStick.x = cueBall.position.x - cueStick.toCueBall.x;
    cueStick.y = cueBall.position.y - cueStick.toCueBall.y;
    cueStick.toCueBallDist = dist(cueStick.x, cueStick.y, cueBall.position.x, cueBall.position.y);
    cueStick.toCueBallDistConstrained = constrain(cueStick.toCueBallDist, force.dist.min, force.dist.max);
    cueStick.toCueBallVec = createVector(cueStick.toCueBall.x, cueStick.toCueBall.y);
    cueStick.toCueBallNorm = cueStick.toCueBallVec.normalize();
    cueStick.tip.x = cueBall.position.x - cueStick.toCueBallDistConstrained * cueStick.toCueBallNorm.x + cueStick.movement.x;
    cueStick.tip.y = cueBall.position.y - cueStick.toCueBallDistConstrained * cueStick.toCueBallNorm.y + cueStick.movement.y;
    cueStick.tip.toCueBallDist = dist(cueStick.tip.x, cueStick.tip.y, cueBall.position.x, cueBall.position.y);
}

function drawCueStick() {
    //dark brown
    noFill();
    stroke(124, 83, 56);
    strokeWeight(cueStick.thickness);
    line(
        //format
        cueStick.tip.x,
        cueStick.tip.y,
        cueStick.tip.x - cueStick.len * cueStick.toCueBallNorm.x,
        cueStick.tip.y - cueStick.len * cueStick.toCueBallNorm.y
    );
    //light brown
    stroke(224, 183, 156);
    line(
        //format
        cueStick.tip.x,
        cueStick.tip.y,
        cueStick.tip.x - cueStick.len * 0.65 * cueStick.toCueBallNorm.x,
        cueStick.tip.y - cueStick.len * 0.65 * cueStick.toCueBallNorm.y
    );
    //tip
    fill(255);
    defaultStrokeSettings();
    ellipse(
        //format
        cueStick.tip.x,
        cueStick.tip.y,
        cueStick.thickness
    );
    animateCueStick();
}

function animateCueStick() {
    //if shooting, then move cueStick towards cueBall
    if (shootingCueStick) {
        cueStick.movement.factor = map(cueStick.toCueBallDistConstrained, force.dist.min, force.dist.max, force.factor.min / 100, force.factor.max);
        cueStick.movement.x += cueStick.movement.factor * cueStick.toCueBallNorm.x;
        cueStick.movement.y += cueStick.movement.factor * cueStick.toCueBallNorm.y;
        //if cueStick touches cueBall, then applyForce on cueBall
        if (cueStick.tip.toCueBallDist < ballRadius * 1.5) {
            Body.applyForce(
                //input params: body, position, force
                cueBall,
                cueBall.position,
                {
                    x: cueStick.movement.factor * force.basePower * cueStick.toCueBallNorm.x,
                    y: cueStick.movement.factor * force.basePower * cueStick.toCueBallNorm.y,
                }
            );
            //if cueStick "hits" cueBall and cueBall has stopped, then restart cueStick position
            if (ballStopped(cueBall)) {
                shootingCueStick = false;
                cueStick.movement.x = 0;
                cueStick.movement.y = 0;
            }
        }
    }
    //if (force.basePower too large and) cueStick gets shot outside canvas, then glitched
    if (outOfBounds(cueStick.tip)) {
        glitchTime = true;
        glitchSequence();
        noLoop();
    }
}

function setupGuideLine() {
    guideLine = {
        x1: cueBall.position.x + ballDiameter * cueStick.toCueBallNorm.x,
        y1: cueBall.position.y + ballDiameter * cueStick.toCueBallNorm.y,
        x2: cueBall.position.x + cueStick.toCueBallDistConstrained * 2 * cueStick.toCueBallNorm.x,
        y2: cueBall.position.y + cueStick.toCueBallDistConstrained * 2 * cueStick.toCueBallNorm.y,
    };
    guideLine.dist = dist(cueBall.position.x, cueBall.position.y, guideLine.x2, guideLine.y2);
    guideLine.distMapped = map(guideLine.dist, force.dist.min, force.dist.max * 2, 100, 0);
}

function drawGuideLine() {
    //transculent line
    noFill();
    stroke(255, 50);
    strokeWeight(ballDiameter);
    line(
        //format
        guideLine.x1,
        guideLine.y1,
        cueBall.position.x + width * cueStick.toCueBallNorm.x,
        cueBall.position.y + width * cueStick.toCueBallNorm.y
    );
    //coloured line
    colorMode(HSB);
    stroke(guideLine.distMapped, 100, 100, 0.4);
    colorMode(RGB);
    strokeWeight(ballDiameter);
    line(guideLine.x1, guideLine.y1, guideLine.x2, guideLine.y2);
}

function drawTexts() {
    drawTextScoreAndGuide();
    drawTextCollidedWith();
    drawTextGameMode();
    //reset to default
    defaultStrokeSettings();
    defaultTextSize();
}

function drawTextScoreAndGuide() {
    //score text
    let textScoreY = midpointY - tableWidth / 2 - (midpointY - tableWidth / 2) / 2;
    fill(255);
    noStroke();
    textSize(24);
    text("Score: " + ballScore, midpointX, textScoreY);
    //guide text
    textSize(18);
    let textGuideY = textScoreY + textSize() * 1.5;
    if (placingCueBall) {
        text("Left click to place cue ball within 'D' line", midpointX, textGuideY);
    } else {
        let potWhatBallNow;
        if (potRedBallNow) {
            potWhatBallNow = "red";
        }
        if (potColouredBallNow) {
            potWhatBallNow = "coloured";
        }
        text("Ball to pot: " + potWhatBallNow, midpointX, textGuideY);
    }
}

function drawTextCollidedWith() {
    //collision detection text (for point 9)
    let withCushion = cueBallCollidingWith(cushionEdges),
        withColouredBall = cueBallCollidingWith(colouredBalls),
        withRedBall = cueBallCollidingWith(redBalls);
    if (!placingCueBall) {
        if (withCushion) {
            collidedWith = withCushion;
        } else if (withColouredBall) {
            collidedWith = withColouredBall;
        } else if (withRedBall) {
            collidedWith = withRedBall;
        }
    }
    let textCollidedWithX = midpointX + tableWidth,
        textCollidedWithY = midpointY + tableWidth / 2 + textSize() * 1.5;
    fill(255);
    noStroke();
    textAlign(RIGHT);
    textSize(18);
    text("Cue ball collided with:", textCollidedWithX, textCollidedWithY);
    //have to use colouredBallsStored as colouredBalls is removed when potted
    fill(collidedWith.textColour);
    text("\n" + collidedWith.text, textCollidedWithX, textCollidedWithY);
    textAlign(CENTER);
}

function cueBallCollidingWith(arrayBody) {
    //with cushion or red balls
    if (arrayBody == cushionEdges || arrayBody == redBalls) {
        for (let i = 0; i < arrayBody.length; i++) {
            if (Collision.collides(cueBall, arrayBody[i])) {
                if (arrayBody == cushionEdges) {
                    return {
                        text: cushionEdgesNames[i] + " edge",
                        textColour: color(0, 100, 0),
                    };
                } else {
                    return {
                        text: "red ball",
                        textColour: color(183, 0, 0),
                    };
                }
            }
        }
        //with coloured balls
    } else if (arrayBody == colouredBalls) {
        for (let colouredBall in arrayBody) {
            if (Collision.collides(cueBall, arrayBody[colouredBall].body)) {
                if (arrayBody[colouredBall] == colouredBalls.black) {
                    return {
                        text: colouredBall + " ball",
                        textColour: color(255),
                    };
                } else {
                    return {
                        text: colouredBall + " ball",
                        textColour: arrayBody[colouredBall].colour,
                    };
                }
            }
        }
    }
}

function drawTextGameMode() {
    //game mode text
    let textGameModeX = midpointX - tableWidth,
        textGameModeY = midpointY + tableWidth / 2 + textSize() * 1.5;
    fill(255);
    noStroke();
    textAlign(LEFT);
    text("1: Normal snooker game\n2: Red balls are random\n3: Every ball is random", textGameModeX, textGameModeY);
    fill(50, 180, 50);
    //1 = default and normal
    if (keyCode == 49 || !keyCode) {
        text("1: Normal snooker game\n\n", textGameModeX, textGameModeY);
    }
    //2 = random red only
    if (keyCode == 50) {
        text("\n2: Red balls are random\n", textGameModeX, textGameModeY);
    }
    //3 = random all
    if (keyCode == 51) {
        text("\n\n3: Every ball is random", textGameModeX, textGameModeY);
    }
    textAlign(CENTER);
}

function drawEndGameText() {
    fill(255);
    noStroke();
    textSize(30);
    text("Game is done!", midpointX, midpointY);
}

//----- helper functions (used in other .js files too) -----//
function foulSequence() {
    let bigSize = tableWidth / 4,
        mediumSize = bigSize / 2,
        smallSize = mediumSize / 2;
    //main text
    fill(255);
    stroke(0);
    strokeWeight(smallSize);
    textSize(bigSize);
    text("Foul!", midpointX, midpointY);
    //sub text
    strokeWeight(smallSize / 2);
    textSize(mediumSize);
    text("\n(left click to continue)", midpointX, midpointY + textSize());
    //reset to default
    defaultTextSize();
}

function glitchSequence() {
    let bigSize = tableWidth / 8,
        mediumSize = bigSize / 2,
        smallSize = mediumSize / 2;
    //main text
    fill(255);
    stroke(0);
    strokeWeight(smallSize);
    textSize(bigSize);
    text("Ball went out of bounds!", midpointX, midpointY);
    //sub text
    strokeWeight(smallSize / 2);
    textSize(mediumSize);
    text("\nplease adjust 'force.basePower' in ui.js\n(left click twice to continue)", midpointX, midpointY + textSize());
    //reset to default
    defaultTextSize();
}
