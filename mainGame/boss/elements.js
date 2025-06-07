// 발사체 class (완성)
class Projectile {
    x; y;
    dx; dy;
    width; height;
    image = new Image();
    damage;
    
    constructor(width, height, damage, imageDir=null, x=0, y=0, dx=0, dy=0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.dx = dx;
        this.dy = dy;
        this.image.src = imageDir;
    }

    create(x, y, dx, dy) {
        return new Projectile(this.width, this.height, this.damage, this.image.src, x, y, dx, dy);
    }
}

// 발사체 관리
class ProjectileManager {
    projectileImageDirs = [
        'mainGame/boss/wither/wither_projectile.png',   // 600, 600
        'mainGame/boss/ghast/ghast_projectile.png',     // 160, 160
        'mainGame/boss/ender_dragon/ender_dragon_projectile.png'    // 160, 160
    ];
    projectiles = [];
    lastFireTime = 0;
    nextFireDelay = 0;
    delay;              // ms단위, delay +- 2초에서 랜덤으로 공격 
    projectileSize = [[40, 40], [40, 40], [40, 40]];
    delaies = [8000, 4000, 3000];   // 공격 간격
    damages = [1, 2, 2];            // 발사체 데미지
    speeds = [1.2, 1.3, 1.4];
    projectile;
    difficulty;
    
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.nextFireDelay = this.getRandomDelay();
        this.delay = this.delaies[difficulty-1];
        this.projectile = new Projectile(
            this.projectileSize[difficulty-1][0],   // width
            this.projectileSize[difficulty-1][1],   // height
            this.damages[difficulty-1],                  // damage
            this.projectileImageDirs[difficulty-1]  // image
        );
        this.difficulty = difficulty;
    }

    // 초기화 함수
    init(difficulty) {
        this.projectiles = [];
        this.lastFireTime = Date.now();
        this.nextFireDelay = this.getRandomDelay();
        this.delay = this.delaies[difficulty-1];
        this.projectile = new Projectile(
            this.projectileSize[difficulty-1][0],   // width
            this.projectileSize[difficulty-1][1],   // height
            this.damages[difficulty-1],                  // damage
            this.projectileImageDirs[difficulty-1]  // image
        );
        this.difficulty = difficulty;
    }

    // 3~5초 딜레이를 반환
    getRandomDelay() {
        return Math.random() * 2000 + this.delay; // 3000~5000ms
    }

    // 발사체 생성
    createProjectiles(boss) {
        let angles = [
            [-this.speeds[this.difficulty-1] * Math.sin(Math.PI/4), this.speeds[this.difficulty-1] * Math.cos(Math.PI/4)],
            [this.speeds[this.difficulty-1] * Math.sin(Math.PI/4), this.speeds[this.difficulty-1] * Math.cos(Math.PI/4)],
            [0, this.speeds[this.difficulty-1]],
            [-this.speeds[this.difficulty-1] * Math.sin(Math.PI/5), this.speeds[this.difficulty-1] * Math.cos(Math.PI/5)],
            [this.speeds[this.difficulty-1] * Math.sin(Math.PI/5), this.speeds[this.difficulty-1] * Math.cos(Math.PI/5)]
        ];

        let maxProjectiles = this.difficulty == 1 ? 2 : (this.difficulty == 2 ? 3 : angles.length);

        for (let i = 0; i < maxProjectiles; i++) {
            this.projectiles.push(this.projectile.create(
                boss.x + boss.width/2,  
                boss.y + boss.height,
                angles[i][0],
                angles[i][1]
            ));
        }
    }

    // 발사체 충돌 체크 및 그리기
    checkCollisions(deltaMultiplier = 1, paddle) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            // 먼저 화면 안에 있는지 체크 
            if (projectile.x + projectile.width < 0 || 
                projectile.x > canvas.width || 
                projectile.y + projectile.height < 0 || 
                projectile.y > canvas.height) {
                this.projectiles.splice(i, 1);
                continue;
            }

            // 이동 전 충돌 체크 
            if (this.isCollidingWithPaddle(projectile, paddle)) {
                user.hit(this.difficulty, projectile.damage);
                this.projectiles.splice(i, 1);
                continue;
            }

            // 발사체 이동
            projectile.x += projectile.dx * deltaMultiplier;
            projectile.y += projectile.dy * deltaMultiplier;

            // 이동 후 충돌 체크 
            if (this.isCollidingWithPaddle(projectile, paddle)) {
                user.hit(this.difficulty, projectile.damage);
                this.projectiles.splice(i, 1);
                continue;
            }

            // 발사체 그리기
            ctx.drawImage(
                projectile.image,
                projectile.x,
                projectile.y,
                projectile.width,
                projectile.height
            );
        }
        user.releaseHit(this.difficulty);
    }

    // 패들 회전 고려한 패들 - 발사체 충돌
    isCollidingWithPaddle(projectile, paddle) {
        // 패들 존재 x
        if (!paddle) {
            console.log('패들이 존재하지 않음');
            return false;
        }
        
        // 패들 회전각
        const paddleRotation = paddle.rotation || paddle.tilt || 0;
        
        // 중심점
        const paddleCenterX = paddle.x + paddle.width / 2;
        const paddleCenterY = paddle.y + paddle.height / 2;
        const projectileCenterX = projectile.x + projectile.width / 2;
        const projectileCenterY = projectile.y + projectile.height / 2;
        
        // 패들 중심점 - 발사체 중심점간 거리가 패들 대각선 길이보다 크면 맞을 수 없음.
        const distance = Math.sqrt(
            Math.pow(projectileCenterX - paddleCenterX, 2) + 
            Math.pow(projectileCenterY - paddleCenterY, 2)
        );
        
        const paddleDiagonal = Math.sqrt(paddle.width * paddle.width + paddle.height * paddle.height);
        if (distance > paddleDiagonal) {
            return false;
        }
        
        // 패들 회전 없는 경우
        if (Math.abs(paddleRotation) < 0.1) {
            return this.defaultCollisionDetection(
                projectile.x, projectile.y, projectile.width, projectile.height,
                paddle.x, paddle.y, paddle.width, paddle.height
            );
        }
        
        // 회전 있는 경우
        // 발사체의 네 모서리 중 하나라도 패들 안에 있으면 충돌
        const corners = [
            [projectile.x, projectile.y],
            [projectile.x + projectile.width, projectile.y],
            [projectile.x + projectile.width, projectile.y + projectile.height],
            [projectile.x, projectile.y + projectile.height]
        ];
        
        for (const [x, y] of corners) {
            const relativeX = x - paddleCenterX;
            const relativeY = y - paddleCenterY;
            
            const cos = Math.cos(-paddleRotation);
            const sin = Math.sin(-paddleRotation);
            
            const rotatedX = relativeX * cos - relativeY * sin;
            const rotatedY = relativeX * sin + relativeY * cos;
            
            // 회전된 좌표가 패들의 경계 안에 있는지 확인
            if (Math.abs(rotatedX) <= paddle.width / 2 && 
                Math.abs(rotatedY) <= paddle.height / 2) {
                return true;
            }
        }
        
        return false;
    }

    // 기본 충돌 감지
    defaultCollisionDetection(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }
}

