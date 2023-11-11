const buttons = document.querySelectorAll("button");
const display = document.querySelector("#result");

let a = 0;
let op = null;
let b = 0;

const opDict = {
    'n': flipSign,
    'c': clear,
    '%': () => op = (a, b) => a % b,
    '/': () => op = (a, b) => a / b,
    '*': () => op = (a, b) => a * b,
    '-': () => op = (a, b) => a - b,
    '+': () => op = (a, b) => a + b,
    '=': evaluate,
    '.':
}

function addDigit(num) {
    if (op == null)
        a = a * 10 + num;
    else
        b = b * 10 + num;
}

function flipSign() {
    if (op == null)
        a = -a;
    else
        b = -b;
}

function clear() {
    if (op == null)
        a = 0;
    else
        b = 0;
}

function addDot() {
}

function evaluate() {
    if (op == null)
        return;
    a = op(a, b);
    b = 0;
    aDot = false;
    bDot = false;
    op = null;
}

function onButtonClick(evt) {
    const button = evt.target;
    const opC = button.dataset.op;
    const num = Number.parseInt(opC);
    if (num >= 0)
        addDigit(num);
    else
        opDict[opC]();
    display.innerHTML = Math.round((op == null ? a : b) * 1000) / 1000;
}

for (const button of buttons) {
    if (button.dataset.op == undefined) continue;
    button.addEventListener('click', onButtonClick)
}