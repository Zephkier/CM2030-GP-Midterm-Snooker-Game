let edgeSettings = { isStatic: true, restitution: 0.8 },
    potSettings = { isSensor: true },
    tableLength = 850, //changable: default = 850, this scales every aspect of the table evenly
    tableWidth = tableLength / 2;

let emptySpaces = [];

let whiteLine = {
    x: 0,
    semiCircleRadius: 0,
};

let woodenEdges = [],
    woodenEdgeThickness = (tableLength / 144) * 2, //changable: default = * 2, smaller = harder, larger = easier, this scales inside the table only
    cushionEdges = [],
    cushionEdgesNames = [],
    cushionEdgeThickness = woodenEdgeThickness,
    totalEdgeThickness = woodenEdgeThickness + cushionEdgeThickness;

let potsBG = [],
    pots = [],
    potDiameter = (cushionEdgeThickness / 2) * 3,
    potRadius = potDiameter / 2;

function setupTable() {
    setupEmptySpaces(); //added 'emptySpaces' so that nothing can leave the table as cushion/wooden edges are not thick enough
    setupWhiteLines();
    setupCushionEdges();
    setupWoodenEdges();
    setupPots();
}

function drawTable() {
    drawTableBackground();
    drawEmptySpaces(); //added 'emptySpaces' so that nothing can leave the table as cushion/wooden edges are not thick enough
    drawWhiteLines();
    drawCushionEdges();
    drawWoodenEdges();
    drawPots();
}

function drawTableBackground() {
    fill(34, 139, 34);
    defaultStrokeSettings();
    rect(midpointX, midpointY, tableLength, tableWidth);
}

function setupEmptySpaces() {
    let emptySpace = {
        top: midpointY - tableWidth / 2,
        bottom: midpointY + tableWidth / 2,
        left: midpointX - tableWidth,
        right: midpointX + tableWidth,
    };
    emptySpaces.push(Bodies.rectangle(midpointX, emptySpace.top - emptySpace.top / 2, width, emptySpace.top, edgeSettings));
    emptySpaces.push(Bodies.rectangle(midpointX, emptySpace.bottom + emptySpace.top / 2, width, emptySpace.top, edgeSettings));
    emptySpaces.push(Bodies.rectangle(emptySpace.left - emptySpace.left / 2, midpointY, emptySpace.left, height, edgeSettings));
    emptySpaces.push(Bodies.rectangle(emptySpace.right + emptySpace.left / 2, midpointY, emptySpace.left, height, edgeSettings));
    World.add(engine.world, emptySpaces);
}

function drawEmptySpaces() {
    fill(backgroundColour);
    noStroke();
    for (let i = 0; i < emptySpaces.length; i++) {
        drawVertices(emptySpaces[i].vertices);
    }
}

function setupWhiteLines() {
    whiteLine.x = midpointX - tableWidth + (tableLength / 144) * 33;
    whiteLine.semiCircleRadius = (tableLength / 144) * 11.5;
}

function drawWhiteLines() {
    noFill();
    stroke(255);
    strokeWeight(1);
    line(whiteLine.x, midpointY - tableWidth / 2, whiteLine.x, midpointY + tableWidth / 2);
    beginShape();
    for (let i = 0; i <= 180; i++) {
        let x = whiteLine.x + cos(90 + i) * whiteLine.semiCircleRadius,
            y = midpointY + sin(90 + i) * whiteLine.semiCircleRadius;
        vertex(x, y);
    }
    endShape(CLOSE);
}

