const keypress = require('keypress');
const ansi = require('ansi');

cursor = ansi(process.stdin);
var numApples = 1;      // default Value = 1
var numRows = 10;       // default Value = 10
var direction = 0;      // 0: down, 1: right, 2: up, 3: left
var speed = 1000;       // default Value = 500
var numEatenApples = 0; // default Value = 0

var argvLength = process.argv.length;
if (argvLength === 2) {
} else if (argvLength === 4) {
    var args = process.argv;
    var indexOfA = args.indexOf('-a');
    var indexOfR = args.indexOf('-r');
    if (indexOfA !== -1) {
        if (indexOfA + 1 > args.length) {
            printUsage();
        } else {
            numApples = parseInt(args[indexOfA + 1]);
            if (numApples > Math.pow(numRows, 2) - 1) {
                numApples = Math.pow(numRows, 2) - 1;
            }
        }
    } else if (indexOfR !== -1) {
        if (indexOfR + 1 > args.length || args[indexOfR + 1] < 5) {
            printUsage();
        } else {
            numRows = parseInt(args[indexOfR + 1]);
        }
    } else { printUsage(); }
} else if (argvLength === 6) {
    var args = process.argv;
    var indexOfA = args.indexOf('-a');
    var indexOfR = args.indexOf('-r');
    if (indexOfA !== -1 && indexOfR !== -1) {
        if (indexOfR + 1 > args.length || args[indexOfR + 1] < 5) {
            printUsage();
        } else {
            numRows = parseInt(args[indexOfR + 1]);
        }
        if (indexOfA + 1 > args.length) {
            printUsage();
        } else {
            numApples = parseInt(args[indexOfA + 1]);
            if (numApples >= Math.pow(numRows, 2) - 1) {
                numApples = Math.pow(numRows, 2) - 1;
            }
        }

    }
} else {
    printUsage();
}

process.stdout.write('\x1Bc');
cursor = ansi(process.stdout);
keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
    if (key) {
        if (key.name === 'up') {
            direction = 2;
        } else if (key.name === 'down') {
            direction = 0;
        } else if (key.name === 'left') {
            direction = 3;
        } else if (key.name === 'right') {
            direction = 1;
        } else if (key.name === 'escape') {
            gameOver();
        }
    }
});
process.stdin.setRawMode(true);
process.stdin.resume();

drawBorder();

var snakePosition = {
    'x': Math.round(numRows / 2),
    'y': Math.round(numRows / 2)
};
var applesPosition = [];

for (i = 0; i < numApples; i++) {
    newApple();
}
drawApples();
drawSnake();
printInfos();
game();

function game() {
    const timer = setInterval(() => {
        removeSnake();
        snakeMove();
        drawSnake();
        var snakeStatus = checkSnake();
        if (snakeStatus === 1) {
            gameOver();
        } else if (snakeStatus === 2) {
            eatApple();
            newApple();
            drawApples();
            printInfos();
            clearInterval(timer);
            return game();
        }
    }, speed);
}

function snakeMove() {
    switch (direction) {
        case 0:
            snakePosition.y += 1;
            break;
        case 1:
            snakePosition.x += 1;
            break;
        case 2:
            snakePosition.y -= 1;
            break;
        case 3:
            snakePosition.x -= 1;
            break;
        default: break;
    }
}

function checkSnake() {
    // 1:  snake hit border
    // 2:  snake ate apple

    if (snakePosition.x < 2 ||
        snakePosition.y < 2 ||
        snakePosition.x === numRows + 2 ||
        snakePosition.y === numRows + 2) {
        return 1;
    }
    for (i = 0; i < applesPosition.length; i++) {
        if (snakePosition.x === applesPosition[i].x + 2 && snakePosition.y === applesPosition[i].y + 2) return 2;
    }
}

function drawSnake() {
    process.stdout.write('\x1B[?25h');
    cursor.bg.green().hex("#000703");
    cursor.goto(snakePosition.x, snakePosition.y).write(' ');
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

function removeSnake() {
    process.stdout.write('\x1B[?25h');
    cursor.bg.black();
    cursor.goto(snakePosition.x, snakePosition.y).write(' ');
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

function drawApples() {
    process.stdout.write('\x1B[?25h');
    cursor.bg.red().hex("#100000");
    for (i = 0; i < applesPosition.length; i++) {
        cursor.goto(applesPosition[i].x + 2, applesPosition[i].y + 2).write(' ');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

function newApple() {
    do {
        var appleGenerated = true;
        var curApplePos = {
            'x': Math.round(Math.random() * (numRows - 1)),
            'y': Math.round(Math.random() * (numRows - 1))
        };
        if (curApplePos.x + 2 === snakePosition.x && curApplePos.y + 2 === snakePosition.y) { appleGenerated = false; }
        else { appleGenerated = true; }
        for (i = 0; i < applesPosition.length && appleGenerated; i++) {
            if (curApplePos.x === applesPosition[i].x && curApplePos.y === applesPosition[i].y) {
                appleGenerated = false;
            }
        }
    } while (!appleGenerated);
    applesPosition.push(curApplePos);
}

function eatApple() {
    for (i = 0; i < applesPosition.length; i++) {
        if (applesPosition[i].x + 2 === snakePosition.x && applesPosition[i].y + 2 === snakePosition.y) {
            for (j = i; j < applesPosition.length - 1; j++) {
                applesPosition[j] = applesPosition[j + 1];
            }
            applesPosition.pop();
            numEatenApples += 1;
            if (speed > 100) {
                speed -= 50;
            }
            return;
        }
    }
}

function drawBorder() {
    process.stdout.write('\x1B[?25h');
    cursor.bg.grey();
    for (i = 0; i < numRows + 3; i++) {
        cursor.goto(i, 0).write(' ');
    }
    for (i = 0; i < numRows + 3; i++) {
        cursor.goto(i, numRows + 2).write(' ');
    }
    for (i = 0; i < numRows + 3; i++) {
        cursor.goto(0, i).write(' ');
    }
    for (i = 0; i < numRows + 3; i++) {
        cursor.goto(numRows + 2, i).write(' ');
    }
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

function printInfos() {
    process.stdout.write('\x1B[?25h');
    cursor.bold();
    cursor.goto(1, numRows + 4).write("Apples:\t" + numEatenApples);
    cursor.goto(1, numRows + 5).write("Speed:\t" + speed + '  ');
    cursor.reset();
    process.stdout.write('\x1B[?25l');
}

function printUsage() {
    console.error('node snake.js (-a <numApples> | -r <numRows>)');
    process.exit();
}

function gameOver() {
    process.stdout.write('\x1B[?25h');
    cursor.bg.hex("#100000").red();
    cursor.goto(Math.round(numRows / 2) - 3, Math.round(numRows / 2) + 1).write("Game Over!");
    cursor.goto(1, numRows + 6);
    cursor.reset();
    process.exit();
}
