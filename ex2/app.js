const buttons = document.querySelectorAll("button");
const displays = {
  top: document.getElementById("top"),
  op: document.getElementById("op"),
  bottom: document.getElementById("bottom"),
};

const opDict = {
  n: flipSign,
  c: clear,
  "+": addOp("+", (a, b) => a + b),
  "-": addOp("-", (a, b) => a - b),
  "*": addOp("×", (a, b) => a * b),
  "/": addOp("÷", (a, b) => a / b),
  "%": addOp("%", (a, b) => a % b),
  ".": addDot,
  "=": evaluate,
};

for (let i = 0; i <= 9; i++) {
  const num = i.toString();
  opDict[num] = addDigit(num);
}

function addOp(name, operation) {
  return (state) => {
    if (state.op !== null) {
      state = evaluate(state, false);
    }
    return {
      top: "",
      op: { name, operation },
      bottom: state.top === "" ? state.bottom : state.top,
    };
  };
}

function addDigit(num) {
  return (state) => {
    const newVal = state.top === "0" ? num : state.top + num;
    return {
      top: newVal,
      op: state.op,
      bottom: state.bottom,
    };
  };
}

function flipSign(state) {
  if (state.top === "0" || state.top === "")
    return {
      top: "0",
      op: state.op,
      bottom: state.bottom,
    };
  return {
    top: state.top[0] === "-" ? state.top.substring(1) : "-" + state.top,
    op: state.op,
    bottom: state.bottom,
  };
}

function clear(state) {
  return {
    top: "0",
    op: state.op,
    bottom: state.bottom,
  };
}

function addDot(state) {
  return {
    top: state.top.includes(".") ? state.top : state.top + ".",
    op: state.op,
    bottom: state.bottom,
  };
}

function evaluate(state, force = true) {
  if (state.op === null || (!force && state.top === "")) return state;
  return {
    top: "",
    op: null,
    bottom: state.op.operation(parse(state.bottom), parse(state.top)),
  };
}

function parse(numStr) {
  return numStr === "" ? 0 : Number.parseFloat(numStr);
}

function strToDisplay(num) {
  if (num === "") return "0";
  if (num[0] === ".") return "0" + num;
  return num;
}

function toDisplay(state) {
  const top = strToDisplay(
    state.top === "" && state.op === null ? state.bottom : state.top
  );
  const op = state.op === null ? "" : state.op.name;
  const bottom = state.op === null ? "&nbsp;" : strToDisplay(state.bottom);
  return { top, op, bottom };
}

let state = {
  top: ``,
  op: null,
  bottom: ``,
};

function onButtonClick(evt) {
  const button = evt.target;
  const op = button.dataset.op;
  state = opDict[op](state);
  const displayStrings = toDisplay(state);
  for (const item in displayStrings) {
    displays[item].innerHTML = displayStrings[item];
  }
}

for (const button of buttons) {
  if (button.dataset.op == undefined) continue;
  button.addEventListener("click", onButtonClick);
}
