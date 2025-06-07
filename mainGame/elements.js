// 공
//let BALL_STYLE = 0;   // 공 스타일 (0: wood, 1: stone, 2: iron, 3: gold, 4: diamond)
let BALL_DIR = [
    'mainGame/ball/wood.png',
    'mainGame/ball/stone.png',
    'mainGame/ball/iron.png',
    'mainGame/ball/gold.png',
    'mainGame/ball/diamond.png'
];

// 아이템
// 아이템 이미지 경로 저장 배열
const itemPaths = [
    'mainGame/items/wood.png',
    'mainGame/items/iron.png',
    'mainGame/items/gold.png',
    'mainGame/items/diamond.png',
    'mainGame/items/plank.png',
    'mainGame/items/stick.png',

    'mainGame/items/sword/iron_sword.png',
    'mainGame/items/sword/golden_sword.png',
    'mainGame/items/sword/diamond_sword.png',
    'mainGame/items/sword/wooden_sword.png',

    'mainGame/items/boots/iron_boots.png',
    'mainGame/items/boots/golden_boots.png',
    'mainGame/items/boots/diamond_boots.png',

    'mainGame/items/reggings/iron_reggings.png',
    'mainGame/items/reggings/golden_reggings.png',
    'mainGame/items/reggings/diamond_reggings.png',

    'mainGame/items/chestplate/iron_chestplate.png',
    'mainGame/items/chestplate/gold_chestplate.png',
    'mainGame/items/chestplate/diamond_chestplate.png',

    'mainGame/items/helmet/iron_helmet.png',
    'mainGame/items/helmet/golden_helmet.png',
    'mainGame/items/helmet/diamond_helmet.png'

];
const itemImages = [];
const loadItemImages = () => {
    return Promise.all(itemPaths.map(path => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = path;
            itemImages.push(img);
        });
    }));
};
loadItemImages();

const crackPaths = [
    'mainGame/cracks/crack_1.png',
    'mainGame/cracks/crack_2.png'
];
const crackImages = [];
const loadCrackImages = () => {
    return Promise.all(crackPaths.map(path => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = path;
            crackImages.push(img);
        });
    }));
};
loadCrackImages();

// 공
class Ball {
    x; y;
    width = 20; height= 25;
    dx; dy;
    defaultDx; defaultDy;
    rotation = 0;
    speed = 0;
    image = new Image();

    constructor(x, y, dx = 0.8, dy = -0.8, width = 20, height = 25) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.defaultDx = dx;
        this.defaultDy = dy;
        this.dx = dx;
        this.dy = dy;
        this.setType(BALL_STYLE);
    }
    setType(type) {
        this.type = type;
        this.image.src = BALL_DIR[type] || BALL_DIR[0]; // 기본값
    }
    
    // 공 충돌
    isCollision(elementX, elementY, elementWidth, elementHeight) {
        if (
            this.x + this.width >= elementX &&
            this.x <= elementX + elementWidth &&
            this.y + this.height >= elementY &&
            this.y <= elementY + elementHeight
        ) return true;
        return false;
    };

    updateRotation(deltaMultiplier = 1) {
        if(this.dx > 0) this.rotation -= (0.1 * Math.abs(this.dx)) * deltaMultiplier; // 반시계 방향
        else this.rotation += (0.1 * Math.abs(this.dx)) * deltaMultiplier; // 시계 방향
    };

    updateLocation(deltaMultiplier = 1) {
        this.x += this.dx * deltaMultiplier;
        this.y += this.dy * deltaMultiplier;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);

        if (this.image.complete) {
            ctx.drawImage(
                this.image,
                -this.width/2,
                -this.height/2,
                this.width + 10,
                this.height + 4
            );
        } else {
            ctx.fillStyle = "#0095DD";
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        ctx.restore();
    };
}

// paddle
class Paddle {
    x; y;
    width = 99; height = 33;
    dx = 0;
    tilt = 0;
    maxTilt = Math.PI / 10;
    image = new Image();
    speed = 3;
    collisionSound = new Audio('mainGame/paddle/slime.ogg');
    eatSound = new Audio('mainGame/paddle/pop.mp3');

    constructor(x, y, speed=7, width=99, height=33, dx=0, tilt=0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.tilt = tilt;
        this.image.src = 'mainGame/paddle/slime.png';
        this.speed = speed;
    }

