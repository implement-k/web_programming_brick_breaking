class Projectile {
    x; y;
    dx; dy;
    width; height;
    image = new Image();
    damage;
    
    constructor(x, y, dx, dy, width, height, imageDir, damage) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = width;
        this.height = height;
        this.imageDir = imageDir;
        this.damage = damage;
    }
}

class ProjectileManager {
    constructor(difficulty) {

    }

    init() {

    }

    draw() {

    }
}
class Boss{
    health;
    x; y;
    dx; dy;
    width=500; height=500;
    image = new Image();
    imageAngry = new Image();
    projectile = new Image();
    
    constructor(health, x, y, dx, dy, width, height, bossImageDir, imageAngryDir, projectileImageDir) {
        this.health = health;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = width;
        this.height = height;
        this.image.src = bossImageDir;
        this.imageAngry.src = imageAngryDir;
        this.projectile.src = projectileImageDir;
    }

    calculateNext() {
        // x축 이동
        this.x += this.dx;
        
        // 화면 경계에 닿으면 방향 전환
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.dx = -this.dx;
        }
        
        // y축 상하 움직임 (사인파 움직임)
        this.y = 300 + Math.sin(Date.now() / 300) * this.dy; // 300은 기준 y좌표, 50은 움직임 폭
    }

    draw() {
        ctx.save();
        
        // 오른쪽으로 이동할 때는 이미지 반전
        if (this.dx > 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.health <= 5 ? this.imageAngry : this.image,
                -this.x - this.width, // x좌표 조정 필요
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
        
        ctx.restore();
    }
}

class BossManager{
    bossImageDirs = [
        ['mainGame/boss/wither/wither.png'],
        ['mainGame/boss/ghast/ghast.png', 'mainGame/boss/ghast/ghast_angry.png'],
        ['mainGame/goss/ender_dragon.webp']
    ];
    projectileImageDir = [
        'mainGame/boss/wither/wither_projectile.png',
        'mainGame/boss/ghast/ghast_projectile.png',
        'mainGame/boss/ender_dragon/ender_dragon_projectile.png'
    ];
    bosses = [];
    curBoss;
    size = [[300, 300], [400, 400], [400, 400]];

    constructor(difficulty) {
        // 위더
        this.bosses.push(new Boss(
            10,  // health
            canvas.width/2 - this.size[0][0]/2,  // x
            300,  // y
            2,  // dx
            1,  // dy
            this.size[0][0],  // width
            this.size[0][1],  // height
            this.bossImageDirs[0][0],  // bossImageDir
            this.bossImageDirs[0][0],  // imageAngry
            this.projectileImageDir[0]  // projectileImageDir
        ));
        // 가스트
        this.bosses.push(new Boss(
            12,  // health
            canvas.width/2 - this.size[1][0]/2,  // x
            300,  // y
            2,  // dx
            1,  // dy
            this.size[1][0],  // width
            this.size[1][1],  // height
            this.bossImageDirs[1][0],  // bossImageDir
            this.bossImageDirs[1][1],  // imageAngry
            this.projectileImageDir[1]  // projectileImageDir
        ));
        // 엔더드래곤
        this.bosses.push(new Boss(
            15,  // health
            canvas.width/2 - this.size[2][0]/2,  // x
            300,  // y
            3,  // dx
            1,  // dy
            this.size[2][0],  // width
            this.size[2][1],  // height
            this.bossImageDirs[2][0],  // bossImageDir
            this.bossImageDirs[2][0],  // imageAngry
            this.projectileImageDir[2]  // projectileImageDir
        ));
        // 현재 보스 갱신
        this.curBoss = this.bosses[difficulty-1];
    }

    init() {
        
    }

    setBoss(difficulty) {
        this.curBoss = this.bosses[difficulty-1];
    }

    isDead() {
        return this.curBoss.health == 0;
    }

    draw() {
        ctx.save();

        // 그리기
        this.curBoss.draw();
        this.curBoss.calculateNext();

        ctx.restore();
    }
}