// bossManager에서 사용하는 클래스
class Boss{
    health;                     // 보스 피 (health번 만큼 맞으면 죽음)
    x; y;                       // 보스 위치
    defaultY;                   // sin파 y축 위치
    dx; dy;                     // dx: 가로 속도, dy: 위 아래로 움직이는 속도
    width; height;              // 보스 크기
    originalImage = new Image() // 일반 이미지 저장
    imageSpawn = new Image()    // 스폰 이미지 저장
    image = new Image();        // 보스 이미지
    imageAngry = new Image();   // 공격시 보스 이미지
    imageHit = new Image();     // 맞았을때 보스 이미지
    spawnSound;                 // 스폰시 소리
    hitSound;                   // 공에 맞았을때 소리
    deathSound;                 // 죽었을때 소리 
    attackSound;
    isSpawning = false;       
    isDying = false;
    deathAnimation = 0;
    particles = [];
    droppedItem = null;
    isInvulnerable = false;
    invulnerableTimer = 0;
    defaultDx;
    defaultDy;
    hitStopTime = null;    // hit 상태를 위한 타이머
    attackStopTime = null; // 발사체 발사를 위한 타이머
    spawnStopTime = null;
    
    constructor(
        health, x, y, defaultY ,dx, dy, width, height, bossImageDir, imageSpawnDir, imageAngryDir, 
        imageHitDir, spawnSoundDir, hitSoundDir, deathSoundDir, attackSoundDir
    ) {
        this.health = health;
        this.maxHealth = health; // 최대 체력 저장
        this.x = x;
        this.y = y;
        this.defaultY = defaultY;
        this.dx = dx;
        this.dy = dy;
        this.defaultDx = dx;
        this.defaultDy = dy;
        this.width = width;
        this.height = height;
        this.originalImage.src = bossImageDir;
        this.image.src = bossImageDir;
        this.imageAngry.src = imageAngryDir;
        this.imageHit.src = imageHitDir;
        this.spawnSound = new Audio(spawnSoundDir);
        this.hitSound = new Audio(hitSoundDir);
        this.deathSound = new Audio(deathSoundDir);
        this.attackSound = new Audio(attackSoundDir);
        this.imageSpawn.src = imageSpawnDir;

        // 처음 스폰 
        this.isSpawning = true;
        this.spawnStartTime = Date.now();
        this.spawnDuration = 3000; // 2초
        this.currentWidth = 0;
        this.currentHeight = 0;
    }


