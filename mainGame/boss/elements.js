// 발사체 class (완성)
class Projectile {
    x; y;
    dx; dy;
    width; height;
    image = new Image();
    damage;
    
    constructor(width, height, damage, imageDir=null, x=0, y=0, dx=0, dy=0, image=null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.dx = dx;
        this.dy = dy;
        if (imageDir != null) this.image.src = imageDir;
        if (image != null) this.image = image;
    }

    create(x, y, dx, dy) {
        return new Projectile(this.width, this.height, this.damage, null, x, y, dx, dy, this.image);
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
    delaies = [4000, 3000, 2000];   // 공격 간격
    damages = [1, 2, 3];            // 발사체 데미지
    speeds = [2, 3, 4];
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

    // 3~5초 사이의 랜덤한 발사 딜레이를 반환
    getRandomDelay() {
        return Math.random() * 2000 + this.delay; // 3000~5000ms
    }

    // 발사체 생성
    createProjectiles(boss) {
        let angles = [
            [-this.speeds[this.difficulty-1] * Math.sin(Math.PI/4), this.speeds[this.difficulty-1] * Math.cos(Math.PI/4)],
            [this.speeds[this.difficulty-1] * Math.sin(Math.PI/4), this.speeds[this.difficulty-1] * Math.cos(Math.PI/4)],
            [0, this.speeds[this.difficulty-1]],
            [-this.speeds[this.difficulty-1] * Math.sin(Math.PI/6), this.speeds[this.difficulty-1] * Math.cos(Math.PI/6)],
            [this.speeds[this.difficulty-1] * Math.sin(Math.PI/6), this.speeds[this.difficulty-1] * Math.cos(Math.PI/6)]
        ];

        let maxProjectiles = this.difficulty == 1 ? 2 : (this.difficulty == 2 ? 3 : angles.length);

        for (let i = 0; i < maxProjectiles; i++) {
            this.projectiles.push(this.projectile.create(
                boss.x + boss.width/2,  // 보스 중앙에서 발사
                boss.y + boss.height,
                angles[i][0],
                angles[i][1]
            ));
        }
    }

    // 발사체와 패들의 충돌 검사
    checkCollisions(paddle, canvas) {
        for(let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // 패들과 충돌
            if (projectile.x + projectile.width >= paddle.x &&
                projectile.x <= paddle.x + paddle.width &&
                projectile.y + projectile.height >= paddle.y &&
                projectile.y <= paddle.y + paddle.height) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // 화면 아래와 충돌
            if (projectile.y + projectile.height > canvas.height) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // 화면 좌우 벽과 충돌
            if (projectile.x <= 0 || projectile.x + projectile.width >= canvas.width) {
                projectile.dx = -projectile.dx;  // x방향 반전
            }
            
            // 발사체 이동
            projectile.x += projectile.dx;
            projectile.y += projectile.dy;
        }
    }

    draw() {
        for (const projectile of this.projectiles) {
            ctx.drawImage(
                projectile.image,
                projectile.x,
                projectile.y,
                projectile.width,
                projectile.height
            );
        }
    }
}

// bossManager에서 사용하는 클래스
// 각 객체는 boss의 정보를 가지고 있음.
class Boss{
    health;                     // 보스 피 (health번 만큼 맞으면 죽음)
    x; y;                       // 보스 위치
    defaultY;                   // sin파 y축 위치
    dx; dy;                     // dx: 가로 속도, dy: 위 아래로 움직이는 속도
    width; height;              // 보스 크기
    image = new Image();        // 보스 이미지
    imageAngry = new Image();   // 공격시 보스 이미지
    spawnSound;                 // 스폰시 소리
    hitSound;                   // 공에 맞았을때 소리
    deathSound;                 // 죽었을때 소리        
    isDying = false;
    deathAnimation = 0;
    particles = [];
    droppedItem = null;
    isInvulnerable = false;
    invulnerableTimer = 0;
    
