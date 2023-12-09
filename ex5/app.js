// @ts-check

class Vector {
    /**
     * @param {number} i
     * @param {number} j
     */
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    toCellId() {
        return `cell ${this.i} ${this.j}`;
    }

    /**
     * @param {{ i: any; j: any; }} other
     */
    equal(other) {
        if (!other) return false;
        return other.i === this.i && other.j === this.j;
    }

    /**
     * @param {number} i
     * @param {number} j
     */
    addNum(i, j) {
        return new Vector(this.i + i, this.j + j);
    }

    /**
     * @param {Vector} other
     */
    add(other) {
        return new Vector(this.i + other.i, this.j + other.j);
    }
}

/** @typedef {0 | 1 | 2 | 3} Rotation */

class Shape {
    /**
     * @param {Number} height
     * @param {Number} width
     * @param {Vector[]} points
     */
    constructor(height, width, points) {
        this.height = height;
        this.width = width;
        this.points = points;
    }

    /**
     * @param {Rotation} rotation
     * @returns {Vector[]}
     */
    transformPoints(rotation) {
        switch (rotation) {
            case 0:
                return this.points.map((point) => new Vector(point.i, point.j));
            case 1:
                return this.points.map(
                    (point) => new Vector(point.j, this.width - point.i - 1)
                );
            case 2:
                return this.points.map(
                    (point) =>
                        new Vector(
                            this.height - point.i - 1,
                            this.width - point.j - 1
                        )
                );
            case 3:
                return this.points.map(
                    (point) => new Vector(this.height - point.j, point.i)
                );
        }
    }
}

const rows = 20;
const columns = 10;
const updateIntervalStart = 500;
const updateIntervalDecrease = 50;
const updateIntervalUpdateTime = 30;
const updateIntervalMinimum = 100;
/** @type {Shape[]} */
const shapes = [
    // I
    new Shape(4, 1, [
        new Vector(0, 0),
        new Vector(1, 0),
        new Vector(2, 0),
        new Vector(3, 0),
    ]),
    // O
    new Shape(2, 2, [
        new Vector(0, 0),
        new Vector(0, 1),
        new Vector(1, 0),
        new Vector(1, 1),
    ]),
    // T
    new Shape(2, 3, [
        new Vector(0, 0),
        new Vector(0, 1),
        new Vector(0, 2),
        new Vector(1, 1),
    ]),
    // J
    new Shape(2, 3, [
        new Vector(0, 0),
        new Vector(1, 0),
        new Vector(1, 1),
        new Vector(1, 2),
    ]),
    // L
    new Shape(3, 2, [
        new Vector(0, 0),
        new Vector(0, 1),
        new Vector(1, 1),
        new Vector(2, 1),
    ]),
    // S
    new Shape(2, 3, [
        new Vector(0, 1),
        new Vector(0, 2),
        new Vector(1, 0),
        new Vector(1, 1),
    ]),
    // Z
    new Shape(3, 2, [
        new Vector(0, 1),
        new Vector(1, 0),
        new Vector(1, 1),
        new Vector(2, 0),
    ]),
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

/** @type {HTMLElement[][]} */
let displayGrid;
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
/** @type {Number | undefined} */
let intervalListener;
/** @type {Number | undefined} */
let timeoutListener;

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
    const container = document.querySelector(".container");
    if (container === null || !(container instanceof HTMLElement)) return;
    container.innerHTML = "";
    container.style.setProperty("--rows", (rows + 2).toString());
    container.style.setProperty("--columns", (columns + 2).toString());
    displayGrid = [];
    grid = [];
    for (let i = 0; i < rows + 2; i++) {
        if (i > 0 && i <= rows) {
            displayGrid[i - 1] = [];
            grid[i - 1] = [];
        }
        for (let j = 0; j < columns + 2; j++) {
            const cell = document.createElement("div");
            if (i <= 0 || i > rows || j <= 0 || j > columns) {
                cell.classList.value = "cell block-cell";
                cell.style.setProperty("--color", "#777");
                container.appendChild(cell);
                continue;
            }
            cell.classList.value = "cell";
            container.appendChild(cell);
            displayGrid[i - 1][j - 1] = cell;
            grid[i - 1][j - 1] = undefined;
        }
    }

    clearInterval(intervalListener);
    clearTimeout(timeoutListener);
    currentUpdateInterval = updateIntervalStart;

    generateNewShape();
    display();

    timeoutListener = setTimeout(gameLoop, currentUpdateInterval);
    intervalListener = setInterval(
        updateInterval,
        updateIntervalUpdateTime * 1000
    );
}

function display() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            displayGrid[i][j].classList.value = "cell";
            if (!grid[i][j]) continue;
            displayGrid[i][j].classList.add("block-cell");
            displayGrid[i][j].style.setProperty("--color", grid[i][j] ?? "");
        }
    }

    let groundTopLeft = currentTopLeft;
    while (
        isAvailable(groundTopLeft.addNum(1, 0), currentRotation, currentShape)
    )
        groundTopLeft = groundTopLeft.addNum(1, 0);
    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = groundTopLeft.add(point);
        const element = displayGrid[worldPoint.i][worldPoint.j];
        element.classList.value = "cell hollow-cell";
        element.style.setProperty("--color", currentColor);
    }

    for (const point of currentShape.transformPoints(currentRotation)) {
        const worldPoint = currentTopLeft.add(point);
        const element = displayGrid[worldPoint.i][worldPoint.j];
        element.classList.value = "cell block-cell";
        element.style.setProperty("--color", currentColor);
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
    console.log(currentUpdateInterval);
}

function gameLoop() {
    const newTopLeft = currentTopLeft.addNum(1, 0);
    if (isAvailable(newTopLeft, currentRotation, currentShape)) {
        currentTopLeft = newTopLeft;
        display();
        setTimeout(gameLoop, currentUpdateInterval);
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
    setTimeout(gameLoop, currentUpdateInterval);
}

window.addEventListener("keydown", onKeyDown);
init();
