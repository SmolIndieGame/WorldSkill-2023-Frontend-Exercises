// @ts-check

/** @type {HTMLElement[][]} */
let displayGrid;

let rows = 0;
let columns = 0;

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
    container.style.display = "grid";
    container.style.setProperty("--rows", (r + 2).toString());
    container.style.setProperty("--columns", (c + 2).toString());
    displayGrid = [];
    for (let i = 0; i < r + 2; i++) {
        if (i > 0 && i <= r) {
            displayGrid[i - 1] = [];
        }
        for (let j = 0; j < c + 2; j++) {
            const cell = document.createElement("div");
            if (i <= 0 || i > r || j <= 0 || j > c) {
                cell.classList.value = "cell block-cell";
                cell.style.setProperty("--color", "#777");
                container.appendChild(cell);
                continue;
            }
            cell.classList.value = "cell";
            container.appendChild(cell);
            displayGrid[i - 1][j - 1] = cell;
        }
    }
}

/**
 * @param {(string | undefined)[][]} grid
 */
export function display(grid) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            displayGrid[i][j].classList.value = "cell";
            if (!grid[i][j]) continue;
            if (grid[i][j]?.startsWith("hollow")) {
                displayGrid[i][j].classList.add("hollow-cell");
                displayGrid[i][j].style.setProperty("--color", grid[i][j]?.split(" ")[1] ?? "");
                continue;
            }
            displayGrid[i][j].classList.add("block-cell");
            displayGrid[i][j].style.setProperty("--color", grid[i][j] ?? "");
        }
    }
}