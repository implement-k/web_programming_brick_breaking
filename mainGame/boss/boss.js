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
        this.originUser = user.clone();
        this.user = user.clone();
        this.difficulty = difficulty;
        // draw 메서드의 this 바인딩 유지
        this.draw = this.draw.bind(this);
    }

    init() {
        // 화면 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ball = new Ball(WIDTH/2, HEIGHT-150);
        this.paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
        this.hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
        this.bossManager.init();
        this.projectileManager.init();
        user = this.originUser.clone();
        this.isStarted = true;
        this.draw();
    }

    setDifficulty(difficulty) {
        this.background.src = this.backgroundDir[difficulty-1];
        this.bossManager.setBoss(difficulty);
        this.difficulty = difficulty;
    }

    draw() {
        if (!this.isStarted) return;
        if (this.bossManager.isDead()) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        this.ball.draw();                   // 칼
        this.paddle.draw();                 // 패들
        this.bossManager.draw();            // 보스, 보스 체력
        this.projectileManager.draw();      // 발사체
        this.user.draw();                   // hotbar, 레벨, 체력, 갑바, 시간
        this.paddle.collisionDetection(this.ball);   // 패들 - 공 충돌관리
        // 발사체 - 패들 충돌 관리
        // 공 - 보스 충돌 관리

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
        }
        // 체력 관리
        else if(this.ball.y + this.ball.height > canvas.height) {
            this.gameover();
        }
        requestAnimationFrame(this.draw);
    }
}
