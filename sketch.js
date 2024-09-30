let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Collision = Matter.Collision,
    engine;

let midpointX, midpointY, backgroundColour;

let placingCueBall = true,
    potRedBallNow = true,
    potColouredBallNow = false;

function setup() {
    createCanvas(1000, 600);
    rectMode(CENTER);
    angleMode(DEGREES);
    textAlign(CENTER);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    engine = Engine.create();
    engine.world.gravity.y = 0;
    engine.positionIterations = 12; //changable: default = 6, higher = better game interaction
    engine.velocityIterations = 8; //changable: default = 4, higher = better game interaction
    midpointX = width / 2;
    midpointY = height / 2;
    backgroundColour = color(20);
    //table.js and balls.js
    setupTable();
    setupBalls();
}

function draw() {
    Engine.update(engine);
    //table.js and balls.js
    drawTable();
    drawBalls();
    //ui.js
    setupUI();
    drawUI();
}

//----- helper functions (used in other .js files too) -----//
function drawVertices(vertices) {
    beginShape();
    for (let i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

function defaultStrokeSettings() {
    stroke(0);
    strokeWeight(1);
}

function defaultTextSize() {
    textSize(12);
}

//----- user inputs -----//
function mousePressed() {
    if (mouseButton === LEFT) {
        if (foulTime || glitchTime) {
            foulTime = false;
            glitchTime = false;
            loop();
            placingCueBall = true;
        } else if (placingCueBall) {
            Body.setVelocity(cueBall, { x: 0, y: 0 });
            placingCueBall = false;
        } else if (ballStopped(cueBall)) {
            shootingCueStick = true;
        }
    }
}

function keyPressed() {
    //for all 3 keys
    if (keyCode == 49 || keyCode == 50 || keyCode == 51) {
        World.clear(engine.world, true);
        placingCueBall = true;
        defaultBooleansAndValues();
    }
    //1 = default
    if (keyCode == 49) {
        setupBalls();
    }
    //2 = random red only || 3 = random all
    if (keyCode == 50 || keyCode == 51) {
        setupBalls(keyCode);
    }
}

function defaultBooleansAndValues() {
    placingCueBall = true;
    potRedBallNow = true;
    potColouredBallNow = false;
    delaying = false;
    ballScore = 0;
    respawning = false;
    shootingCueStick = false;
    foulTime = false;
    glitchTime = false;
    respawnColouredBallRandomly = false;
    collidedWith = {
        text: "nothing yet...",
        textColour: 255,
    };
}

/*
----- SUBMISSION COMMENTARY -----
For my snooker game design, I decided on using the mouse to control the cue stick, its
power level, and the mouse’s left click to shoot the cue ball. This was the simplest and
most straightforward method I thought of when testing different methods on myself.

For the directional aim, it was between keyboard presses and mouse cursor. Upon thinking
further about the keyboard, how much should the direction change with each key press?
What if the player wanted a tiny adjustment but each key press was too much? Or, the
other way round? I thought about making the player hold ‘SHIFT’ and the corresponding
directional keys to make the aim more precise. Such controls seem intuitive for someone
familiar with online gaming, but may be tough for someone who is unfamiliar. Thus, I
decided on the mouse cursor for the inexperienced.

For the power level, I knew it had to be related to the distance between the cue stick and
ball somehow. Initially, I thought about press-and-holding to decide the power level, and
then releasing to shoot. But how fast or precise should the power level change while
holding? Once again, there were too many scenarios. Thus, I decided on the mouse
cursor’s distance from the cue ball, which also gives the player 100% control.

With that, I also had to constrain the distance of the cursor to the cue ball. This is especially
important for when the cue ball is at the very top edge of the table and the player wants to
shoot downwards with full power - there would be very little space there compared to when
the cue ball is at the lower side of the table.

For shooting, when everything has already been using the mouse cursor, mouse clicking
just made sense. I also ensured it to be left click only, as the right and middle clicks are
used by the computer itself.

Moving on to my extension, I added the table’s cushion edges, cue stick and guideline as
they are a huge part of games like pool and snooker. Without cushion edges, the table
loses some functionality, and the overall game is limited, as some strategies are carried out
using the cushion’s slanted angles next to the pockets. Furthermore, the overall aesthetics
will look and feel lacking.

I also took inspiration from playing snooker phone games to decide when the coloured ball
should respawn and when the cue stick should show up.
(408 words)

----- RESOURCES AND MEASUREMENTS -----
https://en.wikipedia.org/wiki/Snooker
https://en.wikipedia.org/wiki/Rules_of_snooker
https://www.youtube.com/watch?v=CjSWUTkupQo
https://docs.google.com/drawings/d/1ebL6Cc_jvcbJE_2mRL3MYaeflGWvaclOIit-6tObUO0/edit?usp=sharing

table length            = 144"
table width             = 72"
wooden edge thickness   = 2"            rgb(74,33,6)
cushion edge thickness  = 2"            rgb(0,100,0)
playable area           = ~136" by ~64" rgb(34,139,34)

white line              = 29" from LHS cushion   OR   33" of table length
white semicircle radius = 11.5"

cushion length
- L/R                   = 64"
- top/bottom L/R        = 66.5"

ball diameter           = 2"
pot diameter            = 3"

----- COLOURED BALLS INFORMATION -----
in order of setup:
green   3 points    rgb(50, 183, 50)     top    of white line touching semicircle
brown   4 points    rgb(124, 83, 56)     middle of white line
yellow  2 points    rgb(233, 233, 32)    bottom of white line touching semicircle
blue    5 points    rgb(56, 56, 255)     exact center of table
pink    6 points    rgb(237, 120, 178)   exact center of blue and RHS cushion
red     1 point     rgb(183, 0, 0)       tip of red is behind and not touching pink
black   7 points    rgb(20, 20, 20) 2     12.8" from RHS cushion   OR   125.2" of table length
- remember to +1" to get to center of black

----- GAMEPLAY -----
1. pot red ball
2. +1 point, and that red ball is gone
3. now allowed to pot any coloured ball
4. pot coloured ball
5. + respective points, and coloured ball goes back to initial position
6. repeat from step 1 till pot last red and coloured ball
7. after potting last red and coloured, must pot coloured balls in ascending order; Y, G, Bro, Blu, P, Blk
8. fouling will reset all balls into the position before shooting
bonus: max points achievable = 147 points
*/
