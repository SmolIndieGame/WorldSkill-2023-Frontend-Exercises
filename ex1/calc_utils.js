const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
}

const pre = {
    "+": 0,
    "-": 0,
    "*": 1,
    "/": 1,
}

function parse(input) {
    let ans = [];
    const numReg = /(\+|\-|\*|\/)?([0-9]*(\.[0-9]+)?)/g;
    const res = input.matchAll(numReg);
    for (const match of res) {
        if (match[1])
            ans.push(match[1]);
        const num = Number.parseFloat(match[2]);
        if (!Number.isNaN(num))
            ans.push(num);
    }
    return ans;
}

function calculate(input) {
    const list = parse(input);
    const numStack = [];
    const opStack = [];
    for (const item of list) {
        if (typeof item === "number") {
            numStack.push(item);
            continue;
        }
        while (opStack.length > 0 && pre[item] <= pre[opStack[opStack.length - 1]]) {
            const b = numStack.pop();
            const a = numStack.pop();
            numStack.push(ops[opStack.pop()](a, b));
        }

        opStack.push(item);
    }
    while (opStack.length > 0) {
        const b = numStack.pop();
        const a = numStack.pop();
        numStack.push(ops[opStack.pop()](a, b));
    }
    return numStack.pop();
}