function setupCushionEdges() {
    cushionEdgesNames = [
        //format
        "top left",
        "top right",
        "bottom left",
        "bottom right",
        "left",
        "right",
    ];
    let offsetCorner = totalEdgeThickness + potDiameter,
        offsetMiddle = offsetCorner / 2,
        cushionEdgeVertices = [
            //top left
            [
                { x: midpointX - tableWidth, y: midpointY - tableWidth / 2 },
                { x: midpointX, y: midpointY - tableWidth / 2 },
                { x: midpointX - offsetMiddle, y: midpointY - tableWidth / 2 + totalEdgeThickness },
                { x: midpointX - tableWidth + offsetCorner, y: midpointY - tableWidth / 2 + totalEdgeThickness },
            ],
            //top right
            [
                { x: midpointX, y: midpointY - tableWidth / 2 },
                { x: midpointX + tableWidth, y: midpointY - tableWidth / 2 },
                { x: midpointX + tableWidth - offsetCorner, y: midpointY - tableWidth / 2 + totalEdgeThickness },
                { x: midpointX + offsetMiddle, y: midpointY - tableWidth / 2 + totalEdgeThickness },
            ],
            //bottom left
            [
                { x: midpointX - tableWidth + offsetCorner, y: midpointY + tableWidth / 2 - totalEdgeThickness },
                { x: midpointX - offsetMiddle, y: midpointY + tableWidth / 2 - totalEdgeThickness },
                { x: midpointX, y: midpointY + tableWidth / 2 },
                { x: midpointX - tableWidth, y: midpointY + tableWidth / 2 },
            ],
            //bottom right
            [
                { x: midpointX + offsetMiddle, y: midpointY + tableWidth / 2 - totalEdgeThickness },
                { x: midpointX + tableWidth - offsetCorner, y: midpointY + tableWidth / 2 - totalEdgeThickness },
                { x: midpointX + tableWidth, y: midpointY + tableWidth / 2 },
                { x: midpointX, y: midpointY + tableWidth / 2 },
            ],
            //left
            [
                { x: midpointX - tableWidth, y: midpointY - tableWidth / 2 },
                { x: midpointX - tableWidth + totalEdgeThickness, y: midpointY - tableWidth / 2 + offsetCorner },
                { x: midpointX - tableWidth + totalEdgeThickness, y: midpointY + tableWidth / 2 - offsetCorner },
                { x: midpointX - tableWidth, y: midpointY + tableWidth / 2 },
            ],
            //right
            [
                { x: midpointX + tableWidth - totalEdgeThickness, y: midpointY - tableWidth / 2 + offsetCorner },
                { x: midpointX + tableWidth, y: midpointY - tableWidth / 2 },
                { x: midpointX + tableWidth, y: midpointY + tableWidth / 2 },
                { x: midpointX + tableWidth - totalEdgeThickness, y: midpointY + tableWidth / 2 - offsetCorner },
            ],
        ];
    let cushionEdgeTopLeft = Bodies.fromVertices(midpointX - tableWidth / 2 + ballRadius, midpointY - tableWidth / 2 + totalEdgeThickness / 2, [cushionEdgeVertices[0]], edgeSettings),
        cushionEdgeTopRight = Bodies.fromVertices(midpointX + tableWidth / 2 - ballRadius, midpointY - tableWidth / 2 + totalEdgeThickness / 2, [cushionEdgeVertices[1]], edgeSettings),
        cushionEdgeBottomLeft = Bodies.fromVertices(midpointX - tableWidth / 2 + ballRadius, midpointY + tableWidth / 2 - totalEdgeThickness / 2, [cushionEdgeVertices[2]], edgeSettings),
        cushionEdgeBottomRight = Bodies.fromVertices(midpointX + tableWidth / 2 - ballRadius, midpointY + tableWidth / 2 - totalEdgeThickness / 2, [cushionEdgeVertices[3]], edgeSettings),
        cushionEdgeLeft = Bodies.fromVertices(midpointX - tableWidth + totalEdgeThickness / 2, midpointY, [cushionEdgeVertices[4]], edgeSettings),
        cushionEdgeRight = Bodies.fromVertices(midpointX + tableWidth - totalEdgeThickness / 2, midpointY, [cushionEdgeVertices[5]], edgeSettings);
    cushionEdges.push(cushionEdgeTopLeft, cushionEdgeTopRight, cushionEdgeBottomLeft, cushionEdgeBottomRight, cushionEdgeLeft, cushionEdgeRight);
    World.add(engine.world, cushionEdges);
}

