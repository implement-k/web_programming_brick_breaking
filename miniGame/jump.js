let miniLastDrawTime = null;
const miniDefaultFPS = 60;  // 120 → 60으로 변경
const miniDefaultDeltaTime = 1000 / miniDefaultFPS;

// 미니게임을 main.js에서 실행할 수 있도록 추가
function initJumpGame() {
    // gameCanvas 숨기고 miniGameCanvas 보여줌
    const prev = document.getElementById("gameCanvas");
    if (prev) prev.style.display = "none";
    const miniCanvas = document.getElementById("miniGameCanvas");
    miniCanvas.style.display = "block";
    startJumpGame("miniGameCanvas");
}

function startJumpGame(canvasId = "gameCanvas") {
    const jumpCanvas = document.getElementById(canvasId);
    const jumpCtx = jumpCanvas.getContext("2d");
    jumpCtx.imageSmoothingEnabled = false;

    // 캔버스 크기 900x650으로 고정
    jumpCanvas.width = 900;
    jumpCanvas.height = 650;
    const canvasWidth = 900;
    const canvasHeight = 650;

    const charFrame = 7;
    const charSpeed = 5; // 2 → 3 (더 느린 애니메이션)
    const charScale = 0.15;
    const posX = 150;
    const charImg = [];
    let currentFrame = 0;
    let frameInterval = 0;
    let frameDir = 1;

    const groundHeight = 100;
    const groundSpeed = 6;  // 8 → 6로 더 감소
    let groundX = 0;

    const cloudSpeed = 0.8;  // 1.2 → 0.8로 감소
    const cloudImg = [];

    let isJumping = false;
    let jumpVelocity = 0;
    const gravity = 2;
    const jumpPower = -35;
    let posY = 0;
    let baseY = 0;

    const cactusImg = [];
    let cactusList = [];
    let cactusInterval = getRandomInterval();
    let cactusTimer = 0;

    let isGameOver = false;
    let isSuccess = false;
    const gameTotalTime = 15000;
    let startTime = null;

    let loadedCount = 0;
    const groundImg = new Image(); groundImg.src = "miniGame/ground.jpg"; groundImg.onload = onImageLoad;
    const sunImg = new Image(); sunImg.src = "miniGame/sun.png"; sunImg.onload = onImageLoad;

    for (let i = 1; i <= 3; i++) {
        const img = new Image();
        img.src = `miniGame/cloud${i}.png`;
        img.onload = onImageLoad;
        cloudImg.push({ img, x: canvasWidth + i * 200, y: 50 + i * 40 });
    }

    for (let i = 1; i <= charFrame; i++) {
        const img = new Image();
        img.src = `miniGame/run${i}.png`;
        img.onload = onImageLoad;
        charImg.push(img);
    }

    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `miniGame/cactus${i}.png`;
        img.onload = onImageLoad;
        cactusImg.push(img);
    }

    function onImageLoad() {
        loadedCount++;
        if (loadedCount === 16) {
            const height = charImg[0].height * charScale;
            baseY = canvasHeight - groundHeight - height;
            posY = baseY;
            startTime = Date.now();
            requestAnimationFrame(loop);
        }
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && !isJumping && !isGameOver && !isSuccess) {
            isJumping = true;
            jumpVelocity = jumpPower;
        }
    });

    function getRandomInterval() {
        return Math.floor(Math.random() * (120 - 80 + 1)) + 80;  // 25-60 → 80-120으로 간격 증가
    }

    function checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    function drawMessage(text) {
        jumpCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
        jumpCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        jumpCtx.fillStyle = "#fff";
        jumpCtx.font = "48px Galmuri";
        jumpCtx.fillText(text, 300, 300);
        
        // 1.5초 후 메인게임 복귀
        setTimeout(() => {
            if (typeof mainGame !== 'undefined' && mainGame.endMiniGame) {
                mainGame.endMiniGame();
            }
        }, 1500);
    }

    function loop() {
        if (isGameOver) return drawMessage("Game Over!");
        if (isSuccess) return drawMessage("Success!");
        if (Date.now() - startTime >= gameTotalTime) {
            isSuccess = true;
            return drawMessage("Success!");
        }

        jumpCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        const curTime = Date.now();
        const deltaTime = curTime - (miniLastDrawTime || curTime);
        const frameMultiplier = Math.min(deltaTime / miniDefaultDeltaTime, 3);

        miniLastDrawTime = curTime;
        const gradient = jumpCtx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, "#99c1fa");
        gradient.addColorStop(1, "#e0f0ff");
        jumpCtx.fillStyle = gradient;
        jumpCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        jumpCtx.drawImage(sunImg, 40, 40, 180, 180);

        cloudImg.forEach(cloud => {
            cloud.x -= cloudSpeed * frameMultiplier;
            if (cloud.x < -200) cloud.x = canvasWidth + Math.random() * 300;
            jumpCtx.drawImage(cloud.img, cloud.x, cloud.y, 100, 60);
        });

        groundX = Math.floor(groundX);
        const groundY = canvasHeight - groundHeight;
        jumpCtx.drawImage(groundImg, groundX, groundY, canvasWidth + 1, groundHeight);
        jumpCtx.drawImage(groundImg, groundX + canvasWidth, groundY, canvasWidth + 1, groundHeight);
        groundX -= groundSpeed * frameMultiplier;
        if (groundX <= -canvasWidth) groundX = 0;

        if (isJumping) {
            jumpVelocity += gravity * frameMultiplier;
            posY += jumpVelocity * frameMultiplier;
            if (posY >= baseY) {
                posY = baseY;
                isJumping = false;
            }
        }

        const frame = charImg[currentFrame];
        const width = frame.width * charScale;
        const height = frame.height * charScale;
        jumpCtx.drawImage(frame, posX, posY, width, height);

        frameInterval++;
        if (frameInterval >= charSpeed) {
            currentFrame += frameDir;
            if (currentFrame === charFrame - 1 || currentFrame === 0) frameDir *= -1;
            frameInterval = 0;
        }

        cactusTimer++;
        if (cactusTimer >= cactusInterval) {
            const cactus = cactusImg[Math.floor(Math.random() * cactusImg.length)];
            const obsScale = 0.08;
            const obsWidth = cactus.width * obsScale;
            const obsHeight = cactus.height * obsScale;
            cactusList.push({
                img: cactus,
                x: canvasWidth,
                y: canvasHeight - groundHeight - obsHeight,
                width: obsWidth,
                height: obsHeight
            });
            cactusTimer = 0;
            cactusInterval = getRandomInterval();
        }

        cactusList.forEach(obs => {
            obs.x -= groundSpeed * frameMultiplier;  // cactusSpeed 대신 groundSpeed 직접 사용
            obs.x = Math.floor(obs.x);  // 땅과 동일하게 Math.floor() 적용
            jumpCtx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);

            // 충돌 판정을 관대하게 만들기 위해 박스 크기 축소
            const margin = 8; // 여유 공간
            const charBox = { 
                x: posX + margin, 
                y: posY + margin, 
                width: width - margin * 2, 
                height: height - margin * 2 
            };
            const obsBox = { 
                x: obs.x + margin, 
                y: obs.y + margin, 
                width: obs.width - margin * 2, 
                height: obs.height - margin * 2 
            };
            if (checkCollision(charBox, obsBox)) isGameOver = true;
        });

        cactusList = cactusList.filter(obs => obs.x + obs.width > 0);

        // ⏱️ 남은 시간 표시
        const timeLeft = Math.max(0, Math.ceil((gameTotalTime - (Date.now() - startTime)) / 1000));
        jumpCtx.fillStyle = "#333";
        jumpCtx.font = "24px Galmuri";
        jumpCtx.fillText(`${timeLeft}초`, canvasWidth - 110, 50);

        requestAnimationFrame(loop);
    }
}