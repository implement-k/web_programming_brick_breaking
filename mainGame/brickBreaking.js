// 설정
const WIDTH = 900;
const HEIGHT = 650;
const PADDLE_SPEED = 7; // paddle 속도
const BALL_X_SPEED = 1;   // 공 x축으로 움직이는 속도
const BALL_Y_SPEED = 1;   // 공 y축으로 움직이는 속도
const BALL_STYLE = 0;   // 공 스타일 (0: wood, 1: stone, 2: iron, 3: gold, 4: diamond)

let STEP = 0;               // 난이도(0: 쉬움, 1: 보통, 2: 어려움)
// 전역 변수로 선언
let canvas, ctx;
// 배경화면 (오버월드, 네더월드, 엔더월드)
const overworld = new Image();
overworld.src = 'mainGame/background/overworld.png';
overworld.onload = function() {
    if (ctx) drawStartScreen();
};

const BACKGROUND_IMAGES = [
    overworld,
];

const HOTBAR_IMG = new Image();
HOTBAR_IMG.src = 'mainGame/hotbar/hotbar.png';
HOTBAR_IMG.onload = function() {
    if (ctx) drawStartScreen();
}

const ballStyle = [
    'mainGame/ball/wood.png',
    'mainGame/ball/stone.png',
    'mainGame/ball/iron.png',
    'mainGame/ball/gold.png',
    'mainGame/ball/diamond.png'
];
const brickRowCount = 8;
const brickColumnCount = 18;
// const tmpcnt = 0
// const brickRowCount = tmpcnt;
// const brickColumnCount = tmpcnt;
const brickStyle = [
    ['mainGame/bricks/overworld/stone.png', 
    'mainGame/bricks/overworld/wood.png',
    'mainGame/bricks/overworld/iron.png', 
    'mainGame/bricks/overworld/gold.png',
    'mainGame/bricks/overworld/diamond.png'],

    ['mainGame/bricks/nether/netherrack.png',
    'mainGame/bricks/nether/mangrove.png',
    'mainGame/bricks/nether/quartz.png',
    'mainGame/bricks/nether/nether_gold.png',
    'mainGame/bricks/nether/ancient.png'], 

    ['mainGame/bricks/ender/end_stone.png',
    'mainGame/bricks/ender/end_bricks.png',
    'mainGame/bricks/ender/amethyst.png',
    'mainGame/bricks/ender/raw_gold.png',
    'mainGame/bricks/ender/obsidian.png'
    ]]; // 오버월드, 네더월드, 엔더월드
const bricks = [];
const brickSize = 50;      // 블록 크기
const brickPadding = 0;
const brickOffsetTop = 0;  // 위쪽 여백 증가
const brickOffsetLeft = 0;  // 좌우 여백 증가

// 블럭 별 생성 확률 [ 돌, 나무, 철, 금, 다이아 순서 ]
const brickRatio = [0.4, 0.625, 0.85, 0.95, 1.0];
const brickImages = [[],[],[]];     // 벽돌 이미지 저장하는 배열

for(let i = 0; i < brickStyle.length; i++) {    // 벽돌 이미지 불러오는 반복문
    for(let j = 0; j < brickStyle[i].length; j++) {
        const img = new Image();
        img.src = brickStyle[i][j];
        brickImages[i].push(img);
    }
};

// 아이템 이미지 경로 저장 배열
const itemPaths = [
    'mainGame/items/wood.png',
    'mainGame/items/iron.png',
    'mainGame/items/gold.png',
    'mainGame/items/diamond.png',
    'mainGame/items/stick.png'
];

const itemImages = [];

for(let i = 0; i < itemPaths.length; i++) {
    const img = new Image();
    img.src = itemPaths[i];
    itemImages.push(img);
}

// 먹은 아이템
let havingItems = new Map();

// 블럭 파괴 시 아이템 드랍
let fallingItems = [];

// 게임 진행 전역 변수
let gameStarted = false;
let isClear = false;
let gameDifficulty = 3;     // 난이도

// 키보드 컨트롤
let rightPressed = false;
let leftPressed = false;

