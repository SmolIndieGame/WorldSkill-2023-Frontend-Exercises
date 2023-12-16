// @ts-check
import Vector from "./vector.js";

/** @typedef {0 | 1 | 2 | 3} Rotation */

export default class Shape {
    /**
     * @param {Number} height
     * @param {Number} width
     * @param {Vector[]} points
     */
    constructor(height, width, points) {
        this.height = height;
        this.width = width;
        this.points = points;
    }

    /**
     * @param {number[]} points
     */
    static from(...points) {
        if (points.length % 2 !== 0)
            throw "points length must be multiple of 2.";
        let arr = [];
        let width = 0;
        let height = 0;
        for (let i = 0; i < points.length; i += 2) {
            arr.push(new Vector(points[i], points[i + 1]));
            height = Math.max(height, points[i] + 1);
            width = Math.max(width, points[i + 1] + 1);
        }
        return new Shape(height, width, arr);
    }

    /**
     * @param {Rotation} rotation
     * @returns {Vector[]}
     */
    transformPoints(rotation) {
        switch (rotation) {
            case 0:
                return this.points.map((point) => new Vector(point.i, point.j));
            case 1:
                return this.points.map(
                    (point) => new Vector(point.j, this.width - point.i - 1)
                );
            case 2:
                return this.points.map(
                    (point) =>
                        new Vector(
                            this.height - point.i - 1,
                            this.width - point.j - 1
                        )
                );
            case 3:
                return this.points.map(
                    (point) => new Vector(this.height - point.j, point.i)
                );
        }
    }
}