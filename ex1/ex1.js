const op = document.querySelector("#ops");
const inp = document.querySelector("#calc");
const res = document.querySelector("#res");

function onOpChanged(evt) {
    const value = evt.target.value;
    inp.style.display = value === "1" ? "" : "none";
}

function onInpChanged(evt) {
    const value = evt.target.value;
    res.innerHTML = calculate(value).toString();
}

function main() {
    op.addEventListener("change", onOpChanged);
    inp.addEventListener("change", onInpChanged);
}

main();