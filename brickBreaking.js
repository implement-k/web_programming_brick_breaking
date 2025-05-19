const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
let gameStarted = false;

// 초기 화면 그리기
function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0095DD";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("벽돌깨기 게임", canvas.width/2, canvas.height/2);
}

// 시작 화면 표시
drawStartScreen();

// 게임 기본 설정
const PADDLE_SPEED = 7;
const BALL_X_SPEED = 1.5;
const BALL_Y_SPEED = 1.5;

// 게임 오브젝트 설정
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,  // 공의 시작 위치도 조정
    width: 40,  // 막대 모양의 공
    height: 8,
    dx: BALL_X_SPEED,
    dy: BALL_Y_SPEED,
    rotation: 0,
    speed: 0
};

const paddle = {
    width: 100,
    height: 10,
    x: canvas.width / 2 - 50,
    y: canvas.height - 40,  // 패들 위치를 위로 조정
    dx: 0,
    tilt: 0,
    maxTilt: Math.PI / 6  // 30도
};

const brickRowCount = 5;
const brickColumnCount = 8;
const bricks = [];
const brickWidth = 30;  // 블록 크기 축소
const brickHeight = 30;  // 블록 크기 축소
const brickPadding = 10;
const brickOffsetTop = 50;  // 위쪽 여백 증가
const brickOffsetLeft = 85;  // 좌우 여백 증가

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

// 키보드 컨트롤
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

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
                    ball.x < b.x + brickWidth &&
                    ball.y + ball.height > b.y && 
                    ball.y < b.y + brickHeight) {
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
    ctx.fillStyle = "#0095DD";
    ctx.fillRect(-ball.width/2, -ball.height/2, ball.width, ball.height);
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
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.fillStyle = "#0095DD";
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
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

// 시작 버튼 이벤트 처리
startButton.addEventListener('click', function() {
    gameStarted = true;
    startButton.style.display = 'none';
    draw();
});