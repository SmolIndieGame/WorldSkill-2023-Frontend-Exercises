// @ts-check

/** @type {CanvasRenderingContext2D} */
let canvasCtx;
let rows = 0;
let columns = 0;
let cell_size = 24;

/**
 * @param {number} r
 * @param {number} c
 */
export function init(r, c) {
    rows = r;
    columns = c;
    const container = document.querySelector(".container");
    if (container === null || !(container instanceof HTMLElement)) return;
    container.innerHTML = "";
    container.style.display = "block";
    const canvas = document.createElement("canvas");
    canvas.width = columns * cell_size;
    canvas.height = rows * cell_size;
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error();
    canvasCtx = ctx;
}

/**
 * @param {string} op
 * @param {number} i
 * @param {number} j
 */
function opTo(op, i, j) {
    return op + (j * cell_size).toString() + " " + (i * cell_size).toString() + " ";
}

/**
 * @param {number} i
 * @param {number} j
 * @param {string} color
 */
function drawCell(i, j, color) {
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(j * cell_size, i * cell_size, cell_size, cell_size);
}

/**
 * @param {number} i
 * @param {number} j
 * @param {string} color
 */
function drawHollowCell(i, j, color) {
    canvasCtx.strokeStyle = color;
    canvasCtx.strokeRect(j * cell_size, i * cell_size, cell_size, cell_size);
}

/**
 * @param {(string | undefined)[][]} grid
 */
export function display(grid) {
    canvasCtx.clearRect(0, 0, columns * cell_size, rows * cell_size);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (!grid[i][j])
                drawCell(i, j, "black");
            else if (grid[i][j]?.startsWith("hollow"))
                drawHollowCell(i, j, grid[i][j]?.split(" ")[1] ?? "");
            else
                drawCell(i, j, grid[i][j] ?? "");
        }
    }
}