function drawCushionEdges() {
    fill(0, 100, 0);
    defaultStrokeSettings();
    for (let i = 0; i < cushionEdges.length; i++) {
        drawVertices(cushionEdges[i].vertices);
    }
}

function setupWoodenEdges() {
    let woodenEdgeTop = Bodies.rectangle(midpointX, midpointY - tableWidth / 2 + woodenEdgeThickness / 2, tableLength, woodenEdgeThickness, edgeSettings),
        woodenEdgeBottom = Bodies.rectangle(midpointX, midpointY + tableWidth / 2 - woodenEdgeThickness / 2, tableLength, woodenEdgeThickness, edgeSettings),
        woodenEdgeLeft = Bodies.rectangle(midpointX - tableWidth + woodenEdgeThickness / 2, midpointY, woodenEdgeThickness, tableWidth, edgeSettings),
        woodenEdgeRight = Bodies.rectangle(midpointX + tableWidth - woodenEdgeThickness / 2, midpointY, woodenEdgeThickness, tableWidth, edgeSettings);
    woodenEdges.push(woodenEdgeTop, woodenEdgeBottom, woodenEdgeLeft, woodenEdgeRight);
    World.add(engine.world, woodenEdges);
}

function drawWoodenEdges() {
    fill(74, 33, 6);
    defaultStrokeSettings();
    for (let i = 0; i < woodenEdges.length; i++) {
        drawVertices(woodenEdges[i].vertices);
    }
}

function setupPots() {
    //pot background and pot itself
    let potBGSize = woodenEdgeThickness * 2;
    for (let rows = 0; rows < 2; rows++) {
        for (let columns = 0; columns < 3; columns++) {
            //set initial coords
            let initialX = midpointX - tableWidth,
                initialY = midpointY - tableWidth / 2;
            if (columns == 1) {
                //middle pots ARE centered on wooden edge
                let xBoth = initialX + columns * tableWidth;
                let yPotBG = initialY + woodenEdgeThickness / 2 + rows * (tableWidth - woodenEdgeThickness);
                let yPot = initialY + woodenEdgeThickness + rows * (tableWidth - woodenEdgeThickness * 2);
                let potBackground = Bodies.rectangle(xBoth, yPotBG, potBGSize, potBGSize / 2);
                let pot = Bodies.circle(xBoth, yPot, potRadius, potSettings);
                potsBG.push(potBackground);
                pots.push(pot);
            } else {
                //corner pots ARE NOT centered on wooden edge
                let xPotBG = initialX + woodenEdgeThickness + columns * (tableWidth - woodenEdgeThickness);
                let yPotBG = initialY + woodenEdgeThickness + rows * (tableWidth - woodenEdgeThickness * 2);
                let potMargin = woodenEdgeThickness + potDiameter / 2;
                let xPot = initialX + potMargin + columns * (tableWidth - potMargin);
                let yPot = initialY + potMargin + rows * (tableWidth - potMargin * 2);
                let potBackground = Bodies.rectangle(xPotBG, yPotBG, potBGSize, potBGSize);
                let pot = Bodies.circle(xPot, yPot, potRadius, potSettings);
                potsBG.push(potBackground);
                pots.push(pot);
            }
        }
    }
    //pot background is purely aesthetics, no need to add into World physics engine
    World.add(engine.world, pots);
}

function drawPots() {
    //pot background (yellow)
    fill(255, 215, 0);
    defaultStrokeSettings();
    for (let i = 0; i < potsBG.length; i++) {
        drawVertices(potsBG[i].vertices);
    }
    //pot itself
    fill(0);
    for (let i = 0; i < pots.length; i++) {
        drawVertices(pots[i].vertices);
    }
}
