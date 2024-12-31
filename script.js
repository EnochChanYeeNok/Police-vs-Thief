// script.js

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// World variables
const world = {
    width: Infinity, // Conceptually infinite
    height: Infinity
};

// Camera setup
const camera = {
    x: 0,
    y: 0,
    smoothFactor: 0.05 // Determines how smoothly the camera follows the thief
};

// Game variables
const thiefCar = {
    x: 0,                        // World X position
    y: 0,                        // World Y position
    width: 50,
    height: 100,
    speed: 4,                    // Constant forward speed
    angle: 0,                    // Initial angle in degrees
    turnSpeed: 3                 // Degrees per frame
};

const policeCars = [];
const policeSpawnInterval = 2000; // Spawn every 2 seconds
let gameOver = false;

// Handle user input
const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = false;
    }
});

// Handle touch input
document.addEventListener('touchstart', (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2) {
        keys.left = true;
    } else {
        keys.right = true;
    }
}, { passive: true });

document.addEventListener('touchend', () => {
    keys.left = false;
    keys.right = false;
}, { passive: true });

// Update thief car position and angle
function updateThief() {
    if (keys.left) {
        thiefCar.angle -= thiefCar.turnSpeed;
    }
    if (keys.right) {
        thiefCar.angle += thiefCar.turnSpeed;
    }

    // Convert angle to radians for movement calculations
    const rad = thiefCar.angle * (Math.PI / 180);

    // Update position based on angle
    thiefCar.x += thiefCar.speed * Math.sin(rad);
    thiefCar.y -= thiefCar.speed * Math.cos(rad);
}

// Police car class
class PoliceCar {
    constructor() {
        this.width = 50;
        this.height = 100;
        // Spawn police cars at a random distance from the thief
        const spawnDistance = 800; // Distance from thief
        const angle = Math.random() * 2 * Math.PI;
        this.x = thiefCar.x + spawnDistance * Math.cos(angle);
        this.y = thiefCar.y + spawnDistance * Math.sin(angle);
        this.speed = 5; // Increased speed for police cars
        this.color = 'red';
    }

    update() {
        // Calculate angle towards the thief car
        const dx = thiefCar.x - this.x;
        const dy = thiefCar.y - this.y;
        const angleToThief = Math.atan2(dx, dy);

        // Update position towards the thief car
        this.x += this.speed * Math.sin(angleToThief);
        this.y -= this.speed * Math.cos(angleToThief);
    }

    draw() {
        const screenX = this.x - camera.x + canvas.width / 2;
        const screenY = this.y - camera.y + canvas.height / 2;

        ctx.save();
        ctx.translate(screenX, screenY);
        // Calculate rotation based on movement direction
        const rad = Math.atan2(thiefCar.x - this.x, thiefCar.y - this.y);
        ctx.rotate(rad);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        // Optional: Add details like windows or stripes
        ctx.fillStyle = 'black';
        ctx.fillRect(-this.width / 2 + 10, -this.height / 2 + 20, 30, 20); // Example window
        ctx.restore();
    }
}

// Spawn police cars at intervals
const spawnPoliceCar = () => {
    if (!gameOver) {
        policeCars.push(new PoliceCar());
    }
};

const spawnInterval = setInterval(spawnPoliceCar, policeSpawnInterval);

// Check for collisions
function checkCollisions() {
    for (let i = 0; i < policeCars.length; i++) {
        const pc = policeCars[i];
        const distance = Math.hypot(thiefCar.x - pc.x, thiefCar.y - pc.y);
        if (distance < Math.hypot(thiefCar.width, thiefCar.height) / 2 + Math.hypot(pc.width, pc.height) / 2) {
            gameOver = true;
            clearInterval(spawnInterval);
            alert('You have been caught by the police!');
        }
    }
}

// Draw thief car with rotation
function drawThief() {
    const screenX = thiefCar.x - camera.x + canvas.width / 2;
    const screenY = thiefCar.y - camera.y + canvas.height / 2;

    ctx.save(); // Save the current state
    ctx.translate(screenX, screenY); // Translate to the car's position
    ctx.rotate(thiefCar.angle * (Math.PI / 180)); // Rotate the canvas to the car's angle
    ctx.fillStyle = 'blue';
    ctx.fillRect(-thiefCar.width / 2, -thiefCar.height / 2, thiefCar.width, thiefCar.height);
    // Optional: Add details like windows or patterns
    ctx.fillStyle = 'black';
    ctx.fillRect(-thiefCar.width / 2 + 10, -thiefCar.height / 2 + 20, 30, 20); // Example window
    ctx.restore(); // Restore the canvas state
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update camera position smoothly towards the thief
function updateCamera() {
    // Calculate the distance between the camera and the thief
    const dx = thiefCar.x - camera.x;
    const dy = thiefCar.y - camera.y;

    // Update camera position by a fraction of the distance
    camera.x += dx * camera.smoothFactor;
    camera.y += dy * camera.smoothFactor;
}

// Game loop
function gameLoop() {
    clearCanvas();
    updateThief();
    updateCamera();
    drawThief();

    policeCars.forEach((pc, index) => {
        pc.update();
        pc.draw();

        // Remove police cars that are too far from the thief to optimize performance
        const distance = Math.hypot(thiefCar.x - pc.x, thiefCar.y - pc.y);
        if (distance > 1000) { // Adjust as needed
            policeCars.splice(index, 1);
        }
    });

    checkCollisions();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game
gameLoop();