    // 맞을때
    hit(currentTime) {
        this.hitSound.currentTime = 0; 
        this.hitSound.play();

        this.image = this.imageHit;
        this.dx = this.dx * 0.1;
        this.dy = 0.3;
        this.hitStopTime = currentTime;  // hitStopTime 사용
    }

    // 맞고나서 프리즈 상태 해제
    releaseHit(currentTime) {
        if (this.hitStopTime && currentTime - this.hitStopTime >= 1000) {
            this.dx = this.defaultDx;
            this.dy = this.defaultDy;
            this.image = this.originalImage;
            this.hitStopTime = null;  // hitStopTime 초기화
        }
    }

    calculateNext(deltaMultiplier = 1) {
        this.x += this.dx * deltaMultiplier;
        
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.dx = -this.dx;
        }
        
        // y축 상하 움직임 (사인파 움직임, 프레임 독립적)
        this.y = this.defaultY + Math.sin(Date.now() / 300) * this.dy * deltaMultiplier;

        // 무적 시간 관리 (프레임 독립적)
        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaMultiplier;
            if (this.invulnerableTimer > 30) { // 약 0.5초 (120fps 기준)
                this.isInvulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
    }

    // boss 객체 복사하는 함수
    clone() {
        // 스폰 사운드는 BossManager.init()에서 재생
        const boss = new Boss(
            this.health, this.x, this.y, this.defaultY, this.dx, this.dy, 
            this.width, this.height, this.originalImage.src, this.imageSpawn.src, this.imageAngry.src,
            this.imageHit.src, this.spawnSound.src, this.hitSound.src, this.deathSound.src, this.attackSound.src
        );
        
        // 스폰 관련 속성 초기화
        boss.isSpawning = true;
        boss.spawnStartTime = Date.now();
        boss.spawnDuration = 2000;
        boss.currentWidth = 0;
        boss.currentHeight = 0;
        
        return boss;
    }

    checkInvulnerable() {
        return this.isSpawning || this.isInvulnerable;
    }

    draw() {
        ctx.save();

        if (this.isSpawning) {
            const currentTime = Date.now();
            const elapsed = currentTime - this.spawnStartTime;
            const progress = Math.min(elapsed / this.spawnDuration, 1);

            // 크기 계산
            this.currentWidth = this.width * progress;
            this.currentHeight = this.height * progress;

            // 중앙 정렬을 위한 위치 조정
            const offsetX = (this.width - this.currentWidth) / 2;
            const offsetY = (this.height - this.currentHeight) / 2;

            ctx.drawImage(
                this.imageSpawn,
                this.x + offsetX,
                this.y + offsetY,
                this.currentWidth,
                this.currentHeight
            );

            // 스폰 애니메이션 종료
            if (progress >= 1) {
                this.isSpawning = false;
                this.currentWidth = this.width;
                this.currentHeight = this.height;
            }
        } else if (this.isDying) {
            // 죽었을때
        } else {
            // 기존 보스 그리기 코드
            if (this.dx > 0) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.image,
                    -this.x - this.width,
                    this.y,
                    this.width,
                    this.height
                );
            } else {
                ctx.drawImage(
                    this.image,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }
        }
        
        ctx.restore();
    }
}