    updateRocation(canvas, leftPressed, rightPressed, deltaMultiplier = 1) {
        if(rightPressed) {
            this.dx = this.speed * deltaMultiplier;
            this.tilt = Math.min(this.tilt + (0.1 * deltaMultiplier), this.maxTilt);
        }
        else if(leftPressed) {
            this.dx = -this.speed * deltaMultiplier;
            this.tilt = Math.max(this.tilt - (0.1 * deltaMultiplier), -this.maxTilt);
        }
        else {
            this.dx = 0;
            this.tilt *= Math.pow(0.95, deltaMultiplier); // 기울기 점차 감소
        }

        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x + this.dx));
    };

    collisionDetection(ball) {
        if(ball.isCollision(this.x, this.y, this.width, this.height)) {
            this.collisionSound.play();
            
            // 충돌 위치에 따른 반사 각도 조정
            const hitPoint = (ball.x + ball.width/2 - this.x) / this.width;
            // 기본 반사 각도 (-45도 ~ 45도)
            const baseAngle = (hitPoint - 0.5) * Math.PI/2;
            // 패들의 기울기를 반사 각도에 추가
            const angle = baseAngle + this.tilt;
            
            // 기울기에 따른 속도 증가 (최대 25% 증가로 감소)
            const tiltSpeedBonus = 1 + Math.abs(this.tilt / this.maxTilt) * 0.25;
            const baseSpeed = Math.sqrt(ball.defaultDx * ball.defaultDx + ball.defaultDy * ball.defaultDy);
            const speed = baseSpeed * tiltSpeedBonus;
            
            // 새로운 속도와 방향 계산
            const newDx = speed * Math.sin(angle);
            const newDy = -speed * Math.cos(angle);
            
            // 공이 패들 위로 올라가도록 위치 보정 (더 안전하게)
            if (ball.dy > 0) { // 공이 아래쪽으로 움직이고 있을 때만 위치 보정
                ball.y = this.y - ball.height - 1; // 1픽셀 여유 공간
            }
            ball.dx = newDx;
            ball.dy = newDy;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.tilt);
        for (let i = 0; i<3; i++) {
            ctx.drawImage(
                this.image,
                -this.width/2+this.width/3*i, 
                -this.height/2, 
                this.width/3, this.height);
        }
        ctx.restore();
    };
}

class Item {
    x; y;
    width = 32; height = 32;
    dy = 1;
    image;
    type; 

    constructor(x, y, image, type) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.type = type;
    }
}

class Brick {
    x; y;
    status; life; maxlife;
    brickSize = 50;
    image;
    score;

    constructor(x, y, status, life, score, image=undefined) {
        this.x = x;
        this.y = y;
        this.status = status;
        this.life = life;
        this.maxlife = life;
        this.score = score;
        if (status != 0) this.image = image;
    }
}

class BrickManager {
    brickSize = 50;
    dir = [[
            'mainGame/bricks/overworld/stone.png', 
            'mainGame/bricks/overworld/wood.png',
            'mainGame/bricks/overworld/iron.png', 
            'mainGame/bricks/overworld/gold.png',
            'mainGame/bricks/overworld/diamond.png'
        ], [
            'mainGame/bricks/nether/netherrack.png',
            'mainGame/bricks/nether/mangrove.png',
            'mainGame/bricks/nether/quartz.png',
            'mainGame/bricks/nether/nether_gold.png',
            'mainGame/bricks/nether/ancient.png'
        ], [
            'mainGame/bricks/ender/end_stone.png',
            'mainGame/bricks/ender/end_bricks.png',
            'mainGame/bricks/ender/calcite.png',
            'mainGame/bricks/ender/raw_gold.png',
            'mainGame/bricks/ender/amethyst.png'
    ]];
    images = [];
    brickRowCount = 8;
    brickColumnCount = 18;
    // 블럭 별 생성 확률 [ 돌, 나무, 철, 금, 다이아 순서 ]
    brickRatio = [0.4, 0.625, 0.85, 0.95, 1.0];
    bricks = [];
    
    constructor(difficulty) {
        for (let i = 0; i < this.dir[difficulty-1].length; i++) {
            const img = new Image();
            img.src = this.dir[difficulty-1][i];
            this.images.push(img);
        }

        for(let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for(let r = 0; r < this.brickRowCount; r++) {
                if(Math.random() > 0.3) {  // 70% 확률로 벽돌 생성
                    let brickType = Math.random();
                    if(brickType < this.brickRatio[0]) {
                        this.bricks[c][r] = new Brick(0, 0, 1, 1, 10, this.images[0]);
                    } else if(brickType < this.brickRatio[1]) {
                        this.bricks[c][r] = new Brick(0, 0, 2, 1, 10, this.images[1]);
                    } else if(brickType < this.brickRatio[2]) {
                        this.bricks[c][r] = new Brick(0, 0, 3, 2, 30, this.images[2]);
                    } else if(brickType < this.brickRatio[3]) {
                        this.bricks[c][r] = new Brick(0, 0, 4, 2, 30, this.images[3]);
                    } else {
                        this.bricks[c][r] = new Brick(0, 0, 5, 3, 50,this.images[4]);
                    }
                } else {
                    this.bricks[c][r] = new Brick(0, 0, 0, 0, 0);
                }
            }
        }
    }

