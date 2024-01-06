// @ts-check
import Vector from "./vector.js";
import Shape from "./shape.js";

/** @typedef {0 | 1 | 2 | 3} Rotation */

const rows = 20;
const columns = 10;
const updateIntervalStart = 500;
const updateIntervalDecrease = 50;
const updateIntervalUpdateTime = 30;
const updateIntervalMinimum = 100;
/** @type {Shape[]} */
const shapes = [
    Shape.from(0, 0, 1, 0, 2, 0, 3, 0), // I
    Shape.from(0, 0, 0, 1, 1, 0, 1, 1), // O
    Shape.from(0, 0, 0, 1, 0, 2, 1, 1), // T
    Shape.from(0, 0, 1, 0, 1, 1, 1, 2), // J
    Shape.from(0, 0, 0, 1, 1, 1, 2, 1), // L
    Shape.from(0, 1, 0, 2, 1, 0, 1, 1), // S
    Shape.from(0, 1, 1, 0, 1, 1, 2, 0), // Z
];

const shapeColors = [
    "red",
    "yellow",
    "#0f0",
    "cyan",
    "blue",
    "orange",
    "magenta",
];

/** @type {{init: (rows: number, columns: number) => void, display: (grid: (String | undefined)[][]) => void}} */
let displayScript;
/** @type {(String | undefined)[][]} */
let grid;
/** @type {Vector} */
let currentTopLeft;
/** @type {Rotation} */
let currentRotation;
/** @type {String} */
let currentColor;
/** @type {Shape} */
let currentShape;
/** @type {Number} */
let currentUpdateInterval;
/** @type {boolean} */
let updateIntervalChanged;
/** @type {Number | undefined} */
let updateTimer;
/** @type {Number | undefined} */
let gameloopTimer;

/**
 * @param {Vector} topLeft
 * @param {Rotation} rotation
 * @param {Shape} shape
 */
function isAvailable(topLeft, rotation, shape) {
    for (const point of shape.transformPoints(rotation)) {
        const worldPoint = topLeft.add(point);
        if (
            worldPoint.i < 0 ||
            worldPoint.i >= rows ||
            worldPoint.j < 0 ||
            worldPoint.j >= columns ||
            grid[worldPoint.i][worldPoint.j]
        )
            return false;
    }
    return true;
}

function applyCurrentToGrid() {
    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = currentTopLeft.add(point);
        grid[worldPoint.i][worldPoint.j] = currentColor;
    }
}

function generateNewShape() {
    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentColor = shapeColors[Math.floor(Math.random() * shapeColors.length)];
    currentTopLeft = new Vector(
        0,
        Math.floor(Math.random() * (columns - currentShape.width))
    );
    currentRotation = 0;
}

function clearFloor() {
    let moveCnt = 0;
    for (let i = rows - 1; i >= 0; i--) {
        if (grid[i].every((e) => e)) {
            moveCnt++;
            continue;
        }
        for (let j = 0; j < columns; j++) grid[i + moveCnt][j] = grid[i][j];
    }
    for (let i = 0; i < moveCnt; i++) grid[i].fill(undefined);
}

function gameOver() {
    console.log("Game Over");
    init();
}

function init() {
    grid = [];
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < columns; j++) {
            grid[i][j] = undefined;
        }
    }
    displayScript.init(rows, columns);

    clearInterval(updateTimer);
    clearInterval(gameloopTimer);
    currentUpdateInterval = updateIntervalStart;
    updateIntervalChanged = false;

    generateNewShape();
    display();

    gameloopTimer = setInterval(gameLoop, currentUpdateInterval);
    updateTimer = setInterval(
        updateInterval,
        updateIntervalUpdateTime * 1000
    );
}

function display() {
    let groundTopLeft = currentTopLeft;
    while (
        isAvailable(groundTopLeft.addNum(1, 0), currentRotation, currentShape)
    )
        groundTopLeft = groundTopLeft.addNum(1, 0);
    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = groundTopLeft.add(point);
        grid[worldPoint.i][worldPoint.j] = "hollow " + currentColor;
    }
    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = currentTopLeft.add(point);
        grid[worldPoint.i][worldPoint.j] = currentColor;
    }

    displayScript.display(grid);

    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = groundTopLeft.add(point);
        grid[worldPoint.i][worldPoint.j] = undefined;
    }
    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = currentTopLeft.add(point);
        grid[worldPoint.i][worldPoint.j] = undefined;
    }
}

/**
 * @param {number} i
 * @param {number} j
 * @param {number} rot
 */
function moveAndRotate(i, j, rot) {
    const newTopLeft = currentTopLeft.addNum(i, j);
    /** @ts-ignore @type {Rotation} */
    const newRotation = (4 + currentRotation + rot) % 4;
    if (isAvailable(newTopLeft, newRotation, currentShape)) {
        currentTopLeft = newTopLeft;
        currentRotation = newRotation;
    }
}

const keyToOperations = {
    "a": () => moveAndRotate(0, -1, 0),
    "d": () => moveAndRotate(0, 1, 0),
    "s": () => moveAndRotate(1, 0, 0),
    " ": () => {
        let newTopLeft = currentTopLeft;
        while (
            isAvailable(newTopLeft.addNum(1, 0), currentRotation, currentShape)
        )
            newTopLeft = newTopLeft.addNum(1, 0);
        currentTopLeft = newTopLeft;
    },
    "q": () => moveAndRotate(0, 0, -1),
    "e": () => moveAndRotate(0, 0, 1),
};

/** @param {KeyboardEvent} evt */
function onKeyDown(evt) {
    keyToOperations[evt.key]?.();
    display();
}

function updateInterval() {
    currentUpdateInterval = Math.max(
        updateIntervalMinimum,
        currentUpdateInterval - updateIntervalDecrease
    );
    updateIntervalChanged = true;
    console.log("Game has gone faster: " + currentUpdateInterval);
}

function adjustToNewInterval() {
    if (!updateIntervalChanged) return;
    clearInterval(gameloopTimer);
    gameloopTimer = setInterval(gameLoop, currentUpdateInterval);
    updateIntervalChanged = false;
}

function gameLoop() {
    const newTopLeft = currentTopLeft.addNum(1, 0);
    if (isAvailable(newTopLeft, currentRotation, currentShape)) {
        currentTopLeft = newTopLeft;
        display();
        adjustToNewInterval();
        return;
    }
    applyCurrentToGrid();
    clearFloor();
    generateNewShape();
    if (!isAvailable(currentTopLeft, currentRotation, currentShape)) {
        gameOver();
        return;
    }
    display();
    adjustToNewInterval();
}

/**
 * @param {string} newEngine
 */
async function onRenderEngineChanged(newEngine) {
    console.log(newEngine);
    displayScript = await import("./" + newEngine + ".js");
    init();
}

document.getElementById("render")?.addEventListener(
    'change',
    function () {
        // @ts-ignore
        onRenderEngineChanged(this.value ?? "html");
    }
)
await onRenderEngineChanged("html");

init();
window.addEventListener("keydown", onKeyDown);