// 보스 관리하는 클래스
// 실행시 한번만 생성
class BossManager{
    bossImageDirs = [
        ['mainGame/boss/wither/wither.png'],    // 500, 440
        ['mainGame/boss/ghast/ghast.png', 'mainGame/boss/ghast/ghast_angry.png'],   // 220, 277
        ['mainGame/boss/ender_dragon/ender_dragon.webp']     // 400, 408
    ];
    bossHitImageDirs = [
        'mainGame/boss/wither/wither_hit.png',
        'mainGame/boss/ghast/ghast_hit.png',
        'mainGame/boss/ender_dragon/ender_dragon_hit.png'
    ];
    bossSpawnImageDirs = [
        'mainGame/boss/wither/wither_spawn.png',
        'mainGame/boss/ghast/ghast_angry.png',
        'mainGame/boss/ender_dragon/ender_dragon.webp'
    ];
    bossSpawnSoundDirs = [
        'mainGame/boss/wither/spawn.mp3',
        'mainGame/boss/ghast/spawn.mp3',
        'mainGame/boss/ender_dragon/spawn.ogg',
    ];
    bossHitSoundDirs = [
        'mainGame/boss/wither/hit.mp3',
        'mainGame/boss/ghast/hit.mp3',
        'mainGame/boss/ender_dragon/hit.ogg',
    ];
    bossDeathSoundDirs = [
        'mainGame/boss/wither/death.mp3',
        'mainGame/boss/ghast/death.mp3',
        'mainGame/boss/ender_dragon/death.mp3',
    ];
    bosses = [];
    curBoss;
    size = [[170, 150], [119, 150], [147, 150]];    // 보스 사이즈(이미지 해상도에 맞는)
    y = 80;    // 보스 y 위치

    constructor(difficulty) {
        // 위더
        this.bosses.push(new Boss(
            50,  // health
            canvas.width/2 - this.size[0][0]/2,  // x
            this.y,  // y
            this.y, // defaultY
            1,  // dx
            6,  // dy
            this.size[0][0],  // width
            this.size[0][1],  // height
            this.bossImageDirs[0][0],  // bossImageDir
            this.bossSpawnImageDirs[0],
            this.bossImageDirs[0][0],  // imageAngry
            this.bossHitImageDirs[0],
            this.bossSpawnSoundDirs[0], // 보스 스폰 sound
            this.bossHitSoundDirs[0],   // 보스 맞는 sound
            this.bossDeathSoundDirs[0], // 보스 죽는 sound
            'mainGame/boss/wither/attack.mp3'
        ));
        // 가스트
        this.bosses.push(new Boss(
            70,  // health
            canvas.width/2 - this.size[1][0]/2,  // x
            this.y,  // y
            this.y, // defaultY
            2,  // dx
            6,  // dy
            this.size[1][0],  // width
            this.size[1][1],  // height
            this.bossImageDirs[1][0],  // bossImageDir
            this.bossSpawnImageDirs[1],
            this.bossImageDirs[1][1],  // imageAngry
            this.bossHitImageDirs[1],
            this.bossSpawnSoundDirs[1], // 보스 스폰 sound
            this.bossHitSoundDirs[1],   // 보스 맞는 sound
            this.bossDeathSoundDirs[1], // 보스 죽는 sound
            ''
        ));
        // 엔더드래곤
        this.bosses.push(new Boss(
            150,  // health
            canvas.width/2 - this.size[2][0]/2,  // x
            this.y,  // y
            this.y,  // defaultY
            2.4,  // dx
            6,  // dy
            this.size[2][0],  // width
            this.size[2][1],  // height
            this.bossImageDirs[2][0],  // bossImageDir
            this.bossSpawnImageDirs[2],
            this.bossImageDirs[2][0],  // imageAngry
            this.bossHitImageDirs[2],
            this.bossSpawnSoundDirs[2], // 보스 스폰 sound
            this.bossHitSoundDirs[2],   // 보스 맞는 sound
            this.bossDeathSoundDirs[2], // 보스 죽는 sound
            ''
        ));
        // 현재 보스 갱신
        // this.curBoss = this.bosses[difficulty-1].clone();
    }

    init(difficulty) {
        // 새로운 보스 인스턴스 생성
        this.curBoss = this.bosses[difficulty-1].clone();
        // 게임이 실제로 시작될 때 스폰 사운드 재생
        this.curBoss.spawnSound.play();
    }

    attack(projectileManager) {
        const currentTime = Date.now();
        
        // 발사 시간이 되었는지 체크
        if (!this.isDying() && currentTime - projectileManager.lastFireTime >= projectileManager.nextFireDelay) {
            // 보스가 멈춘 상태에서 발사체 생성
            this.curBoss.attackSound.play();
            this.curBoss.image.src = this.curBoss.imageAngry.src;
            this.curBoss.dx = this.curBoss.dx * 0.1;  // 보스 정지
            this.curBoss.attackStopTime = currentTime;  // attackStopTime 사용
            
            projectileManager.createProjectiles(this.curBoss);
            projectileManager.lastFireTime = currentTime;
            projectileManager.nextFireDelay = projectileManager.getRandomDelay();
        }
        // 보스가 멈춰있는 상태라면
        else if (this.curBoss.attackStopTime) {
            // 0.5초가 지났다면 다시 움직임
            if (currentTime - this.curBoss.attackStopTime >= 500) {
                this.curBoss.image.src = this.curBoss.originalImage.src;
                this.curBoss.dx = this.curBoss.dx < 0 ? -this.curBoss.defaultDx: this.curBoss.defaultDx;;  // 원래 속도로 복구
                this.curBoss.attackStopTime = null;  // attackStopTime 초기화
            }
        }
    }

