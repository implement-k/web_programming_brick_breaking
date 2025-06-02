let bossGame;

class BossGame {
    backgroundDir = [
        'mainGame/background/overworld_night.jpg',
        'mainGame/background/nether.png',
        'mainGame/background/ender.png'
    ];
    background = new Image();
    // 보스와 발사체 manager
    bossManager; projectileManager;
    // 사용자 아이템, 체력 정보
    originUser;   // 유저 죽을 경우 이전 상태로 초기화
    difficulty;
    isStarted = false;
    ball; paddle; hotbar;

    constructor(difficulty) {
        this.background.src = this.backgroundDir[difficulty-1];
        this.bossManager = new BossManager(difficulty);
        this.projectileManager = new ProjectileManager(difficulty);
        user.init();
        this.difficulty = difficulty;
        this.draw = this.draw.bind(this);
    }

    init(difficulty) {
        // 화면 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.background.src = this.backgroundDir[difficulty-1];
        this.ball = new Ball(WIDTH/2, HEIGHT-150, 2, -2);
        this.paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
        this.hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
        this.bossManager.init(difficulty);
        this.projectileManager.init(difficulty);
        user.init();
        this.isStarted = true;

        let sword_name = user.equippedItems.get("sword");
        if(sword_name == "wooden_sword") this.ball.image.src = 'mainGame/items/sword/wooden_sword.png';
        else if(sword_name == "iron_sword") this.ball.image.src = 'mainGame/items/sword/iron_sword.png';
        else if(sword_name == "golden_sword") this.ball.image.src = 'mainGame/items/sword/golden_sword.png';
        else if(sword_name == "diamond_sword") this.ball.image.src = 'mainGame/items/sword/diamond_sword.png';

        requestAnimationFrame((time) => this.draw(time));
    }

    draw(currentTime) {
        if (!this.isStarted) return;
        if (user.isDead()) {
            SOUND_EFFECT.death.play();
	        $('.dead').css('display', 'flex');
            return
        }

        // 보스가 죽었는지 확인하고 다음 스토리로 진행
        if (this.bossManager.isDying()) {
            this.isStarted = false;
            // 보스 죽음 후 잠시 대기 (1.5초)
            setTimeout(() => {
                if (gameDifficulty < 3) {
                    startStory(gameDifficulty + 1);
                } else {
                    startStory(4); // 3라운드 끝나면 종료 스토리(4라운드) 시작
                }
            }, 1500);
            return;
        }

        // deltaTime 계산 (120fps 기준)
        const deltaTime = currentTime - (this.draw.lastTime || currentTime);
        this.draw.lastTime = currentTime;

        const TARGET_FPS = 120;
        const timeStep = 1000 / TARGET_FPS;
        const deltaMultiplier = deltaTime / timeStep; // 프레임 독립적 속도 보정값

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.background.complete) {
            ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        }


        this.bossManager.collisionDetection(this.ball); // 보스 - 공 충돌
        this.paddle.collisionDetection(this.ball);      // 공 - 패들 충돌
        this.projectileManager.checkCollisions(deltaMultiplier);   // 발사체 - 유저 충돌 (프레임 독립적)
        this.bossManager.attack(this.projectileManager);    // 보스 - 발사체 발사

        // 그리기
        this.ball.draw();
        this.paddle.draw();
        this.bossManager.draw(deltaMultiplier);
        // this.user.draw();
        user.draw();

        // 패들 이동 및 기울기 처리 (프레임 독립적)
        this.paddle.updateRocation(canvas, leftPressed, rightPressed, deltaMultiplier);

        // 공 회전 및 이동 (프레임 독립적)
        this.ball.updateRotation(deltaMultiplier);
        this.ball.updateLocation(deltaMultiplier);

        // 벽 충돌 처리
        if(this.ball.x + this.ball.width > canvas.width || this.ball.x < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.y < 0) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.height > canvas.height) {
            this.ball = new Ball(WIDTH/2, HEIGHT-150, 2, -2);
            let sword_name = user.equippedItems.get("sword");
            if(sword_name == "wooden_sword") this.ball.image.src = 'mainGame/items/sword/wooden_sword.png';
            else if(sword_name == "iron_sword") this.ball.image.src = 'mainGame/items/sword/iron_sword.png';
            else if(sword_name == "golden_sword") this.ball.image.src = 'mainGame/items/sword/golden_sword.png';
            else if(sword_name == "diamond_sword") this.ball.image.src = 'mainGame/items/sword/diamond_sword.png';
            user.hit(1, 1);
        }

        requestAnimationFrame((time) => this.draw(time));
    }
}
