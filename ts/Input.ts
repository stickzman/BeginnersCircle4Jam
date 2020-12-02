var UP: boolean, DOWN: boolean, LEFT: boolean, RIGHT: boolean
var mouseX: number = 0
var mouseY: number = 0

window.addEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
        case "w": globalThis.UP = true; break;
        case "a": globalThis.LEFT = true; break;
        case "s": globalThis.DOWN = true; break;
        case "d": globalThis.RIGHT = true; break;
    }
})
window.addEventListener("keyup", e => {
    switch (e.key.toLowerCase()) {
        case "w": globalThis.UP = false; break;
        case "a": globalThis.LEFT = false; break;
        case "s": globalThis.DOWN = false; break;
        case "d": globalThis.RIGHT = false; break;
    }
})
document.querySelector("canvas").addEventListener("mousemove", e => {
    globalThis.mouseX = e.offsetX
    globalThis.mouseY = e.offsetY
})
