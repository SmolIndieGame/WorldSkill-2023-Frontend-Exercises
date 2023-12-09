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
        return new Vector((rows + this.i + i) % rows, (columns + this.j + j) % columns);
    }

    /**
     * @param {Vector} other
     */
    add(other) {
        return new Vector((rows + this.i + other.i) % rows, (columns + this.j + other.j) % columns);
    }
}

/** @typedef {"up" | "left" | "right" | "down"} Rotation */

class Shape {
    /**
     * @param {Number} height
     * @param {Number} width
     * @param {Vector[]} points
     * @param {String} color
     */
    constructor(height, width, points, color) {
        this.height = height;
        this.width = width;
        this.points = points;
        this.color = color;
        /** @type {Vector} */
        this.topLeft = new Vector(0, 0);
        /** @type {Rotation} */
        this.rotation = "up";
    }

    copy() {
        return new Shape(this.height, this.width, this.points, this.color);
    }

    /**
     * @param {Rotation} rotation 
     * @returns {Vector[]}
     */
    transform(rotation) {
        switch (rotation) {
            case "up":
                return this.points.map(point => new Vector(point.i, point.j));
            case "left":
                return this.points.map(point => new Vector(point.j, this.width - point.i));
            case "down":
                return this.points.map(point => new Vector(this.height - point.i, this.width - point.j));
            case "right":
                return this.points.map(point => new Vector(this.height - point.j, point.i));
        }
    }
}

const rows = 20;
const columns = 15;
const updateInterval = 500;
/** @type {Shape[]} */
const shapes = [
    new Shape(
        2,
        3,
        [
            new Vector(0, 1),
            new Vector(1, 0),
            new Vector(1, 1),
            new Vector(1, 2),
        ],
        "#333",
    ),
];

/** @type {HTMLElement[][]} */
let displayGrid = [];
/** @type {(String | undefined)[][]} */
let grid = [];
/** @type {Vector} */
let currentTopLeft;
/** @type {Rotation} */
let currentRotation;
/** @type {Shape} */
let currentShape;

/** @param {Vector} cellPos */
function isBlock(cellPos) {
    return !!grid[cellPos.i][cellPos.j];
}

/** @param {Vector} cellPos  @param {String | undefined} block */
function setBlock(cellPos, block) {
    grid[cellPos.i][cellPos.j] = block ? block : undefined;
}


/** @param {Vector} topLeft  @param {Shape} shape */
function canMoveTo(topLeft, shape) {
    for (const point of shape.points) {
        const worldPoint = topLeft.add(point);
        if (worldPoint.i < 0 || worldPoint.i >= rows || worldPoint.j < 0 || worldPoint.j >= columns || isBlock(worldPoint))
            return false;
    }
    return true;
}

/** @param {Vector} topLeft @param {Shape} shape @param {1 | -1} rotation @returns {boolean} */
function canRotateTo(topLeft, shape, rotation) {
    if (rotation !== 1 && rotation !== -1) return true;
    for (const point of shape.points) {
        const localPoint = rotation === -1 ? new Vector(shape.height - point.j, point.i) : new Vector(point.j, shape.width - point.i);
        const worldPoint = topLeft.add(localPoint);
        if (worldPoint.i < 0 || worldPoint.i >= rows || worldPoint.j < 0 || worldPoint.j >= columns || isBlock(worldPoint))
            return false;
    }
    return true;
}

/**
 * @param {Vector} topLeft
 * @param {Shape} shape
 * @param {boolean} set
 * @param {Rotation} rotation
 */
function setShape(shape, set) {
    for (const point of shape.transform(shape.rotation))
        setBlock(shape.topLeft.add(point), set ? shape.color : undefined);
}

/** @param {Vector} topLeft @param {Shape} shape @param {1 | -1} rotation */
function rotateTo(topLeft, shape, rotation) {
    if (rotation !== 1 && rotation !== -1) return;
    for (const point of shape.points) {
        const localPoint = rotation === -1 ? new Vector(shape.height - point.j, point.i) : new Vector(point.j, shape.width - point.i);
        setBlock(topLeft.add(localPoint), shape.color);
    }
}

function setNewShape() {
    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentTopLeft = new Vector(0, Math.floor(Math.random() * (columns - currentShape.width)));
}

function clearFloor() {

}

function gameOver() {
    console.log("Game Over");
    init();
}

function init() {
    const container = document.querySelector(".container");
    if (container === null || !(container instanceof HTMLElement)) return;
    container.innerHTML = "";
    container.style.setProperty("--rows", rows.toString());
    container.style.setProperty("--columns", columns.toString());
    displayGrid = [];
    grid = [];
    for (let i = 0; i < rows; i++) {
        displayGrid[i] = [];
        grid[i] = [];
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement("div");
            // @ts-ignore
            cell.classList = "cell empty-cell";
            container.appendChild(cell);
            displayGrid[i][j] = cell;
            grid[i][j] = undefined;
        }
    }

    setNewShape();
    moveShapeTo(currentTopLeft, currentTopLeft, currentShape);
    display();
}

function display() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            // @ts-ignore
            displayGrid[i][j].classList = grid[i][j] ? "cell block-cell" : "cell empty-cell";
            if (grid[i][j])
                displayGrid[i][j].style.setProperty("--color", grid[i][j] ?? "")
        }
    }
}

const keyToOperations = {
    a: () => {
        const newTopLeft = currentTopLeft.addNum(0, -1);
        if (canMoveTo(newTopLeft, currentShape))
            moveShapeTo(currentTopLeft, newTopLeft, currentShape);
    },
    d: () => {
        const newTopLeft = currentTopLeft.addNum(0, 1);
        if (canMoveTo(newTopLeft, currentShape))
            moveShapeTo(currentTopLeft, newTopLeft, currentShape);
    },
    ' ': () => {
        // TODO
    },
    q: () => {
        if (canRotateTo(currentTopLeft, currentShape, -1))
            rotateTo(currentTopLeft, currentShape, -1)
    },
    e: () => {
        if (canRotateTo(currentTopLeft, currentShape, 1))
            rotateTo(currentTopLeft, currentShape, 1)
    }
}

/** @param {KeyboardEvent} evt */
function onKeyDown(evt) {
    keyToOperations[evt.key]?.();
    display();
}

function onTouchDown() {

}

function gameLoop() {
    const newTopLeft = currentTopLeft.addNum(1, 0);
    if (canMoveTo(newTopLeft, currentShape)) {
        moveShapeTo(currentTopLeft, newTopLeft, currentShape);
        currentTopLeft = newTopLeft;
        return;
    }
    clearFloor();
    setNewShape();
    if (!canMoveTo(currentTopLeft, currentShape)) {
        gameOver();
        return;
    }

    moveShapeTo(currentTopLeft, currentTopLeft, currentShape);
    display();
}

init();
window.addEventListener('keydown', onKeyDown);
setInterval(gameLoop, updateInterval);