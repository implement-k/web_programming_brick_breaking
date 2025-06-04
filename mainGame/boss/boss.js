let bossGame;

class BossGame {
    backgroundDir = [
        'mainGame/background/overworld_night.jpg',
        'mainGame/background/nether.png',
        'mainGame/background/ender.png'
    ];
    background = new Image();
    bossManager; projectileManager;
    originUser;  
    difficulty;
    isStarted = false;
    ball; paddle; hotbar;

    bossStartTime = null;
    bossEndTime = null;


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
        this.ball = new Ball(canvas.width/2 - 10, canvas.height-150, 1, 1); 
        this.paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
        this.hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
        this.bossManager.init(difficulty);
        this.projectileManager.init(difficulty);
        
        this.originUser = user.clone();
        // user.init(); 
        
        this.isStarted = true;
        this.bossStartTime = Date.now();

        let sword_name = user.equippedItems.get("sword");
        if(sword_name == "wooden_sword") this.ball.image.src = 'mainGame/items/sword/wooden_sword.png';
        else if(sword_name == "iron_sword") this.ball.image.src = 'mainGame/items/sword/iron_sword.png';
        else if(sword_name == "golden_sword") this.ball.image.src = 'mainGame/items/sword/golden_sword.png';
        else if(sword_name == "diamond_sword") this.ball.image.src = 'mainGame/items/sword/diamond_sword.png';

        requestAnimationFrame((time) => this.draw(time));
    }

    draw(currentTime) {
        if (!this.isStarted) return;
        console.log('유저 죽음 상태: ', user.isDead(), user.heart.health);
        if (user.isDead()) {
            SOUND_EFFECT.death.play();
	        $('.dead').css('display', 'flex');
            return
        }

        if (this.bossManager.isDying()) {
            this.bossEndTime = Date.now();
            user.score += (this.difficulty * 10000) - (Math.floor((this.bossEndTime - this.bossStartTime) / 1000) * 50);

            this.isStarted = false;
            setTimeout(() => {
                const currentUserState = user.clone();
                
                if (gameDifficulty < 3) {
                    startStoryWithUserState(gameDifficulty + 1, currentUserState);
                } else {

                    let li = $("<li />");
                    li.text(`${userName} - ${user.score}`);
                    $('#score-list').append(li);

                    startStory(4);
                }
            }, 1500);
            return;
        }

        // deltaTime 계산 (120fps 기준)
        const deltaTime = currentTime - (this.draw.lastTime || currentTime);
        this.draw.lastTime = currentTime;

        const TARGET_FPS = 120; 
        const timeStep = 1000 / TARGET_FPS;
        const deltaMultiplier = deltaTime / timeStep; 

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.background.complete) {
            ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        }


        this.bossManager.collisionDetection(this.ball); // 보스 - 공 충돌
        this.paddle.collisionDetection(this.ball);      // 공 - 패들 충돌
        this.projectileManager.checkCollisions(deltaMultiplier, this.paddle);   // 발사체 - 유저 충돌 
        this.bossManager.attack(this.projectileManager);    // 보스 - 발사체 발사

        // 그리기
        this.ball.draw();
        this.paddle.draw();
        this.bossManager.draw(deltaMultiplier);
        // this.user.draw();
        user.draw();

        this.paddle.updateRocation(canvas, leftPressed, rightPressed, deltaMultiplier);

        this.ball.updateRotation(deltaMultiplier);
        this.ball.updateLocation(deltaMultiplier);

        // 벽 충돌 처리
        if(this.ball.x + this.ball.width > canvas.width || this.ball.x < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.y < 0) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.height > canvas.height) {
            this.ball = new Ball(canvas.width/2 - 10, canvas.height-150, 1, -1); 
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
