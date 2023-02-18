canvas = document.querySelector('canvas');
c = canvas.getContext('2d');

xGravity = 0;
yGravity = 9.8;
let unit = 2

function mixColors(colorChannelA, colorChannelB, factor) {
    var channelA = colorChannelA * factor;
    var channelB = colorChannelB * (1 - factor);
    return parseInt(channelA + channelB);
}

function mixColors(rgbA, rgbB, factor) {
    return [colorChannelMixer(rgbA[0], rgbB[0], factor), colorChannelMixer(rgbA[1], rgbB[1], factor), colorChannelMixer(rgbA[2], rgbB[2], factor)];
}

let keyboard = {
    left: ["a", "ArrowLeft"],
    right: ["d", "ArrowRight"],
    down: ["s", "ArrowDow"],
    up: ["w", "ArrowUp", " "],
    sprint: ["shift"]
}
let keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    sprint: false
}
class Camera {
    constructor({
        position,
        player
    }) {
        this.position = position;
        this.player = player;
        this.velocity = {
            x: 1,
            y: 1
        };
        this.movement = {
            x: 0,
            y: 0
        };
    }

    update() {
        this.updatePlayer();
        this.movement = {
            x: 0,
            y: 0
        };
    }
    updatePlayer() {
        this.player.position.x += this.movement.x;
        this.player.position.y += this.movement.y;
        this.drawPlayer();
    }
    drawPlayer() {
        c.fillStyle = "#FFFFFF";
        c.fillRect(this.player.position.x, this.player.position.y, this.player.scale.x, this.player.scale.y);
    }
    move(direction) {
        this.position.x += this.velocity.x * direction.x;
        this.position.y += this.velocity.y * direction.y;

        this.movement = {
            x: this.velocity.x * direction.x,
            y: this.velocity.y * direction.y
        };
    }
}
let mainCamera = new Camera({
    position: {
        x: 0,
        y: 0
    },
    player: {
        position: {
            x: 910,
            y: 540
        },
        scale: {
            x: 100,
            y: 100
        },
        collide : new Collider()
    },
});

function FixSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight + 2;
}
FixSize();
window.onresize = FixSize;

class Point {
    constructor({
        position,
        color,
        weight = 1,
        overlayColor = "FFFFFF",
        scale = {
            x: 2,
            y: 2
        }
    }) {
        this.weight = weight;
        this.position = position;
        this.cPosition = this.position;
        this.color = color;
        this.scale = scale;
        this.deactivated = true;
        this.overlayColor = overlayColor;
    }

    draw() {
        let drawColor = this.color;
        if (this.overlayColor != "FFFFFF") {
            drawColor = MixHexColors(drawColor, this.overlayColor, 0.9);
        }
        c.fillStyle = drawColor;
        c.fillRect(this.position.x, this.position.y, this.scale.x, this.scale.y);
    }
    move(vector){
        this.cPosition.x += vector.x;
        this.cPosition.y += vector.y;
    }
    updatePos(speed) {
        this.cPosition.x += -mainCamera.movement.x * speed;
        this.cPosition.y += -mainCamera.movement.y * speed;
    }
    update(speed = 1, velocity = {x: 0, y: 0}) {
        this.updatePos(speed);
        if (!this.deactivated) {
            if (this.position.y < canvas.height - 10) this.position.y += this.weight * yGravity;
        }
        this.draw();
    }
}

class Structure {
    constructor({
        points,
        paralax = 1
    }) {
        this.velocity = {x: 0, y: 0};
        this.points = points;
        this.paralax = paralax;
    }

