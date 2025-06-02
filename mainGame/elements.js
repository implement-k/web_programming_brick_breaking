// 공
const BALL_X_SPEED = 1;   // 공 x축으로 움직이는 속도
const BALL_Y_SPEED = 1;   // 공 y축으로 움직이는 속도
const BALL_STYLE = 0;   // 공 스타일 (0: wood, 1: stone, 2: iron, 3: gold, 4: diamond)
const BALL_DIR = [
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

// 공
class Ball {
    x; y;
    width = 20; height= 25;
    dx; dy;
    defaultDx; defaultDy;
    rotation = 0;
    speed = 0;
    image = new Image();

    constructor(x, y, dx = 1, dy = 1, width = 20, height = 25) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.defaultDx = dx;
        this.defaultDy = dy;
        this.dx = dx;
        this.dy = dy;
        this.image.src = BALL_DIR[BALL_STYLE];
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

    // 공 회전 업데이트
    updateRotation() {
        if(this.dx > 0) this.rotation -= 0.1 * Math.abs(this.dx); // 반시계 방향
        else this.rotation += 0.1 * Math.abs(this.dx); // 시계 방향
    };

    // 공 위치 업데이트
    updateLocation() {
        this.x += this.dx;
        this.y += this.dy;
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
    speed = 7;
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

    updateRocation(canvas, leftPressed, rightPressed) {
        if(rightPressed) {
            this.dx = this.speed;
            this.tilt = Math.min(this.tilt + 0.1, this.maxTilt);
        }
        else if(leftPressed) {
            this.dx = -this.speed;
            this.tilt = Math.max(this.tilt - 0.1, -this.maxTilt);
        }
        else {
            this.dx = 0;
            this.tilt *= 0.95; // 기울기 점차 감소
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
            
            // 기울기에 따른 속도 증가 (최대 50% 증가)
            const tiltSpeedBonus = 1 + Math.abs(this.tilt / this.maxTilt) * 0.5;
            const baseSpeed = Math.sqrt(ball.defaultDx * ball.defaultDx + ball.defaultDy * ball.defaultDy);
            const speed = baseSpeed * tiltSpeedBonus;
            
            // 새로운 속도와 방향만 계산 (기본 속도 유지)
            const newDx = speed * Math.sin(angle);
            const newDy = -speed * Math.cos(angle);
            
            // 위치가 겹치지 않도록 약간 위로 이동
            ball.y = this.y - ball.height;
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
    status; life;
    brickSize = 50;
    image;

    constructor(x, y, status, life, image=undefined) {
        this.x = x;
        this.y = y;
        this.status = status;
        this.life = life;
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
            'mainGame/bricks/ender/amethyst.png',
            'mainGame/bricks/ender/raw_gold.png',
            'mainGame/bricks/ender/obsidian.png'
    ]];
    images = [];
    brickRowCount = 8;
    brickColumnCount = 18;
    // 블럭 별 생성 확률 [ 돌, 나무, 철, 금, 다이아 순서 ]
    brickRatio = [0.4, 0.625, 0.85, 0.95, 1.0];
    bricks = [];
    
    constructor(difficulty) {
        for (let i = 0; i<this.dir[difficulty-1].length; i++) {
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
                        this.bricks[c][r] = new Brick(0, 0, 1, 1, this.images[0]);
                    } else if(brickType < this.brickRatio[1]) {
                        this.bricks[c][r] = new Brick(0, 0, 2, 1, this.images[1]);
                    } else if(brickType < this.brickRatio[2]) {
                        this.bricks[c][r] = new Brick(0, 0, 3, 2, this.images[2]);
                    } else if(brickType < this.brickRatio[3]) {
                        this.bricks[c][r] = new Brick(0, 0, 4, 2, this.images[3]);
                    } else {
                        this.bricks[c][r] = new Brick(0, 0, 5, 3, this.images[4]);
                    }
                } else {
                    this.bricks[c][r] = new Brick(0, 0, 0, 0);
                }
            }
        }
    }

    collisionDetection(ball) {
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if(b.status >= 1) {
                    if(ball.isCollision(b.x, b.y, this.brickSize, this.brickSize)) {
                        ball.dy = -ball.dy;
                        let tmp = b.status;
                        if(b.life === 1) {
                            b.status = 0;

                            // TODO
                            if(tmp >= 2 && tmp <= 5) {
                                const itemType = tmp - 2;
                                console.log(itemType);
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
    health; maxHealth;

    constructor(x, y, maxHealth) {
        this.x = x;
        this.y = y;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.image[0].src = 'mainGame/user/heart_empty.png';
        this.image[1].src = 'mainGame/user/heart_fill.png';
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

// 갑바 바 (구현 예정)
class Armor {

}

// 게임 화면에 유저를 위한 정보 (hotbar, timer, gameDifficulty, 체력, 갑바)
class User {
    havingItems = new Map();
    having
    hotbar;
    xpbars = [];
    heart;
    armor;
    hitSound = new Audio('mainGame/user/hit.mp3');
    equippedItems = new Map();

    constructor(health) {
        this.hotbar = new Hotbar(253, 595);
        // 레벨별 xpbar 구성
        for (let i = 1; i<4; i++) {
            let xpbar = new Image();
            xpbar.src = 'mainGame/xpbar/level' + i + '.png';
            this.xpbars.push(xpbar);
        }
        
        // 체력바 구성
        this.heart = new Heart(256, 560, health);

        // 보호구 바 구성
        // this.
    }

    init() {
        this.heart.health = 5;
    }

    hit(damage) {
        this.heart.health -= damage;
        this.hitSound.play();
    }

    isDead() {
        return this.heart.health <= 0;
    }

    clone() {
        const clonedUser = new User(this.heart.maxHealth);
        
        // 현재 체력 상태 복사
        clonedUser.heart.health = this.heart.health;
        
        // havingItems Map 복사 (깊은 복사)
        clonedUser.havingItems = new Map(this.havingItems);
        
        // xpbar 복사
        clonedUser.xpbars = [...this.xpbars];
        
        return clonedUser;
    }

    draw() {
        ctx.save();
        this.hotbar.draw(this.havingItems);
        this.heart.draw();
        ctx.drawImage(this.xpbars[gameDifficulty-1], 256, 570, 387, 23);
        ctx.restore();
    }

    currentItems() {
        console.log("장착중인 아이템 목록:");
        for(const [key, value] of this.equippedItems) {
            console.log(` - ${key}: ${value}`);
        }
    }
}