class Vector {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    /** @param {Vector} vector */
    static toCellId = (vector) => `cell ${vector.i} ${vector.j}`;

    /** @param {Vector} a @param {Vector} b */
    static equal = (a, b) => a && b && a.i === b.i && a.j === b.j;

    /** @param {Vector} a @param {Vector} b */
    static add = (a, b) =>
        new Vector((rows + a.i + b.i) % rows, (columns + a.j + b.j) % columns);
}

/** @typedef {{snake: Vector[], foods: Vector[], velocity: Vector}} GameState */

const rows = 10;
const columns = 16;
const minSnakeLength = 4;
const foodCount = 3;
const updateInterval = 1000 / 10;
const keyToVelocity = {
    w: new Vector(-1, 0),
    s: new Vector(1, 0),
    a: new Vector(0, -1),
    d: new Vector(0, 1),
};

/** mutate the array for speed boost */
function $swap(array, aIdx, bIdx) {
    const tmp = array[aIdx];
    array[aIdx] = array[bIdx];
    array[bIdx] = tmp;
    return array;
}

/**
 * @template T
 * @template U
 * @param {() => T} computation
 * @param {(input: T) => U} func
 * @returns {U}
 */
const chain = (computation, func) => func(computation());

/**
 * @template T
 * @param {T[]} array
 * @param {(element: T) => boolean} predicate
 * @param {Number} [len=array.length]
 * @returns {T}
 */
const findRandom = (array, predicate, len = array.length) =>
    len === 0
        ? undefined
        : chain(
              () => Math.floor(Math.random() * len),
              (idx) =>
                  predicate(array[idx])
                      ? array[idx]
                      : findRandom(
                            $swap(array, idx, len - 1),
                            predicate,
                            len - 1
                        )
          );

/**
 * @param {Vector[]} foods
 * @param {Number} len
 * @param {Vector[]} doNotAddTo
 * @returns {Vector[]}
 */
const fillFood = (foods, doNotAddTo) =>
    foods.length >= Math.min(foodCount, rows * columns - doNotAddTo.length)
        ? foods
        : fillFood(
              [
                  ...foods,
                  findRandom(
                      new Array(rows * columns)
                          .fill(undefined)
                          .map(
                              (_, i) =>
                                  new Vector(
                                      Math.floor(i / columns),
                                      i % columns
                                  )
                          ),
                      (vec) =>
                          !foods.some((e) => Vector.equal(e, vec)) &&
                          !doNotAddTo.some((e) => Vector.equal(e, vec))
                  ),
              ],
              doNotAddTo
          );

/**
 * @param {Vector[]} foods
 * @param {Vector[]} snake
 * @param {Vector} headPos
 * @returns {{eaten: boolean, foods: Vector[]}} */
const foodHandling = (foods, snake, headPos) =>
    chain(
        () => foods.filter((e) => !Vector.equal(e, headPos)),
        (foodsLeft) => ({
            eaten: foodsLeft.length < foods.length,
            foods: fillFood(foodsLeft, [...snake, headPos]),
        })
    );

const gameOver = (message, input) => {
    alert(message);
    input.key = "d";
    gameLoop(getInitState(), input);
};

/** @returns {GameState} */
const getInitState = () =>
    chain(
        () => new Vector(Math.floor(rows / 2), Math.floor(columns / 2)),
        (head) => ({
            velocity: new Vector(0, 1),
            snake: new Array(minSnakeLength).fill(head),
            foods: fillFood([], [head]),
        })
    );

/** @param {GameState} state */
async function gameLoop(state, input) {
    $display(state.snake, state.foods);
    await new Promise((r) => setTimeout(r, updateInterval));

    if (state.snake.length >= rows * columns) {
        gameOver("You win!", input);
        return;
    }

    const tmpVelocity = keyToVelocity[input.key];
    const newVelocity =
        tmpVelocity === undefined ||
        (state.velocity.i === -tmpVelocity.i &&
            state.velocity.j === -tmpVelocity.j)
            ? state.velocity
            : tmpVelocity;

    const newHeadPos = Vector.add(
        state.snake[state.snake.length - 1],
        newVelocity
    );
    const { eaten, foods: newFoods } = foodHandling(
        state.foods,
        state.snake,
        newHeadPos
    );

    const tmpSnake = state.snake.concat([newHeadPos]);
    const newSnake = eaten ? tmpSnake : tmpSnake.slice(1);

    if (
        newSnake.some(
            (e, i) =>
                i < newSnake.length - 1 &&
                Vector.equal(e, newSnake[newSnake.length - 1])
        )
    ) {
        gameOver("You lose!", input);
        return;
    }

    gameLoop(
        {
            snake: newSnake,
            foods: newFoods,
            velocity: newVelocity,
        },
        input
    );
}

function $initUI() {
    const container = document.querySelector(".container");
    container.innerHTML = "";
    container.style.setProperty("--rows", rows);
    container.style.setProperty("--columns", columns);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement("div");
            cell.classList = "cell empty-cell";
            cell.id = Vector.toCellId(new Vector(i, j));
            container.appendChild(cell);
        }
    }
}

/**
 * @param {Vector[]} snake
 * @param {Vector[]} foods
 */
function $display(snake, foods) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const cell = document.getElementById(
                Vector.toCellId(new Vector(i, j))
            );
            cell.classList = "cell empty-cell";
        }
    }
    snake.forEach(
        (e, i) =>
            (document.getElementById(Vector.toCellId(e)).classList =
                i === snake.length - 1
                    ? "cell head-cell"
                    : i === 0
                    ? "cell tail-cell"
                    : "cell snake-cell")
    );
    foods.forEach(
        (e) =>
            (document.getElementById(Vector.toCellId(e)).classList =
                "cell food-cell")
    );
}

function main() {
    $initUI();
    const inputState = { key: "" };
    addEventListener("keydown", (evt) => (inputState.key = evt.key));
    console.log(getInitState());
    gameLoop(getInitState(), inputState);
}

main();
