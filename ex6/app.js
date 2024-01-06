// @ts-check
function main() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const context = canvas?.getContext('2d');
    if (!context) return;
    // context.arc(0, 0, 50, 0, 90);
    context.fillStyle = "black";
    context.fillRect(0, 0, 100, 200);
}

main();