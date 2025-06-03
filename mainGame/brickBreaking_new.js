// 메인 게임 클래스
class MainGame {
    constructor() {
        this.overworld = new Image();
        this.overworld.src = 'mainGame/background/overworld.png';
        this.overworld.onload = () => {
            if (ctx) this.drawStartScreen();
        };

        this.BACKGROUND_IMAGES = [
            this.overworld,
            this.overworld,
            this.overworld,
        ];

        this.fallingItems = [];
        this.gameStarted = false;
        this.isClear = false;
        this.brickManager = null;
        this.craftingItems = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        this.craftingPos = [
            {top: 235, left: 310}, {top: 230, left: 355}, {top: 230, left: 395},
            {top: 275, left: 310}, {top: 275, left: 355}, {top: 275, left: 395},
            {top: 320, left: 310}, {top: 320, left: 355}, {top: 320, left: 395}
        ];
        this.itemClicked = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentlyDraggingDiv = null;
        
        this.bindEvents();
    }

    // 초기화 함수
    init() {
        ball = new Ball(WIDTH/2, HEIGHT-150);
        paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
        hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
        this.brickManager = new BrickManager(gameDifficulty);
        
        this.drawStartScreen();
        user = userCheckpoint.clone();
        this.fallingItems = [];
        this.gameStarted = false;
        this.isClear = false;
    }

    // 게임 시작
    start() {
        this.gameStarted = true;
        this.draw();
    }

    // 초기 화면 그리기
    drawStartScreen() {
        if (this.BACKGROUND_IMAGES[gameDifficulty-1].complete) {
            ctx.drawImage(this.BACKGROUND_IMAGES[gameDifficulty-1], 0, 0, canvas.width, canvas.height);
        }
        
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("오버월드: 아이템을 구해 위더를 이기세요.", canvas.width/2, canvas.height/2);
    }

    // 떨어지는 아이템 그리기
    drawFallingItems() {
        let deleteIdx = [];
        for(let i = 0; i < this.fallingItems.length; i++) {
            const item = this.fallingItems[i];
            // 슬라임 영역 안에 있을 때 아이템 먹기
            if (item.y + item.height > paddle.y &&
                item.y < paddle.y + paddle.height &&
                item.x + item.width > paddle.x &&
                item.x < paddle.x + paddle.width
            ) {
                paddle.eatSound.play();
                deleteIdx.push(i);
                continue;
            }
            item.y += item.dy;
            
            // 아이템 그리기
            ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
        }
        
        // fallingItem에서 아이템 제거 및 인벤토리에 추가
        for (let i = deleteIdx.length-1; i >= 0; i--) {
            const itemType = this.fallingItems[deleteIdx[i]].type;
            if (!user.havingItems.has(itemType)) user.havingItems.set(itemType, 0);
            user.havingItems.set(itemType, user.havingItems.get(itemType)+1);
            this.fallingItems.splice(deleteIdx[i], 1);
        }
    }

    // 죽을때
    gameover() {
        this.gameStarted = false;
        SOUND_EFFECT.death.play();
        $('.dead').css('display', 'flex');
    }

    // 조합창 내 클릭한 위치 반환
    getClickSection(pos) {
        let x = pos.left;
        let y = pos.top;
        if(x >= 310 && x <= 410 && y >= 230 && y <= 330) return 'crafting';
        else if(x >= 255 && x <= 610 && y >= 395 && y <= 540) return 'inventory';
    }