    constructor(
        health, x, y, defaultY ,dx, dy, width, height, bossImageDir, imageAngryDir, 
        spawnSoundDir, hitSoundDir, deathSound
    ) {
        this.health = health;
        this.x = x;
        this.y = y;
        this.defaultY = defaultY;
        this.dx = dx;
        this.dy = dy;
        this.width = width;
        this.height = height;
        this.image.src = bossImageDir;
        this.imageAngry.src = imageAngryDir;
        this.spawnSound = new Audio(spawnSoundDir);
        this.hitSound = new Audio(hitSoundDir);
        this.deathSound = new Audio(deathSound);
    }

    createParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 5;
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 5,
                alpha: 1
            });
        }
    }

    dropItem() {
        this.droppedItem = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            dy: 2,
            width: 30,
            height: 30,
            image: new Image()
        };
        this.droppedItem.image.src = 'mainGame/items/diamond.png';
    }

    calculateNext() {
        // x축 이동
        this.x += this.dx;
        
        // 화면 경계에 닿으면 방향 전환
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.dx = -this.dx;
        }
        
        // y축 상하 움직임 (사인파 움직임)
        this.y = this.y + Math.sin(Date.now() / 300) * this.dy; // 300은 기준 y좌표, 50은 움직임 폭

        // 무적 시간 관리
        if (this.isInvulnerable) {
            this.invulnerableTimer++;
            if (this.invulnerableTimer > 30) { // 약 0.5초 (60fps 기준)
                this.isInvulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
    }

    // boss 객체 복사하는 함수
    clone() {
        return new Boss(
            this.health, this.x, this.y, this.defaultY, this.dx, this.dy, 
            this.width, this.height, this.image.src, this.imageAngry.src,
            this.spawnSound.src, this.hitSound.src, this.deathSound.src);
    }

    draw() {
        ctx.save();
        
        if (this.isDying) {
            // 파티클 그리기
            for (const particle of this.particles) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // 아이템 그리기
            if (this.droppedItem) {
                ctx.drawImage(
                    this.droppedItem.image,
                    this.droppedItem.x - this.droppedItem.width / 2,
                    this.droppedItem.y - this.droppedItem.height / 2,
                    this.droppedItem.width,
                    this.droppedItem.height
                );
            }
        } else {
            // 기존 보스 그리기 코드
            if (this.dx > 0) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.health <= 5 ? this.imageAngry : this.image,
                    -this.x - this.width,
                    this.y,
                    this.width,
                    this.height
                );
            } else {
                ctx.drawImage(
                    this.health <= 5 ? this.imageAngry : this.image,
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
        ['mainGame/goss/ender_dragon.webp']     // 400, 408
    ];
    bossSpawnSoundDirs = [
        'mainGame/boss/wither/spawn.mp3',
    ];
    bossHitSoundDirs = [
        'mainGame/boss/wither/hit.mp3',
    ];
    bossDeathSoundDirs = [
        'mainGame/boss/wither/death.mp3',
    ];
    bosses = [];
    curBoss;
    size = [[170, 150], [119, 150], [147, 150]];    // 보스 사이즈(이미지 해상도에 맞는)
    y = 100;    // 보스 위

    constructor(difficulty) {
        // 위더
        this.bosses.push(new Boss(
            20,  // health
            canvas.width/2 - this.size[0][0]/2,  // x
            this.y,  // y
            this.y, // defaultY
            1,  // dx
            1,  // dy
            this.size[0][0],  // width
            this.size[0][1],  // height
            this.bossImageDirs[0][0],  // bossImageDir
            this.bossImageDirs[0][0],  // imageAngry
            this.bossSpawnSoundDirs[0], // 보스 스폰 sound
            this.bossHitSoundDirs[0],   // 보스 맞는 sound
            this.bossDeathSoundDirs[0]  // 보스 죽는 sound
        ));
        // 가스트
        this.bosses.push(new Boss(
            12,  // health
            canvas.width/2 - this.size[1][0]/2,  // x
            this.y,  // y
            this.y, // defaultY
            2,  // dx
            1,  // dy
            this.size[1][0],  // width
            this.size[1][1],  // height
            this.bossImageDirs[1][0],  // bossImageDir
            this.bossImageDirs[1][1],  // imageAngry
            this.bossSpawnSoundDirs[1], // 보스 스폰 sound
            this.bossHitSoundDirs[1],   // 보스 맞는 sound
            this.bossDeathSoundDirs[1]  // 보스 죽는 sound
        ));
        // 엔더드래곤
        this.bosses.push(new Boss(
            15,  // health
            canvas.width/2 - this.size[2][0]/2,  // x
            this.y,  // y
            this.y,  // defaultY
            3,  // dx
            1,  // dy
            this.size[2][0],  // width
            this.size[2][1],  // height
            this.bossImageDirs[2][0],  // bossImageDir
            this.bossImageDirs[2][0],  // imageAngry
            this.bossSpawnSoundDirs[2], // 보스 스폰 sound
            this.bossHitSoundDirs[2],   // 보스 맞는 sound
            this.bossDeathSoundDirs[2]  // 보스 죽는 sound
        ));
        // 현재 보스 갱신
        this.curBoss = this.bosses[difficulty-1].clone();
    }

    init(difficulty) {
        this.curBoss = this.bosses[difficulty-1];
    }

    manageProjectile(projectileManager) {
        const currentTime = Date.now();
        
        // 발사 시간이 되었는지 체크
        if (currentTime - projectileManager.lastFireTime >= projectileManager.nextFireDelay) {
            // 보스가 멈춘 상태에서 발사체 생성
            this.curBoss.originalDx = this.curBoss.dx;  // 원래 속도 저장
            this.curBoss.dx = 0;  // 보스 정지
            this.curBoss.stopTime = currentTime;  // 정지 시작 시간 저장
            
            projectileManager.createProjectiles(this.curBoss);
            projectileManager.lastFireTime = currentTime;
            projectileManager.nextFireDelay = projectileManager.getRandomDelay();
        }
        // 보스가 멈춰있는 상태라면
        else if (this.curBoss.stopTime) {
            // 0.5초가 지났다면 다시 움직임
            if (currentTime - this.curBoss.stopTime >= 500) {
                this.curBoss.dx = this.curBoss.originalDx;  // 원래 속도로 복구
                this.curBoss.stopTime = null;  // 정지 상태 해제
            }
        }
        
        // 발사체 충돌 체크 및 이동
        projectileManager.checkCollisions(paddle, canvas);
    }

    collisionDetection(ball) {
        if(!this.curBoss.isDying && !this.curBoss.isInvulnerable && 
           ball.isCollision(this.curBoss.x, this.curBoss.y, this.curBoss.width, this.curBoss.height)) {
            this.curBoss.hitSound.currentTime = 0;  // 오디오 위치를 처음으로 리셋
            this.curBoss.hitSound.play();
            console.log(this.curBoss.health);
            
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
                // 왼쪽에서 충돌
                if (dx < 0) {
                    ball.x = this.curBoss.x - ball.width - 1;
                } else {
                    // 오른쪽에서 충돌
                    ball.x = this.curBoss.x + this.curBoss.width + 1;
                }
            } else {
                ball.dy = -ball.dy;
                // 위에서 충돌
                if (dy < 0) {
                    ball.y = this.curBoss.y - ball.height - 1;
                } else {
                    // 아래에서 충돌
                    ball.y = this.curBoss.y + this.curBoss.height + 1;
                }
            }
            
            this.curBoss.isInvulnerable = true;
            
            if (this.curBoss.health <= 1) {
                this.curBoss.isDying = true;
                this.curBoss.createParticles();
                this.curBoss.dropItem();
                this.curBoss.deathSound.play();
            } else {
                this.curBoss.health--;
            }       
        }
    }

    isDying() {
        return this.curBoss.isDying;
    }

    draw() {
        ctx.save();

        // 그리기
        this.curBoss.draw();
        this.curBoss.calculateNext();

        ctx.restore();
    }


}