// 게임 오브젝트 설정
const ball = {
    x: HEIGHT / 2,
    y: WIDTH - 50,  // 공의 시작 위치 조정
    width: 20,       // 막대 모양의 공
    height: 20,
    dx: BALL_X_SPEED,
    dy: BALL_Y_SPEED,
    rotation: 0,
    speed: 0,
    image: new Image()
};

const paddle = {
    width: 99,
    height: 33,
    x: WIDTH / 2 - 50,
    y: HEIGHT - 150,  // 패들 위치를 위로 조정
    dx: 0,
    tilt: 0,
    maxTilt: Math.PI / 6  // 30도
};

const hotbar = {
    src: HOTBAR_IMG,
    x: WIDTH /2 - 195,
    y: HEIGHT - 60,
    width: 390,
    height: 54
}

const PADDLE_IMAGE = new Image();
PADDLE_IMAGE.src = 'mainGame/paddle/slime.png';

ball.image.src = ballStyle[BALL_STYLE];

const SOUND_EFFECT = {
    paddle: new Audio('mainGame/paddle/slime.ogg'),
    eatItem: new Audio('mainGame/paddle/pop.mp3'),
    death: new Audio('mainGame/etc_sound/death.mp3'),
    clear: new Audio('mainGame/etc_sound/levelup.mp3')
};

$(document).ready(function () {
    // canvas load
    canvas = $('#gameCanvas')[0];
    ctx = canvas.getContext('2d');

    // 초기 화면 그리기
    init();
    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);

    // 시작 버튼 처리
    $('#startButton').click(function() {
        $('#gameCanvas').show();
        gameStarted = true;
        $(this).hide();
        draw();
    });
    // 리스폰 버튼 처리
    $('#respawn').click(() => {
        init();
        $('.dead').hide();
        gameStarted = true;
        draw();
    });
})

// requestAnimationFrame 프레임 따라서 속도 달라짐 -> 속도 조정 필요
// 초기화 함수
function init() {
    // 공 초기화
    ball.x = WIDTH / 2;
    ball.y = HEIGHT - 110;
    ball.rotation = 0;
    ball.speed = 0;
    
    // 패들 초기화
    paddle.x = WIDTH / 2 - 50;
    paddle.y = HEIGHT - 100;
    paddle.tilt = 0;

    drawStartScreen();
    havingItems = new Map();
    fallingItems = [];

    let sc = 0, wc = 0, ic  = 0, gc = 0, dc = 0;

    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            if(Math.random() > 0.3) {  // 70% 확률로 벽돌 생성
                let brickType = Math.random();
                if(brickType < brickRatio[0]) {
                    bricks[c][r] = { x: 0, y: 0, status: 1, life: 1};
                    sc++;
                } else if(brickType < brickRatio[1]) {
                    bricks[c][r] = { x: 0, y: 0, status: 2, life: 1};
                    wc++;
                } else if(brickType < brickRatio[2]) {
                    bricks[c][r] = { x: 0, y: 0, status: 3, life: 2};
                    ic++;
                } else if(brickType < brickRatio[3]) {
                    bricks[c][r] = { x: 0, y: 0, status: 4, life: 2};
                    gc++;
                } else {
                    bricks[c][r] = { x: 0, y: 0, status: 5, life: 3};
                    dc++;
                }
            } else {
                bricks[c][r] = { x: 0, y: 0, status: 0 };
            }
        }
    }
}

