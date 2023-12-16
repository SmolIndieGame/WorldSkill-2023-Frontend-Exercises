// @ts-check

export default class Vector {
    /**
     * @param {number} i
     * @param {number} j
     */
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    toCellId() {
        return `cell ${this.i} ${this.j}`;
    }

    /**
     * @param {{ i: any; j: any; }} other
     */
    equal(other) {
        if (!other) return false;
        return other.i === this.i && other.j === this.j;
    }

    /**
     * @param {number} i
     * @param {number} j
     */
    addNum(i, j) {
        return new Vector(this.i + i, this.j + j);
    }

    /**
     * @param {Vector} other
     */
    add(other) {
        return new Vector(this.i + other.i, this.j + other.j);
    }
}