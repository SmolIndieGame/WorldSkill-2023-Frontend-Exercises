// @ts-check

/** @type {SVGElement} */
let svg;
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
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", cell_size * c + "");
    svg.setAttribute("height", cell_size * r + "");
    svg.style.display = "block";
    container.appendChild(svg);
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
    const cell = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cell.setAttribute("d", opTo("M", i, j) + opTo("L", i, j + 1) + opTo("L", i + 1, j + 1) + opTo("L", i + 1, j) + "Z");
    cell.setAttribute("fill", color);
    svg.appendChild(cell);
}

/**
 * @param {number} i
 * @param {number} j
 * @param {string} color
 */
function drawHollowCell(i, j, color) {
    const cell = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cell.setAttribute("d", opTo("M", i, j) + opTo("L", i, j + 1) + opTo("L", i + 1, j + 1) + opTo("L", i + 1, j) + "Z");
    cell.setAttribute("stroke", color);
    cell.setAttribute("fill", "black");
    svg.appendChild(cell);
}

/**
 * @param {(string | undefined)[][]} grid
 */
export function display(grid) {
    svg.innerHTML = "";
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