// 초기 화면 그리기
function drawStartScreen() {
    if (BACKGROUND_IMAGES[STEP].complete) {
        ctx.drawImage(BACKGROUND_IMAGES[STEP], 0, 0, canvas.width, canvas.height);
    }
    if (hotbar.src.complete) {
        ctx.drawImage(hotbar.src, hotbar.x, hotbar.y, hotbar.width, hotbar.height);
    }
    
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("벽돌깨기 게임", canvas.width/2, canvas.height/2);
}

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// 충돌 감지
function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status >= 1) {
                if(ball.x + ball.width > b.x && 
                    ball.x < b.x + brickSize &&
                    ball.y + ball.height > b.y && 
                    ball.y < b.y + brickSize) {
                    ball.dy = -ball.dy;
                    let tmp = b.status;
                    if(b.life === 1) {
                        b.status = 0;
                        

                        if(tmp >= 2 && tmp <= 5) {
                            const itemType = tmp - 2;
                            fallingItems.push({
                                x: b.x + brickSize / 2 - 16,
                                y: b.y + brickSize / 2 - 16,
                                width: 32,
                                height: 32,
                                dy: 1,
                                image: itemImages[itemType],
                                type: itemType
                            });
                        }
                    } else {
                        b.life--;
                    }
                }
            }
        }
    }
}

// 떨어지는 아이템 그리기
function drawFallingItems() {
    let deleteIdx = [];
    for(let i = 0; i < fallingItems.length; i++) {
        const item = fallingItems[i];
        // 슬라임 영역 안에 있을 때 아이템 먹기
        if (item.y + item.height > paddle.y &&
            item.y < paddle.y + paddle.height &&
            item.x + item.width > paddle.x &&
            item.x < paddle.x + paddle.width
        ) {
            SOUND_EFFECT.eatItem.play();
            deleteIdx.push(i);
            continue;
        }
        item.y += item.dy;

        // 아이템 그리기
        ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
    }
    
    // fallingItem에서 아이템 제거 및 인벤토리에 추가
    for (let i = deleteIdx.length-1; i >= 0; i--) {
        const itemType = fallingItems[deleteIdx[i]].type;
        if (!havingItems.has(itemType)) havingItems.set(itemType, 0);
        havingItems.set(itemType, havingItems.get(itemType)+1);
        fallingItems.splice(deleteIdx[i], 1);
    }
}

// 패들과 공의 충돌 처리
function paddleCollision() {
    if(ball.y + ball.height > paddle.y &&
        ball.x + ball.width > paddle.x && 
        ball.x < paddle.x + paddle.width) {
        SOUND_EFFECT.paddle.play();
        
        // 충돌 위치에 따른 반사 각도 조정
        const hitPoint = (ball.x + ball.width/2 - paddle.x) / paddle.width;
        // 기본 반사 각도 (-45도 ~ 45도)
        const baseAngle = (hitPoint - 0.5) * Math.PI/2;
        // 패들의 기울기를 반사 각도에 추가
        const angle = baseAngle + paddle.tilt;
        
        // 기울기에 따른 속도 증가 (최대 50% 증가)
        const tiltSpeedBonus = 1 + Math.abs(paddle.tilt / paddle.maxTilt) * 0.5;
        const baseSpeed = Math.sqrt(BALL_X_SPEED * BALL_X_SPEED + BALL_Y_SPEED * BALL_Y_SPEED);
        const speed = baseSpeed * tiltSpeedBonus;
        
        // 새로운 속도와 방향 계산
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
    }
}

// 게임 오브젝트 그리기
function drawBall() {
    ctx.save();
    ctx.translate(ball.x + ball.width/2, ball.y + ball.height/2);
    ctx.rotate(ball.rotation);

    if (ball.image.complete) {
        ctx.drawImage(
            ball.image,
            -ball.width/2,
            -ball.height/2,
            ball.width + 10,
            ball.height + 4
        );
    } else {
        ctx.fillStyle = "#0095DD";
        ctx.fillRect(-ball.width/2, -ball.height/2, ball.width, ball.height);
    }

    ctx.restore();
}

// 패들 그리기
function drawPaddle() {
    ctx.save();
    ctx.translate(paddle.x + paddle.width/2, paddle.y + paddle.height/2);
    ctx.rotate(paddle.tilt);
    for (let i = 0; i<3; i++) {
        ctx.drawImage(
            PADDLE_IMAGE,
            -paddle.width/2+paddle.width/3*i, 
            -paddle.height/2, 
            paddle.width/3, paddle.height);
    }
    ctx.restore();
}

