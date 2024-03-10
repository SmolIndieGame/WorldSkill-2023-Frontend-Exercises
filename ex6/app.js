// @ts-check

const cWidth = 600;
const cHeight = 400;
const ballCount = 20;
const colors = ['red', 'green', 'blue', 'black'];
const collideWithOthers = true;


/** @type {Ball[]} */
const balls = [];
let lastTime = 0;
let deltaTime = 0;

class Ball {
    x
    y
    dx
    dy
    r
    color
    /**
       * @param {number} x
       * @param {number} y
       * @param {number} dx
       * @param {number} dy
       * @param {number} r
       * @param {string} color
       */
    constructor(x, y, dx, dy, r, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.r = r;
        this.color = color;
    }

    /**
     * @param {number} nx
     * @param {number} ny
     */
    reflect(nx, ny) {
        const nlen = Math.sqrt(nx * nx + ny * ny);
        nx /= nlen;
        ny /= nlen;
        const plen = nx * this.dx + ny * this.dy;
        const vec1x = nx * plen;
        const vec1y = ny * plen;
        const vec2x = this.dx - vec1x;
        const vec2y = this.dy - vec1y;
        this.dx = vec2x + nx * Math.abs(plen);
        this.dy = vec2y + ny * Math.abs(plen);
    }

    /**
       * @param {CanvasRenderingContext2D} ctx
       */
    onGUI(ctx) {
        if (this.x < this.r) {
            this.reflect(1, 0);
        }
        if (this.x > cWidth - this.r) {
            this.reflect(-1, 0);
        }
        if (this.y < this.r) {
            this.reflect(0, 1);
        }
        if (this.y > cHeight - this.r) {
            this.reflect(0, -1);
        }

        if (collideWithOthers)
            for (const other of balls) {
                if (this === other)
                    continue;
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dis = Math.sqrt(dx * dx + dy * dy);
                if (dis <= other.r + this.r) {
                    this.reflect(this.x - other.x, this.y - other.y)
                    other.reflect(other.x - this.x, other.y - this.y)
                }
            }

        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.dy += 500 * deltaTime;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

const onGUI = (/** @type {CanvasRenderingContext2D} */ ctx) => {
    ctx.clearRect(0, 0, cWidth, cHeight);
    const time = Date.now();
    deltaTime = Math.min(0.025, (time - lastTime) / 1000.0);
    for (const ball of balls) {
        ball.onGUI(ctx)
    }
    lastTime = time;
    window.requestAnimationFrame(() => onGUI(ctx));
}

const main = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    canvas.width = cWidth;
    canvas.height = cHeight;
    const context = canvas?.getContext('2d');
    if (!context) return;
    for (let i = 0; i < ballCount; i++) {
        const ball = new Ball(Math.random() * cWidth / 2 + cWidth * 0.25,
            Math.random() * cHeight / 2 + cHeight * 0.25,
            Math.random() * 600 - 300, Math.random() * 400 - 200,
            Math.random() * 10 + 10,
            `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`);
        balls.push(ball);
    }

    lastTime = Date.now();
    window.requestAnimationFrame(() => onGUI(context));
}

main();