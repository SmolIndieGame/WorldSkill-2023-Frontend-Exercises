"use strict";

const _call = (obj) => (method) => (...args) => {
    return method(obj, ...args);
}

const _new = (constructor) => (...args) => {
    const obj = {};
    constructor(obj, ...args);
    obj._ = _call(obj);
    return obj;
}

const Car = (obj, name, speed, size) => {
    obj.name = name;
    obj.speed = speed;
    obj.size = size;
}

const changeSpeed = (obj, newSpeed) => {
    const oldSpeed = obj.speed;
    obj.speed = newSpeed;
    return oldSpeed;
}

const car = _new(Car)("hi", 567, 65);
console.log(car);
console.log(car._(changeSpeed)(3432));
console.log(car);

const Vector = (obj, { x, y }) => {
    obj.x = x;
    obj.y = y;
}

const vec = _new(Vector)({ x: 1, y: 4 });
console.log(vec);