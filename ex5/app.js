class Vector {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    toCellId() {
        return `cell ${this.i} ${this.j}`;
    }

    equal(other) {
        if (!other) return false;
        return other.i === this.i && other.j === this.j;
    }

    add(i, j) {
        return new Vector((rows + this.i + i) % rows, (columns + this.j + j) % columns);
    }

    add(other) {
        return new Vector((rows + this.i + other.i) % rows, (columns + this.j + other.j) % columns);
    }

    static fromCellId(str) {
        const strs = str.split(" ");
        return new Vector(Number.parseInt(strs[1]), Number.parseInt(strs[2]));
    }
}

/** @typedef  {{currentTopLeft: Vector}} GameState */

const rows = 3;
const columns = 3;
const updateInterval = 500;

const container = document.querySelector(".container");

/** @param {Vector} cellPos */
function isBlock(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    return cell.classList.contains("block-cell");
}

/** @param {Vector} cellPos */
function $setAsBlock(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    cell.classList = "cell block-cell";
}

/** @param {Vector} cellPos */
function $setAsEmpty(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    cell.classList = "cell empty-cell";
}

// states
/** @type {Vector} */
let s_currentTopLeft;
/** @type {Vector} */
let s_nextTopLeft;
/** @type {Vector[]} */
let s_currentShape;
let s_currentShapeWidth;
let s_currentShapeHeight;
let s_nextToGround = false;

/** @param {Vector} topLeft  @param {Vector[]} shape */
function canMoveTo(topLeft, shape) {
    for (const point of shape) {
        const worldPoint = topLeft.add(point);
        if (worldPoint.i < 0 || worldPoint.i >= columns || worldPoint.j < 0 || worldPoint.j >= rows || isBlock(worldPoint))
            return false;
    }
    return true;
}

function canRotateTo(topLeft, width, height, shape, rotation) {
    if (rotation !== 1 && rotation !== -1) return true;
    for (const point of shape) {
        const localPoint = rotation === -1 ? new Vector(height - point.j, point.i) : new Vector(point.j, width - point.i);
        const worldPoint = topLeft.add(localPoint);
        if (worldPoint.i < 0 || worldPoint.i >= columns || worldPoint.j < 0 || worldPoint.j >= rows || isBlock(worldPoint))
            return false;
    }
    return true;
}

/** @param {Vector} oldTopLeft  @param {Vector} newTopLeft  @param {Vector[]} shape */
function $moveShapeTo(oldTopLeft, newTopLeft, shape) {
    for (const point of shape)
        $setAsEmpty(oldTopLeft.add(point));
    for (const point of shape)
        $setAsBlock(newTopLeft.add(point));
    return true;
}

function $rotateTo(topLeft, width, height, shape, rotation) {
    if (rotation !== 1 && rotation !== -1) return;
    for (const point of shape)
        $setAsEmpty(topLeft.add(point));
    for (const point of shape) {
        const localPoint = rotation === -1 ? new Vector(height - point.j, point.i) : new Vector(point.j, width - point.i);
        $setAsBlock(topLeft.add(localPoint));
    }
}

function setNewShape() {
    const width = 3;
    const height = 2;
    const shape = [
        new Vector(0, 0),
        new Vector(1, 0),
        new Vector(2, 0),
        new Vector(2, 1),
    ];
    s_currentTopLeft = new Vector(Math.floor(Math.random() * (columns - width)), 0);
    s_nextTopLeft = s_currentTopLeft;
    s_currentShape = shape;
}

function clearFloor() {

}

function gameOver() {
    init();
}

function init() {
    container.innerHTML = "";
    container.style.setProperty("--rows", rows);
    container.style.setProperty("--columns", columns);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement("div");
            cell.classList = "cell empty-cell";
            cell.id = new Vector(i, j).toCellId();
            container.appendChild(cell);
        }
    }

    s_snake = [];
    s_velocity = new Vector(0, 1);
    snakeHead = new Vector(Math.floor(rows / 2), Math.floor(columns / 2));
    $setAsHead(snakeHead);
    for (let i = 0; i < minSnakeLength; i++)
        s_snake.push(snakeHead);
    for (let i = 0; i < foodCount && i < rows * columns - 1; i++)
        $setAsFood(getNewFoodPos());
}

const keyToOperations = {
    a: () => {
        const newTopLeft = s_currentTopLeft.add(-1, 1);
        if (canMoveTo(newTopLeft))
            s_nextTopLeft = newTopLeft;
    },
    d: () => {
        const newTopLeft = s_currentTopLeft.add(1, 1);
        if (canMoveTo(newTopLeft))
            s_nextTopLeft = newTopLeft;
    },
    ' ': () => {
        s_nextToGround = true;
    },
    q: () => {
        s_nextRotation = -1;
    },
    e: () => {
        s_nextRotation = 1;
    }
}

function onKeyDown(evt) {
    keyToOperations[evt]?.call();
}

function onTouchDown() {

}

function gameLoop() {
    $moveShapeTo(s_currentTopLeft, s_nextTopLeft, s_currentShape);
    s_nextTopLeft = s_currentTopLeft.add(0, 1);
    if (!canMoveTo(s_nextTopLeft, s_currentShape)) {
        clearFloor();
        setNewShape();
        if (!canMoveTo(s_currentTopLeft, s_currentShape)) {
            gameOver();
            return;
        }
        return;
    }
}


init();
window.addEventListener('keydown', onKeyDown);
setInterval(gameLoop, updateInterval);