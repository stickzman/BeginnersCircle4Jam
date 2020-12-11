/// <reference path="main.ts" />

var UP: boolean,
    DOWN: boolean,
    LEFT: boolean,
    RIGHT: boolean,
    LEFT_MOUSE: boolean,
    RIGHT_MOUSE: boolean
var mouseX: number = 0
var mouseY: number = 0

window.addEventListener("keydown", e => {
    switch (e.key.toLowerCase()) {
        case "w": globalThis.UP = true; break;
        case "a": globalThis.LEFT = true; break;
        case "s": globalThis.DOWN = true; break;
        case "d": globalThis.RIGHT = true; break;
        case " ": globalThis.SPACE = true; break;
    }
})
window.addEventListener("keyup", e => {
    switch (e.key.toLowerCase()) {
        case "w": globalThis.UP = false; break;
        case "a": globalThis.LEFT = false; break;
        case "s": globalThis.DOWN = false; break;
        case "d": globalThis.RIGHT = false; break;
        case " ": globalThis.SPACE = false; break;
    }
})
window.addEventListener("mousemove", e => {
    globalThis.mouseX = e.clientX
    globalThis.mouseY = e.clientY
})
window.addEventListener("mousedown", e => {
    if (e.which === 1) globalThis.LEFT_MOUSE = true
    if (e.which === 3) globalThis.RIGHT_MOUSE = true
})
window.addEventListener("mouseup", e => {
    if (e.which === 1) globalThis.LEFT_MOUSE = false
    if (e.which === 3) globalThis.RIGHT_MOUSE = false
})
document.querySelector("canvas").addEventListener("contextmenu", e => {
    e.preventDefault()
})