    update() {
        this.points.forEach(point => {
            point.update(this.paralax, this.velocity);
        });
    }
    changeVelocity(vector){
        this.velocity = vector;
    }
    impulse(vector){
        this.velocity.x += vector.x;
        this.velocity.y += vector.y;
    }
}
class Collider {
    constructor({
        left,
        right,
        top,
        bottom
    }){
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    checkCollison(id){
        for (let index = 0; index < ActiveColliders.length; index++) {
            if(index != id){

            }
        }
    }

    draw(){
        c.fillStyle = "#32CD32";
        c.fillRect(this.left, this.top, this.right - this.left, this.bottom - this.top);
    }
}

function Controls() {
    moveCamera();
}

function moveCamera() {
    let direction = {
        x: 0,
        y: 0
    }

    if (keys.left) direction.x = -1;
    if (keys.right) direction.x = 1;
    if (keys.up) direction.y = -1;
    if (keys.down) direction.y = 1;
    if (keys.sprint) direction.x *= 2;

    if (direction == {
            x: 0,
            y: 0
        }) return;
    mainCamera.move(direction);
}

const texturePath = "http://127.0.0.1:5500/textures/";

let Struct;
function newSturct(file, placeholder) {
    let rawFile = new XMLHttpRequest();
    file = file + "";
    rawFile.open("GET", texturePath + file, false);
    rawFile.onreadystatechange = function ()  {
        if (rawFile.readyState !== 4) return;
        if (rawFile.status !== 200 && rawFile.status != 0) return;

        let out = rawFile.responseText;
        let colors = [];
        let points = [];
        
        let rawColors = out.substring(0, out.indexOf(";"));
        rawColors += " ";
        console.log(rawColors);
        out = out.slice(out.indexOf(";") + 1, out.length);

        while (rawColors.includes(" ")){
            let color = rawColors.substring(0, rawColors.indexOf(" "));
            rawColors = rawColors.slice(rawColors.indexOf(" ") + 1, rawColors.length);
            let rgba = `rgba(${color})`;
            /*for (let i = 0; i < 4; i++) {
                rgba += color.substring(0, color.indexOf("."));
                if(i != 3) rgba += ",";
                else rgba += ")";
                color = color.slice(color.indexOf(".") + 1, color.length);
            }*/

            colors.push(rgba);
        }
        console.log(colors);

        let num = -1;

        let currPos = {
            x: 0,
            y: 0
        }
        while (out.includes(' ')) {
            if (out.startsWith("\n")) {
                currPos.y += 1;
                currPos.x = 0;
                num = 0;
            } else {
                num = out.indexOf(' ');
                if (!out.startsWith("0")) {
                    points.push(
                        new Point({
                            position: {
                                x: currPos.x,
                                y: currPos.y
                            },
                            color: colors[parseInt(out.substring(0, num))],
                        })
                    )
                }
                currPos.x += 1
            }
            out = out.substring(num + 1);
        }
        placeholder.points = points;
    }
    rawFile.send(null);
}

// let test = new Structure({points: []});
// newSturct("c", test);
// let square = new Structure({points: []});
// newSturct("square", square);
let arrow = new Structure({points: []});
newSturct("arrow", arrow);
console.log(arrow);

let ActiveColliders = [ /*Rock*/ ];


let StaticBG = [ arrow/*test, squareGround, Cloud*/ ];
let ActiveBG = [];

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = "#A78C79";
    c.fillRect(0, 0, canvas.width, canvas.height);

    Controls();

    StaticBG.forEach(obj => obj.update());
    ActiveBG.forEach(obj => obj.update());
    ActiveColliders.forEach(obj => obj.update());
    mainCamera.update();
}
animate();

document.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase();

    if (keyboard.left.includes(key)) keys.left = true;
    else if (keyboard.right.includes(key)) keys.right = true;
    else if (keyboard.up.includes(key)) keys.up = true;
    else if (keyboard.down.includes(key)) keys.down = true;
    else if (keyboard.sprint.includes(key)) keys.sprint = true;
});
document.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase();

    if (keyboard.left.includes(key)) keys.left = false;
    else if (keyboard.right.includes(key)) keys.right = false;
    else if (keyboard.up.includes(key)) keys.up = false;
    else if (keyboard.down.includes(key)) keys.down = false;
    else if (keyboard.sprint.includes(key)) keys.sprint = false;
});
document.addEventListener('visibilitychange', () => {
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    keys.sprint = false;
})