// @ts-check
"use strict";

const _call =
    (obj) =>
        (method) =>
            (...args) => {
                return method(obj, ...args);
            };

const _new =
    (constructor) =>
        (...args) => {
            const obj = {};
            constructor(obj, ...args);
            obj._ = _call(obj);
            return obj;
        };

const Car = (obj, name, speed, size) => {
    obj.name = name;
    obj.speed = speed;
    obj.size = size;
};

const changeSpeed = (obj, newSpeed) => {
    const oldSpeed = obj.speed;
    obj.speed = newSpeed;
    return oldSpeed;
};

const obj = {
    hi() {
        return {};
    }
}

const car = _new(Car)("hi", 567, 65);
console.log(car);
console.log(car._(changeSpeed)(3432));
console.log(car);

const Vector = (obj, { x, y }) => {
    obj.x = x;
    obj.y = y;
};

const vec = _new(Vector)({ x: 1, y: 4 });
console.log(vec);

async function loop(state) {
    const newState = changeState(state);
    // console.log(newState);
    // await new Promise((r) => setTimeout(r, 1000));
    await null;
    loop(newState);
}

function changeState(state) {
    return state + 1;
}

async function mainLoop() {
    const initState = 0;
    loop(initState);
}

mainLoop();

/** @template E */
class InfiniteHandlers {
    /** @param {String} trigger @param {(evt: E) => void} handler */
    addListener(trigger, handler) {
        if (this[trigger + '_handler']) {
            this[trigger + '_handler'].push(handler);
            return;
        }

        this[trigger + '_handler'] = [handler];
        /** @type {(evt: E) => void} */
        this[trigger] = function (evt) {
            this[trigger + '_handler'].forEach((/** @type {(evt: E) => void} */ f) => f(evt));
        }
    }
}

/** @type {InfiniteHandlers<String>} */
const aaaa = new InfiniteHandlers();
aaaa.addListener('click', (e) => console.log(e));
aaaa['click']("wowow");

const arr = {
    [Symbol.iterator]() {
        return {
            next() {
                return {
                    value: 0
                };
            }
        };
    }
}

for (const item of arr) {

}
