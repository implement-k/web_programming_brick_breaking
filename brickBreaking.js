// 설정
const WIDTH = 800;      // canvas 넓이
const HEIGHT = 600;     // canvas 높이
const PADDLE_SPEED = 7; // paddle 속도
const BALL_X_SPEED = 1;   // 공 x축으로 움직이는 속도
const BALL_Y_SPEED = 1;   // 공 y축으로 움직이는 속도
const BALL_STYLE = 0;   // 공 스타일 (0: wood, 1: stone, 2: iron, 3: gold, 4: diamond)
// 배경화면 (오버월드, 네더월드, 엔더월드)
const BACKGROUND_IMAGES = [];

const ballStyle = [
    'mainGame/ball/wood.png',
    'mainGame/ball/stone.png',
    'mainGame/ball/iron.png',
    'mainGame/ball/gold.png',
    'mainGame/ball/diamond.png'
];
const brickRowCount = 10;
const brickColumnCount = 15;
const brickStyle = [
    ['mainGame/bricks/overworld/stone.png', 'mainGame/bricks/overworld/iron.png', 'mainGame/bricks/overworld/diamond.png'], 
    [], 
    []]; // 오버월드, 네더월드, 엔더월드
const bricks = [];
const brickSize = 40;      // 블록 크기
const brickPadding = 1;
const brickOffsetTop = 50;  // 위쪽 여백 증가
const brickOffsetLeft = 0;  // 좌우 여백 증가

// 게임 진행 전역 변수
let gameStarted = false;
let step = 1;               // 난이도
// 키보드 컨트롤
let rightPressed = false;
let leftPressed = false;

// 게임 오브젝트 설정
const ball = {
    x: WIDTH / 2,
    y: HEIGHT - 50,  // 공의 시작 위치 조정
    width: 40,       // 막대 모양의 공
    height: 40,
    dx: BALL_X_SPEED,
    dy: BALL_Y_SPEED,
    rotation: 0,
    speed: 0,
    image: new Image()
};

const paddle = {
    width: 100,
    height: 20,
    x: WIDTH / 2 - 50,
    y: HEIGHT - 40,  // 패들 위치를 위로 조정
    dx: 0,
    tilt: 0,
    maxTilt: Math.PI / 6  // 30도
};

ball.image.src = ballStyle[BALL_STYLE];

// 전역 변수로 선언
let canvas, ctx;

$(document).ready(function () {
    // canvas load
    canvas = $('#gameCanvas')[0];
    ctx = canvas.getContext('2d');

    // 초기 화면 그리기
    drawStartScreen();
    
    // 벽돌 초기화
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            if(Math.random() > 0.3) {  // 70% 확률로 벽돌 생성
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            } else {
                bricks[c][r] = { x: 0, y: 0, status: 0 };
            }
        }
    }

    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);

    // 시작 버튼 이벤트 처리
    $('#startButton').click(function() {
        gameStarted = true;
        $(this).hide();
        draw();
    });
})

// requestAnimationFrame 프레임 따라서 속도 달라짐 -> 속도 조정 필요

// 초기 화면 그리기
function drawStartScreen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#0095DD";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("벽돌깨기 게임", WIDTH/2, HEIGHT/2);
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
            if(b.status === 1) {
                if(ball.x + ball.width > b.x && 
                    ball.x < b.x + brickSize &&
                    ball.y + ball.height > b.y && 
                    ball.y < b.y + brickSize) {
                    b.status = 0;
                    ball.dy = -ball.dy;
                }
            }
        }
    }
}

// 패들과 공의 충돌 처리
function paddleCollision() {
    if(ball.y + ball.height > paddle.y &&
        ball.x + ball.width > paddle.x && 
        ball.x < paddle.x + paddle.width) {
        
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

function drawPaddle() {
    ctx.save();
    ctx.translate(paddle.x + paddle.width/2, paddle.y + paddle.height/2);
    ctx.rotate(paddle.tilt);
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(-paddle.width/2, -paddle.height/2, paddle.width, paddle.height);
    ctx.restore();
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                const brickX = (c * (brickSize + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickSize + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.fillStyle = "#0095DD";
                ctx.fillRect(brickX, brickY, brickSize, brickSize);
            }
        }
    }
}

// 메인 게임 루프
function draw() {
    if (!gameStarted) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    paddleCollision();

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
        // 게임 오버 조건
        alert("게임 오버!");
        document.location.reload();
    }

    requestAnimationFrame(draw);
}