    // 조합 완료 확인
    checkCraftResult() {
        let sum = 0;
        let resultIndex = 0;
        let usedItem = new Map();

        // 나무 원목 -> 판자
        for(let i = 0; i < this.craftingItems.length; i++) {
            for(let j = 0; j < this.craftingItems[i].length; j++) {
                sum += this.craftingItems[i][j];
            }
        }
        if(sum === 1) {
            resultIndex = 4;
            usedItem.set(1, 1);
        }

        // 막대기 조합
        const centerColumn = [this.craftingItems[0][1], this.craftingItems[1][1], this.craftingItems[2][1]];

        // 경우 1: 상단 + 중간
        if (centerColumn[0] === 5 && centerColumn[1] === 5 &&
            this.craftingItems[0][0] === 0 && this.craftingItems[0][2] === 0 &&
            this.craftingItems[1][0] === 0 && this.craftingItems[1][2] === 0 &&
            this.craftingItems[2][0] === 0 && this.craftingItems[2][1] === 0 && this.craftingItems[2][2] === 0
        ) {
            resultIndex = 5;
            usedItem.set(5, 2);
        }
        // 경우 2: 중간 + 하단
        if (centerColumn[1] === 5 && centerColumn[2] === 5 &&
            this.craftingItems[0][0] === 0 && this.craftingItems[0][1] === 0 && this.craftingItems[0][2] === 0 &&
            this.craftingItems[1][0] === 0 && this.craftingItems[1][2] === 0 &&
            this.craftingItems[2][0] === 0 && this.craftingItems[2][2] === 0
        ) {
            resultIndex = 5;
            usedItem.set(5, 2);
        }

        // 검 조합
        if(this.craftingItems[0][0] == 0 && this.craftingItems[0][1] > 0 && this.craftingItems[0][2] == 0
            && this.craftingItems[1][0] == 0 && this.craftingItems[1][1] == this.craftingItems[0][1] && this.craftingItems[1][2] == 0
            && this.craftingItems[2][0] == 0 && this.craftingItems[2][1] == 6 && this.craftingItems[2][2] == 0) {
            resultIndex = this.craftingItems[0][1] + 4;
            usedItem.set(this.craftingItems[0][1], 2);
            usedItem.set(6, 1);
        }

        // 모자 조합
        let tmpV = this.craftingItems[0][0]
        if(tmpV > 0 && this.craftingItems[0][1] == tmpV && this.craftingItems[1][0] == tmpV
            && this.craftingItems[1][0] == tmpV && this.craftingItems[1][1] == 0 && this.craftingItems[1][2] == tmpV
            && this.craftingItems[2][0] == 0 && this.craftingItems[2][1] == 0 && this.craftingItems[2][2] == 0) {
            resultIndex = tmpV + 17;
            usedItem.set(tmpV, 5);
        }

        // 갑옷 조합
        tmpV = this.craftingItems[0][0];
        if(tmpV > 0 && this.craftingItems[0][1] == 0 && this.craftingItems[0][2] == tmpV
            && this.craftingItems[1][0] == tmpV && this.craftingItems[1][1] == tmpV && this.craftingItems[1][2] == tmpV
            && this.craftingItems[2][0] == tmpV && this.craftingItems[2][1] == tmpV && this.craftingItems[2][2]) {
            resultIndex = tmpV + 14;
            usedItem.set(tmpV, 8);
        }

        // 바지 조합
        tmpV = this.craftingItems[0][0];
        if(tmpV > 0 && this.craftingItems[0][1] == tmpV && this.craftingItems[0][2] == tmpV
            && this.craftingItems[1][0] == tmpV && this.craftingItems[1][1] == 0 && this.craftingItems[1][2] == tmpV
            && this.craftingItems[2][0] == tmpV && this.craftingItems[2][1] == 0 && this.craftingItems[2][2] == tmpV) {
            resultIndex = tmpV + 11;
            usedItem.set(tmpV, 7);
        }

        // 신발 조합
        tmpV = this.craftingItems[1][0];
        if(this.craftingItems[0][0] == 0 && this.craftingItems[0][1] == 0 && this.craftingItems[0][2] == 0
            && tmpV > 0 && this.craftingItems[1][1] == 0 && this.craftingItems[1][2] == tmpV
            && this.craftingItems[2][0] == tmpV && this.craftingItems[2][1] == 0 && this.craftingItems[2][2] == tmpV) {
            resultIndex = tmpV + 8;
            usedItem.set(tmpV, 4);
        }
        
        if(resultIndex > 0) {
            // 조합 완료 아이템
            const newDiv = $('<div />').addClass('clear_item').css({
                'left': `538px`,
                'top': '280px',
                'position': 'absolute',
                'cursor': 'move'
            });

            const newImg = $('<img />').addClass('clear_item');

            newImg.attr('src', itemPaths[resultIndex]).css({'width': '32px', 'height': '32px'});
            newDiv.append(newImg);

            newDiv.on('mousedown', (e) => {
                for(let [itemType, count] of usedItem.entries()) {
                    let current = user.havingItems.get(itemType - 1);
                    user.havingItems.set(itemType - 1, current - count);
                    if(user.havingItems.get(itemType - 1) == 0) {
                        user.havingItems.delete(itemType - 1);
                    }
                }

                for(let i = 0; i < this.craftingItems.length; i++) {
                    for(let j = 0; j < this.craftingItems.length; j++) {
                        this.craftingItems[i][j] = 0;
                    }
                }
                
                if(user.havingItems.has(resultIndex)) user.havingItems.set(resultIndex, user.havingItems.get(resultIndex) + 1);
                else user.havingItems.set(resultIndex, 1);
                $('.clear_item').remove();
                this.drawInventory();
            });
                
            $('.clear').append(newDiv);
        }
    }