function drawBricks(difficulty) {
    let cnt = 0;
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status >= 1) {
                cnt ++;
                const brickX = (c * (brickSize + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickSize + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                const img = brickImages[difficulty - 1][bricks[c][r].status - 1];
                ctx.drawImage(img, brickX, brickY, brickSize, brickSize);

                //ctx.fillStyle = "#0095DD";
                //ctx.fillRect(brickX, brickY, brickSize, brickSize);
            }
        }
    }

    // 블록이 하나도 없고, 떨어지고 있는 아이템이 없다면 클리어
    if (cnt == 0 && fallingItems.length == 0) isClear = true;
}

// 핫바 그리기
function drawHotbar() {
    ctx.save();
    // 핫바 그리기
    ctx.drawImage(hotbar.src, hotbar.x, hotbar.y, hotbar.width, hotbar.height);

    // 핫바 속 아이템 그리기
    let i = 0;
    for (let [itemType, count] of havingItems.entries()) {
        // 아이템
        ctx.drawImage(itemImages[itemType], hotbar.x + 11 + i*42, hotbar.y + 8, 33, 33);
        
        // 아이템 개수
        if (count == 1) {
            i++;
            continue;
        }
        ctx.font = "20px Minecraftia";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(0, 0, 0, .5)";
        ctx.fillText(count, hotbar.x + 53 + 42*i, hotbar.y + 46);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(count, hotbar.x + 50 + 42*i, hotbar.y + 43);
        
        i++;
    }
}

// 죽을때
function gameover() {
    gameStarted = false;
    SOUND_EFFECT.death.play();
    $('.dead').css('display', 'flex');
}

// 클리어
function gameclear() {
    SOUND_EFFECT.clear.play();
    $('.clear').css('display', 'flex');
    for (let [itemType, count] of havingItems.entries()) {
        const newDiv = document.createElement('div');
        newDiv.className = 'clear_item';
        newDiv.css({})

        // 아이템
        ctx.drawImage(itemImages[itemType], hotbar.x + 11 + i*42, hotbar.y + 8, 33, 33);
        
        // 아이템 개수
        if (count == 1) {
            i++;
            continue;
        }
        ctx.font = "20px Minecraftia";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(0, 0, 0, .5)";
        ctx.fillText(count, hotbar.x + 53 + 42*i, hotbar.y + 46);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(count, hotbar.x + 50 + 42*i, hotbar.y + 43);
        
        i++;
    }
    havingItems
}

// 메인 게임 루프
function draw() {
    if (!gameStarted) return;
    if (isClear) {
        gameclear();
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 이미지 그리기
    if (BACKGROUND_IMAGES[STEP] && BACKGROUND_IMAGES[STEP].complete) {
        ctx.drawImage(BACKGROUND_IMAGES[STEP], 0, 0, canvas.width, canvas.height);
    }

    drawBricks(gameDifficulty);
    drawBall();
    drawPaddle();
    drawFallingItems();
    collisionDetection();
    paddleCollision();
    drawHotbar();

    // 패들 이동 및 기울기 처리
    if(rightPressed) {
        paddle.dx = PADDLE_SPEED;
        paddle.tilt = Math.min(paddle.tilt + 0.1, paddle.maxTilt);
    }
    else if(leftPressed) {
        paddle.dx = -PADDLE_SPEED;
        paddle.tilt = Math.max(paddle.tilt - 0.1, -paddle.maxTilt);
    }
    else {
        paddle.dx = 0;
        paddle.tilt *= 0.95; // 기울기 점차 감소
    }

    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x + paddle.dx));

    // 공 회전 및 이동
    if(ball.dx > 0) {
        ball.rotation -= 0.1 * Math.abs(ball.dx); // 반시계 방향
    } else {
        ball.rotation += 0.1 * Math.abs(ball.dx); // 시계 방향
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // 벽 충돌 처리
    if(ball.x + ball.width > canvas.width || ball.x < 0) {
        ball.dx = -ball.dx;
    }
    if(ball.y < 0) {
        ball.dy = -ball.dy;
    }
    
    else if(ball.y + ball.height > canvas.height) {
        gameover();
    }

    requestAnimationFrame(draw);
}