    collisionDetection(ball, fallingItems) {
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if(b.status >= 1) {
                    if(ball.isCollision(b.x, b.y, this.brickSize, this.brickSize)) {
                        ball.dy = -ball.dy;
                        let tmp = b.status;
                        if(b.life === 1) {
                            b.status = 0;
                            user.score += b.score;
                            
                            if(tmp >= 2 && tmp <= 5) {
                                const itemType = tmp - 2;
                                fallingItems.push(new Item(b.x, b.y, itemImages[itemType], itemType));
                            }
                        } else {
                            b.life--;
                        }
                    }
                }
            }
        }
    }

    draw(fallingItemsCnt) {
        let cnt = 0;
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                if(this.bricks[c][r].status >= 1) {
                    cnt ++;
                    const brickX = c * this.brickSize;
                    const brickY = r * this.brickSize;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;

                    ctx.drawImage(this.bricks[c][r].image, brickX, brickY, this.brickSize, this.brickSize);
                    let b = this.bricks[c][r];
                    if(b.maxlife == 3) {
                        if(b.life == 2) ctx.drawImage(crackImages[1], brickX, brickY, this.brickSize, this.brickSize);
                        else if(b.life == 1) ctx.drawImage(crackImages[0], brickX, brickY, this.brickSize, this.brickSize);
                    } else if(b.maxlife == 2) {
                        if(b.life == 1) ctx.drawImage(crackImages[0], brickX, brickY, this.brickSize, this.brickSize);
                    }
                }
            }
        }

        // 블록 하나도 없다면 클리어
        if (cnt == 0 && fallingItemsCnt == 0) return true;
        return false;
    }
}

// 핫바 구성 (완성)
class Hotbar {
    images = [];
    x; y;
    width = 393; height= 55;
    posX = [9, 52, 94, 137, 180, 223, 265, 308, 351]

    constructor(x, y) {
        // 번호별 핫바 구성
        for (let i = 1; i<10; i++) {
            let hotbarImg = new Image();
            hotbarImg.src = 'mainGame/hotbar/hotbar' + i + '.png';
            this.images.push(hotbarImg);
        }
        this.x = x;
        this.y = y;
    }

    draw(havingItems) {
        ctx.save();
        ctx.drawImage(this.images[curHotbarIdx-1], this.x, this.y, this.width, this.height);

        // 핫바 속 아이템 그리기
        let i = 0;
        for (let [itemType, count] of havingItems.entries()) {
            if (i == this.posX.length) break;
            // 아이템이 존재하고 로드되었는지 확인
            const itemImage = itemImages[itemType];
            if (itemImage && itemImage.complete) {
                ctx.drawImage(itemImage, this.x + this.posX[i], this.y + 9, 33, 33);
            }
            
            // 아이템 개수
            if (count == 1) {
                i++;
                continue;
            }
            ctx.font = "18px Minecraftia";
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(0, 0, 0, .5)";
            ctx.fillText(count, this.x + this.posX[i] + 41, this.y + 45);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(count, this.x + this.posX[i] + 38, this.y + 42);
            i++;
        }

        ctx.restore();
    }
}

// 체력 바 (완성)
class Heart {
    x; y;
    image = [new Image(), new Image()];
    _health; maxHealth;

    constructor(x, y, maxHealth) {
        this.x = x;
        this.y = y;
        // health와 maxHealth가 유효한 숫자인지 확인
        this._health = typeof maxHealth === 'number' && !isNaN(maxHealth) ? maxHealth : 5;
        this.maxHealth = typeof maxHealth === 'number' && !isNaN(maxHealth) ? maxHealth : 5;
        this.image[0].src = 'mainGame/user/heart_empty.png';
        this.image[1].src = 'mainGame/user/heart_fill.png';
    }
    
    // health getter - NaN이나 undefined 방지
    get health() {
        return typeof this._health === 'number' && !isNaN(this._health) ? this._health : 0;
    }
    
    // health setter - NaN이나 undefined 방지
    set health(value) {
        if (typeof value === 'number' && !isNaN(value)) {
            this._health = Math.max(0, Math.min(value, this.maxHealth));
        } else {
            console.warn('Invalid health value attempted:', value, 'Setting to 0');
            this._health = 0;
        }
    }

    draw() {
        ctx.save();
        // 채워진 하트 그리기
        for (let i = 0; i<this.health; i++) {
            if (this.image[1].complete) ctx.drawImage(this.image[1], this.x + i*19, this.y, 19, 19);
        }
            
        // 빈 하트 그리기
        for (let i = this.health; i<this.maxHealth; i++) {
            if (this.image[0].complete) ctx.drawImage(this.image[0], this.x + i*19, this.y, 19, 19);
        }

        ctx.restore();
    }
}

// 갑바 바 (완성)
class Armor {
    x; 
    y;
    image = [new Image(), new Image()];
    defense;
    maxDefense;