    // 이벤트 바인딩
    bindEvents() {
        $(document).on('mousemove', (e) => {
            if(this.itemClicked && this.currentlyDraggingDiv) {
                this.currentlyDraggingDiv.css({
                    left: `${e.clientX - this.offsetX}px`,
                    top: `${e.clientY - this.offsetY}px`
                });
            }
        });

        $(document).on('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.startBoss();    
            }
        });
    }

    // 아이템을 클릭할 때 이벤트 함수
    handleLeftClick(e, newDiv, newImg) {
        const pos = newDiv.position();

        if (e.button === 0) {
            let clickSection = this.getClickSection(pos);
            if (clickSection === 'inventory' || clickSection === 'crafting') {
                this.itemClicked = !this.itemClicked;

                if (this.itemClicked) {
                    // 드래그 시작
                    this.offsetX = e.clientX - pos.left;
                    this.offsetY = e.clientY - pos.top;
                    this.currentlyDraggingDiv = newDiv;

                    if (clickSection === 'crafting') {
                        newDiv.removeClass('item_in_craft');
                        let i;
                        for (i = 0; i < 9; i++) {
                            if (pos.left >= this.craftingPos[i].left && pos.left <= this.craftingPos[i].left + 40 &&
                                pos.top >= this.craftingPos[i].top && pos.top <= this.craftingPos[i].top + 40) {
                                break;
                            }
                        }
                        this.craftingItems[parseInt(i / 3)][parseInt(i % 3)] = 0;
                    }
                } else {
                    this.currentlyDraggingDiv = null;
                    $('#result_item').remove();
                    // 드래그 놓기
                    if (clickSection === 'crafting') {

                        newDiv.addClass('item_in_craft');
                        const centerX = pos.left + newDiv.outerWidth() / 2;
                        const centerY = pos.top + newDiv.outerHeight() / 2;

                        let i;
                        for (i = 0; i < 9; i++) {
                            if (centerX >= this.craftingPos[i].left && centerX <= this.craftingPos[i].left + 40 &&
                                centerY >= this.craftingPos[i].top && centerY <= this.craftingPos[i].top + 40) {
                                break;
                            }
                        }

                        const itmSrc = newImg.attr('src').split('/').pop().replace('.png', '');
                        let indexX = parseInt(i / 3);
                        let indexY = parseInt(i % 3);

                        if (itmSrc === 'wood') this.craftingItems[indexX][indexY] = 1;
                        else if (itmSrc === 'stick') this.craftingItems[indexX][indexY] = 6;
                        else if (itmSrc === 'plank') this.craftingItems[indexX][indexY] = 5;
                        else if (itmSrc === 'iron') this.craftingItems[indexX][indexY] = 2;
                        else if (itmSrc === 'gold') this.craftingItems[indexX][indexY] = 3;
                        else if (itmSrc === 'diamond') this.craftingItems[indexX][indexY] = 4;

                        this.checkCraftResult();
                    }
                }
            }
        }
    }

    // 아이템 우클릭 이벤트 처리
    handleRightClick(e, originalDiv, originalImg) {
        const countSpan = originalDiv.find('span');
        let count = parseInt(countSpan.text());
        if (count < 2) return;

        const half1 = count - Math.floor(count / 2);
        const half2 = count - half1;

        countSpan.text(half1);

        const halfDiv = $('<div />').addClass('clear_item').css({
            left: originalDiv.position().left,
            top: originalDiv.position().top,
            position: 'absolute',
            cursor: 'move'
        });

        this.offsetX = e.clientX - originalDiv.position().left;
        this.offsetY = e.clientY - originalDiv.position().top;

        const halfSrc = originalImg.attr('src');
        const halfImg = $('<img />').addClass('clear_item').attr('src', halfSrc).css({
            width: '32px',
            height: '32px',
            pointerEvents: 'none'
        });

        const halfSpan = $('<span />').text(half2).css({
            position: 'absolute',
            bottom: '0',
            right: '0',
            fontFamily: 'Minecraftia',
            fontSize: '14px',
            color: '#FFFFFF',
            textShadow: '1px 1px 0 #000000'
        });

        halfSpan.on('contextmenu', function(e) {
            e.preventDefault();
        });

        halfDiv.append(halfImg).append(halfSpan);
        $('.clear').append(halfDiv);

        this.currentlyDraggingDiv = halfDiv;
        this.itemClicked = true;

        // 새 div에도 이벤트 등록
        halfDiv.on('mousedown', (ev) => {
            this.handleLeftClick(ev, halfDiv, halfImg);
        });
        halfDiv.on('contextmenu', (ev) => {
            ev.preventDefault();
            this.handleRightClick(ev, halfDiv, halfImg);
        });
    }

    // 조합창에 아이템을 그리는 함수
    drawInventory() {
        let index = 0;
        for(let [itemType, count] of user.havingItems.entries()) {
            
            // 아이템 그리기
            const newDiv = $('<div />').addClass('clear_item').css({
                'left': `${262 + (index % 9) * 43}px`,
                'top': `${398 + (parseInt(index / 9)) * 43}px`,
                'position': 'absolute',
                'cursor': 'move'
            });

            const newImg = $('<img />').addClass('clear_item').attr('src', itemPaths[itemType]).css({ 'width': '32px', 'height': '32px' });
            newDiv.append(newImg);

            for(const [key, value] of user.equippedItems) {
                if(newImg.attr('src').split('/').pop().replace('.png', '') == value) newDiv.addClass('equipped-highlight');
            }
        
            // 아이템 수량 출력하는 span
            const countSpan = $('<span />').text(count).css({
                'position': 'absolute',
                'bottom': '0',
                'right': '0',
                'font-family': 'Minecraftia',
                'font-size': '14px',
                'color': '#FFFFFF',
                'text-shadow': '1px 1px 0 #000000',
            });
            newDiv.append(countSpan);
            
            countSpan.on('contextmenu', function(e) {
                e.preventDefault();
            });

            // 좌클릭 이벤트 추가 - 아이템 이동
            newDiv.on('mousedown', (e) => {
                this.handleLeftClick(e, newDiv, newImg);
            });

            // 우클릭 이벤트 추가 - 아이템 쪼개기
            newDiv.on('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(e, newDiv, newImg);
            });

            // 더블클릭 이벤트 추가 - 아이템 장착
            newDiv.on('dblclick', (e) => {
                const itmSrc = newImg.attr('src').split('/').pop().replace('.png', '');
                const itemInfo = itmSrc.split('_');
                if(itemInfo[1] == 'boots' || itemInfo[1] == 'chestplate' || itemInfo[1] == 'helmet' || itemInfo[1] == 'leggings' || itemInfo[1] == 'sword') {
                    user.equippedItems.set(itemInfo[1], itmSrc);
                    user.currentItems();
                    let tmpEquipped = $('.equipped-highlight');
                    for(let i = 0; i < tmpEquipped.length; i++) {
                        let tmpImg = $(tmpEquipped[i]).find('img').attr('src');
                        let tmpSrc = tmpImg.split('/').pop().replace('.png', '').split('_');
                        if(itemInfo[1] === tmpSrc[1]) {
                            $(tmpEquipped[i]).removeClass('equipped-highlight');
                        }
                    }
                    newDiv.addClass('equipped-highlight');
                }
            });

            $('.clear').append(newDiv);
            index++;
        }
    }

    // 클리어
    gameclear() {
        user.havingItems.set(1, 20);  // 철
        user.havingItems.set(0, 20);  // 원목
        user.havingItems.set(4, 20);  // plank
        user.havingItems.set(2, 20);  // gold
        user.havingItems.set(3, 20);  // diamond
        user.havingItems.set(5, 20);  // stick

        SOUND_EFFECT.clear.play();
        $('.clear').css('display', 'flex');
        
        this.drawInventory();
    }

    startBoss() {
        if($('.clear').css('display') == 'flex') {
            $('.clear').css('display', 'none');
            bossGame.init(gameDifficulty);
        }
    }

    // 메인 게임 루프
    draw(currentTime) {
        if (!this.gameStarted) return;
        if (this.isClear) {
            this.gameclear();
            return;
        }
        
        // deltaTime 계산
        const deltaTime = currentTime - (this.draw.lastTime || currentTime);
        this.draw.lastTime = currentTime;

        const timeStep = 1000 / 60; // 목표 60fps
        const normalizedDeltaTime = deltaTime / timeStep;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 배경 이미지 그리기
        if (this.BACKGROUND_IMAGES[gameDifficulty-1] && this.BACKGROUND_IMAGES[gameDifficulty-1].complete) {
            ctx.drawImage(this.BACKGROUND_IMAGES[gameDifficulty-1], 0, 0, canvas.width, canvas.height);
        }
        
        this.isClear = this.brickManager.draw(this.fallingItems.length);
        ball.draw();
        paddle.draw();
        this.drawFallingItems();
        this.brickManager.collisionDetection(ball);
        paddle.collisionDetection(ball);
        user.draw();
        
        // 패들 이동 및 기울기 처리
        paddle.updateRocation(canvas, leftPressed, rightPressed);
        
        // 공 회전 및 이동
        ball.updateRotation();
        ball.updateLocation();
        
        // 벽 충돌 처리
        if(ball.x + ball.width > canvas.width || ball.x < 0) {
            ball.dx = -ball.dx;
            // 벽에 부딪힐 때 위치 보정
            if(ball.x < 0) ball.x = 0;
            if(ball.x + ball.width > canvas.width) ball.x = canvas.width - ball.width;
        }
        if(ball.y < 0) {
            ball.dy = -ball.dy;
            ball.y = 0; // 천장에 부딪힐 때 위치 보정
        }
        else if(ball.y + ball.height > canvas.height) {
            this.gameover();
        }
        
        requestAnimationFrame((time) => this.draw(time));
    }
}

// 메인 게임 인스턴스 생성
const mainGame = new MainGame();

// 기존 함수들을 호환성을 위해 유지
function brick_breaking_init() {
    mainGame.init();
}

function drawStartScreen() {
    mainGame.drawStartScreen();
}

function drawFallingItems() {
    mainGame.drawFallingItems();
}

function gameover() {
    mainGame.gameover();
}

function getClickSection(pos) {
    return mainGame.getClickSection(pos);
}

function checkCraftResult() {
    mainGame.checkCraftResult();
}

function handleLeftClick(e, newDiv, newImg) {
    mainGame.handleLeftClick(e, newDiv, newImg);
}

function handleRightClick(e, originalDiv, originalImg) {
    mainGame.handleRightClick(e, originalDiv, originalImg);
}

function drawInventory() {
    mainGame.drawInventory();
}

function gameclear() {
    mainGame.gameclear();
}

function startBoss() {
    mainGame.startBoss();
}

function draw(currentTime) {
    mainGame.draw(currentTime);
}
