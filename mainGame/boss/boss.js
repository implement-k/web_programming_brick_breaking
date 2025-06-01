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
        // this.originUser = user.clone();
        // this.user = user.clone();
        this.difficulty = difficulty;
        this.draw = this.draw.bind(this);
    }

    init(difficulty) {
        // 화면 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ball = new Ball(WIDTH/2, HEIGHT-150, 2, -2);
        this.paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
        this.hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
        this.bossManager.init(difficulty);
        this.projectileManager.init(difficulty);
        // user = this.originUser.clone();
        this.isStarted = true;
        this.draw();
    }

    draw() {
        if (!this.isStarted) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.background.complete) {
            ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        }

        // 보스와 공의 충돌 체크
        this.bossManager.collisionDetection(this.ball);
        this.paddle.collisionDetection(this.ball);

        // 발사체 관리
        this.bossManager.manageProjectile(this.projectileManager);
        this.projectileManager.draw();

        // 그리기
        this.ball.draw();
        this.paddle.draw();
        this.bossManager.draw();
        // this.user.draw();
        user.draw();

        // 패들 이동 및 기울기 처리
        this.paddle.updateRocation(canvas, leftPressed, rightPressed);

        // 공 회전 및 이동
        this.ball.updateRotation();
        this.ball.updateLocation();

        // 벽 충돌 처리
        if(this.ball.x + this.ball.width > canvas.width || this.ball.x < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.y < 0) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.height > canvas.height) {
            this.isStarted = false;
            return;
        }

        requestAnimationFrame(this.draw);
    }
}
