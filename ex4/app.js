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

    add(other) {
        return new Vector((rows + this.i + other.i) % rows, (columns + this.j + other.j) % columns);
    }

    static fromCellId(str) {
        const strs = str.split(" ");
        return new Vector(Number.parseInt(strs[1]), Number.parseInt(strs[2]));
    }
}

const rows = 10;
const columns = 10;
const updateInterval = 300;
const keyToVelocity = {
    w: new Vector(-1, 0),
    s: new Vector(1, 0),
    a: new Vector(0, -1),
    d: new Vector(0, 1),
}

const container = document.querySelector(".container");

/** @param {Vector} cellPos */
function isSnake(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    return cell.classList.contains("snake-cell") || cell.classList.contains("head-cell");
}

/** @param {Vector} cellPos */
function isFood(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    return cell.classList.contains("food-cell");
}

/** @param {Vector} headPos @param {Vector | undefined} prevHeadPos */
function $setAsHead(headPos, prevHeadPos) {
    const cell = document.getElementById(headPos.toCellId());
    cell.classList = "cell head-cell";
    if (prevHeadPos === undefined) return;
    const oldCell = document.getElementById(prevHeadPos.toCellId());
    oldCell.classList = "cell snake-cell";
}

/** @param {Vector} cellPos */
function $setAsEmpty(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    cell.classList = "cell empty-cell";
}

/** @param {Vector} cellPos */
function $setAsFood(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    cell.classList = "cell food-cell";
}

// states
/** @type {Vector[]} */
let s_snake;
let s_velocity;

function getNewFoodPos() {
    let foodPos;
    do {
        foodPos = new Vector(Math.floor(Math.random() * rows), Math.floor(Math.random() * columns))
    } while (isSnake(foodPos));
    return foodPos;
}

function getNewVelocity(oldVelocity, key) {
    const pressed = key;
    const newVelocity = keyToVelocity[pressed];
    if (newVelocity === undefined) return oldVelocity;
    if (s_snake.length >= 2 && s_snake[s_snake.length - 2].equal(s_snake[s_snake.length - 1].add(newVelocity)))
        return oldVelocity;
    return newVelocity;
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
    s_snake.push(snakeHead.add(new Vector(0, -2)));
    s_snake.push(snakeHead.add(new Vector(0, -1)));
    s_snake.push(snakeHead);
    $setAsFood(getNewFoodPos());
}

function onKeyDown(evt) {
    s_velocity = getNewVelocity(s_velocity, evt.key);
}

function gameLoop() {
    const newHeadPos = s_snake[s_snake.length - 1].add(s_velocity);
    if (isSnake(newHeadPos)) {
        gameOver();
        return;
    }

    if (isFood(newHeadPos)) {
        $setAsFood(getNewFoodPos());
        $setAsHead(newHeadPos, s_snake[s_snake.length - 1]);
        s_snake.push(newHeadPos);
        return;
    }
    $setAsHead(newHeadPos, s_snake[s_snake.length - 1]);
    s_snake.push(newHeadPos);

    const tail = s_snake.shift();
    $setAsEmpty(tail);
}


init();
window.addEventListener('keydown', onKeyDown);
setInterval(gameLoop, updateInterval);