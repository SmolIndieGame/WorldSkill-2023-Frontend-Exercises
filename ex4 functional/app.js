class Vector {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        Object.freeze(this);
    }

    /** @param {Vector} vector */
    static toCellId = (vector) => {
        return `cell ${vector.i} ${vector.j}`;
    };

    /** @param {Vector} a @param {Vector} b */
    static equal = (a, b) => {
        if (!a || !b) return false;
        return a.i === b.i && a.j === b.j;
    };

    /** @param {Vector} a @param {Vector} b */
    static add = (a, b) => {
        return new Vector(
            (rows + a.i + b.i) % rows,
            (columns + a.j + b.j) % columns
        );
    };
}

const rows = 3;
const columns = 3;
const minSnakeLength = 3;
const foodCount = 0;
const updateInterval = 1000 / 2;
const keyToVelocity = {
    w: new Vector(-1, 0),
    s: new Vector(1, 0),
    a: new Vector(0, -1),
    d: new Vector(0, 1),
};

const container = document.querySelector(".container");

/** @param {Vector} cellPos */
function isSnake(cellPos) {
    const cell = document.getElementById(cellPos.toCellId());
    return (
        cell.classList.contains("snake-cell") ||
        cell.classList.contains("head-cell")
    );
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
        foodPos = new Vector(
            Math.floor(Math.random() * rows),
            Math.floor(Math.random() * columns)
        );
    } while (isSnake(foodPos) || isFood(foodPos));
    return foodPos;
}

function getNewVelocity(oldVelocity, key) {
    const pressed = key;
    const newVelocity = keyToVelocity[pressed];
    if (newVelocity === undefined) return oldVelocity;
    if (
        s_snake.length >= 2 &&
        s_snake[s_snake.length - 2].equal(
            s_snake[s_snake.length - 1].add(newVelocity)
        )
    )
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
    for (let i = 0; i < minSnakeLength; i++) s_snake.push(snakeHead);
    for (let i = 0; i < foodCount && i < rows * columns - 1; i++)
        $setAsFood(getNewFoodPos());
}

function onKeyDown(evt) {
    s_velocity = getNewVelocity(s_velocity, evt.key);
}

async function gameLoop(state) {
    await new Promise((r) => setTimeout(r, updateInterval));

    const newHeadPos = s_snake[s_snake.length - 1].add(s_velocity);

    if (isFood(newHeadPos)) {
        $setAsHead(newHeadPos, s_snake[s_snake.length - 1]);
        s_snake.push(newHeadPos);
        if (s_snake.length === rows * columns) {
            gameOver();
            return;
        }
        if (s_snake.length < rows * columns - foodCount + 1)
            $setAsFood(getNewFoodPos());
        return;
    }

    s_snake.push(newHeadPos);

    const tail = s_snake.shift();
    if (!tail.equal(s_snake[0])) $setAsEmpty(tail);

    $setAsHead(newHeadPos, s_snake[s_snake.length - 2]);

    if (isSnake(newHeadPos)) {
        gameOver();
        return;
    }

    gameLoop(state);
}

async function inputLoop(state) {
    const evt = await new Promise((r) =>
        window.addEventListener("keydown", r, { once: true })
    );
    inputLoop({ velocity: getNewVelocity(state.velocity, evt.key) });
}

inputLoop(init());
gameLoop(init());