    collisionDetection(ball) {
        const currentTime = Date.now();
        
        if(!this.curBoss.isDying && !this.curBoss.checkInvulnerable() && 
           ball.isCollision(this.curBoss.x, this.curBoss.y, this.curBoss.width, this.curBoss.height)) {
            this.curBoss.hit(currentTime);
            
            // 공의 중심점
            const ballCenterX = ball.x + ball.width / 2;
            const ballCenterY = ball.y + ball.height / 2;
            
            // 보스의 중심점
            const bossCenterX = this.curBoss.x + this.curBoss.width / 2;
            const bossCenterY = this.curBoss.y + this.curBoss.height / 2;
            
            // 충돌 방향 결정
            const dx = ballCenterX - bossCenterX;
            const dy = ballCenterY - bossCenterY;
            
            // 수평 충돌이 더 가까우면 x방향으로 튕김
            if (Math.abs(dx) > Math.abs(dy)) {
                ball.dx = -ball.dx;
                // 위치 보정 시 화면 경계 체크
                if (dx < 0) {
                    // 왼쪽에서 충돌
                    const newX = this.curBoss.x - ball.width - 1;
                    ball.x = Math.max(0, newX); // 화면 왼쪽 경계를 벗어나지 않도록
                } else {
                    // 오른쪽에서 충돌
                    const newX = this.curBoss.x + this.curBoss.width + 1;
                    ball.x = Math.min(canvas.width - ball.width, newX); // 화면 오른쪽 경계를 벗어나지 않도록
                }
            } else {
                ball.dy = -ball.dy;
                // 위치 보정 시 화면 경계 체크
                if (dy < 0) {
                    // 위에서 충돌
                    const newY = this.curBoss.y - ball.height - 1;
                    ball.y = Math.max(0, newY); // 화면 위쪽 경계를 벗어나지 않도록
                } else {
                    // 아래에서 충돌
                    const newY = this.curBoss.y + this.curBoss.height + 1;
                    ball.y = Math.min(canvas.height - ball.height, newY); // 화면 아래쪽 경계를 벗어나지 않도록
                }
            }
            
            // 공이 지속해서 보스에게 피해주는 경우 없게 하기 위해 무적 시간 추가
            this.curBoss.isInvulnerable = true;
            let sword_name = user.equippedItems.get("sword");
            if(sword_name == "wooden_sword") this.curBoss.health -= 7;
            else if(sword_name == "iron_sword") this.curBoss.health -= 10;
            else if(sword_name == "golden_sword") this.curBoss.health -= 15;
            else if(sword_name == "diamond_sword") this.curBoss.health -= 20;
            if (this.curBoss.health <= 0) {
                this.curBoss.isDying = true;
                this.curBoss.deathSound.play();
            }
        }
        this.curBoss.releaseHit(currentTime);
    }

    isDying() {
        return this.curBoss.isDying;
    }

    draw(deltaMultiplier = 1) {
        ctx.save();

        // 보스 체력바 그리기 (보라색, 353px 너비)
        const healthBarWidth = 353;
        const healthBarHeight = 5;
        const healthBarX = (canvas.width - healthBarWidth) / 2; // 중앙 정렬
        const healthBarY = 30; // 화면 상단에서 30px 아래
        
        // 체력 비율 계산
        const healthPercentage = Math.max(0, this.curBoss.health / this.curBoss.maxHealth);
        const currentHealthWidth = healthBarWidth * healthPercentage;
        
        // 체력바 배경 (검은색)
        ctx.fillStyle = '#210444';
        ctx.fillRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4);
        
        // 체력바 테두리 (회색)
        ctx.fillStyle = '#210444';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // 체력바 (보라색)
        ctx.fillStyle = '#5B00AA';
        ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
        
        // 체력 텍스트
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px minecraftia';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${Math.ceil(this.curBoss.health)} / ${this.curBoss.maxHealth}`,
            healthBarX + healthBarWidth / 2,
            healthBarY + healthBarHeight / 2 - 13
        );

        // 그리기
        this.curBoss.draw();
        this.curBoss.calculateNext(deltaMultiplier);

        ctx.restore();
    }


}