    constructor(x, y, defense) {
        this.x = x;
        this.y = y;
        this.defense = 0;
        this.maxDefense = defense;
        this.image[0].src = 'mainGame/user/armor_empty.png';
        this.image[1].src = 'mainGame/user/armor_fill.png';
    }

    setDefense(value) {
        this.defense = value;
    }

    getDefense() {
        return this.defense;
    }

    draw() {
        ctx.save()
        // 채워진 갑옷 그리기
        for(let i = 0; i < this.defense; i++) {
            if(this.image[1].complete) ctx.drawImage(this.image[1], this.x + i*19, this.y, 19, 19);
        }

        // 빈 갑옷 그리기
        for(let i = this.defense; i < this.maxDefense; i++) {
            if(this.image[0].complete) ctx.drawImage(this.image[0], this.x + i*19, this.y, 19, 19);
        }

        ctx.restore();
    }
}

// 게임 화면에 유저를 위한 정보 (hotbar, timer, gameDifficulty, 체력, 갑바)
class User {
    havingItems = new Map();
    having
    hotbar;
    xpbars = [];
    heart;
    armor;
    defense;
    score;
    hitSound = new Audio('mainGame/user/hit.mp3');
    equippedItems = new Map();
    hitImage = new Image();
    hitTime = null;
    boot = null;
    bootTime = {iron_boots: 1, golden_boots: 0.5, diamond_boots: 0.3};  // 신발 별 불 붙는 시간

    constructor(health, defense) {
        this.hotbar = new Hotbar(253, 595);
        // 레벨별 xpbar 구성
        for (let i = 1; i<4; i++) {
            let xpbar = new Image();
            xpbar.src = 'mainGame/xpbar/level' + i + '.png';
            this.xpbars.push(xpbar);
        }
        
        // 체력바 구성
        this.heart = new Heart(256, 560, health);

        this.hitImage.src = 'mainGame/boss/ghast/user_hit.png';
        this.hitTime = null;
        // 보호구 바 구성
        this.armor = new Armor(469, 560, defense);
        // this.

        this.equippedItems.set('sword', 'wooden_sword');
        this.score = 0;
    }

    init() {
        // 안전한 health 초기화
        this.heart.health = 5;
    }

    hit(difficulty, damage = 1, isMiniGame = false) {
        // 철 모자 착용 시 1/50 확률로 공격 무효화
        const helmet = this.equippedItems.get("helmet");
        if (helmet === "iron_helmet") {
            const dodgeChance = Math.random();
            if (dodgeChance < 0.02) { 
                return;
            }
        }
        
        if (isMiniGame && (difficulty === 2 || difficulty === 3)) {
            this.hitTime = Date.now();
        }
        if(this.armor.getDefense() >= damage) this.armor.setDefense(this.armor.getDefense() - damage);
        else if(this.armor.getDefense() > 0 && this.armor.getDefense() < damage) { 
            damage -= this.armor.getDefense()
            this.armor.setDefense(0);
        } else {
            const safeDamage = typeof damage === 'number' && !isNaN(damage) ? damage : 1;
            this.heart.health -= safeDamage;
        }
        this.hitSound.play();
    }

    releaseHit(difficulty) {
        const curTime = Date.now();
        const fireTime = this.boot == null ? 1.3 : this.bootTime[this.boot];
        // 보호구에 맞춰 초 수정
        if ((difficulty === 2 || difficulty === 3) && this.hitTime && curTime - this.hitTime > fireTime * 1000) {
            this.hitTime = null;
        }
    }

    isDead() {
        return this.heart.health <= 0;
    }

    addArmor(armor) {
        let setValue = this.armor.getDefense() + armor;
        this.armor.setDefense(setValue);  
    }

    clone() {
        const clonedUser = new User(this.heart.maxHealth, 9);
        clonedUser.heart.health = this.heart.health;
        clonedUser.armor.defense = this.armor.defense;
        clonedUser.havingItems = new Map(this.havingItems);
        clonedUser.equippedItems = new Map(this.equippedItems);
        clonedUser.xpbars = [...this.xpbars];
        clonedUser.score = this.score;
        return clonedUser;
    }

    draw() {
        ctx.save();
        this.hotbar.draw(this.havingItems);
        this.heart.draw();
        this.armor.draw();
        ctx.drawImage(this.xpbars[gameDifficulty-1], 256, 570, 387, 23);
        if ((gameDifficulty == 2 || gameDifficulty == 3) && this.hitTime) {
            ctx.drawImage(this.hitImage, 0, 0, 900, 650);
        }
        ctx.restore();
    }

    currentItems() {
        console.log("장착중인 아이템 목록:");
        for(const [key, value] of this.equippedItems) {
            console.log(` - ${key}: ${value}`);
        }
    }

}