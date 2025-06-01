
// 배경화면 (오버월드, 네더월드, 엔더월드)
const overworld = new Image();
overworld.src = 'mainGame/background/overworld.png';
overworld.onload = function() {
	if (ctx) drawStartScreen();
};

const BACKGROUND_IMAGES = [
	overworld,
	overworld,
	overworld,
];

// 블럭 파괴 시 아이템 드랍
let fallingItems = [];

// 게임 진행 전역 변수
let gameStarted = false;
let isClear = true;

// 블록 관리 클래스
let brickManager;

// requestAnimationFrame 프레임 따라서 속도 달라짐 -> 속도 조정 필요
// 초기화 함수
function brick_breaking_init() {
	ball = new Ball(WIDTH/2, HEIGHT-150);
	paddle = new Paddle(WIDTH/2-50, HEIGHT-100);
	hotbar = new Hotbar(WIDTH/2-195, HEIGHT-60);
	brickManager = new BrickManager(gameDifficulty);
	
	drawStartScreen();
	havingItems = new Map();
	fallingItems = [];
}

// 초기 화면 그리기
function drawStartScreen() {
	if (BACKGROUND_IMAGES[gameDifficulty-1].complete) {
		ctx.drawImage(BACKGROUND_IMAGES[gameDifficulty-1], 0, 0, canvas.width, canvas.height);
	}
	
	ctx.font = "30px Arial";
	ctx.textAlign = "center";
	ctx.fillText("1단계: 아이템을 구해 위더를 이기세요.", canvas.width/2, canvas.height/2);
}

// 떨어지는 아이템 그리기
function drawFallingItems() {
	let deleteIdx = [];
	for(let i = 0; i < fallingItems.length; i++) {
		const item = fallingItems[i];
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
		const itemType = fallingItems[deleteIdx[i]].type;
		if (!havingItems.has(itemType)) havingItems.set(itemType, 0);
		havingItems.set(itemType, havingItems.get(itemType)+1);
		fallingItems.splice(deleteIdx[i], 1);
	}
}

// 죽을때
function gameover() {
	gameStarted = false;
	SOUND_EFFECT.death.play();
	$('.dead').css('display', 'flex');
}

// 조합창 내 클릭한 위치 반환
function getClickSection(pos) {
	let x = pos.left;
	let y = pos.top;
	if(x >= 310 && x <= 410 && y >= 230 && y <= 330) return 'crafting';
	else if(x >= 255 && x <= 610 && y >= 395 && y <= 540) return 'inventory';
}

// 조합 완료 확인
function checkCraftResult() {
	let sum = 0;
	let resultIndex = 0;
	let usedItem = new Map();

	// 나무 원목 -> 판자
	for(let i = 0; i < craftingItems.length; i++) {
		for(let j = 0; j < craftingItems[i].length; j++) {
			sum += craftingItems[i][j];
		}
	}
	if(sum === 1) {
		resultIndex = 4;
		usedItem.set(1, 1);
	}

	// 막대기 조합
	const centerColumn = [craftingItems[0][1], craftingItems[1][1], craftingItems[2][1]];

    // 경우 1: 상단 + 중간
    if (centerColumn[0] === 5 && centerColumn[1] === 5 &&
        craftingItems[0][0] === 0 && craftingItems[0][2] === 0 &&
        craftingItems[1][0] === 0 && craftingItems[1][2] === 0 &&
        craftingItems[2][0] === 0 && craftingItems[2][1] === 0 && craftingItems[2][2] === 0
    ) {
		resultIndex = 5;
		usedItem.set(5, 2);
	}
    // 경우 2: 중간 + 하단
    if (centerColumn[1] === 5 && centerColumn[2] === 5 &&
        craftingItems[0][0] === 0 && craftingItems[0][1] === 0 && craftingItems[0][2] === 0 &&
        craftingItems[1][0] === 0 && craftingItems[1][2] === 0 &&
        craftingItems[2][0] === 0 && craftingItems[2][2] === 0
    ) {
		resultIndex = 5;
		usedItem.set(5, 2);
    }

	// 검 조합
	if(craftingItems[0][0] == 0 && craftingItems[0][1] > 0 && craftingItems[0][2] == 0
		&& craftingItems[1][0] == 0 && craftingItems[1][1] == craftingItems[0][1] && craftingItems[1][2] == 0
		&& craftingItems[2][0] == 0 && craftingItems[2][1] == 6 && craftingItems[2][2] == 0) {
		resultIndex = craftingItems[0][1] + 4;
		usedItem.set(craftingItems[0][1], 2);
		usedItem.set(6, 1);
	}

	// 모자 조합
	let tmpV = craftingItems[0][0]
	if(tmpV > 0 && craftingItems[0][1] == tmpV && craftingItems[1][0] == tmpV
		&& craftingItems[1][0] == tmpV && craftingItems[1][1] == 0 && craftingItems[1][2] == tmpV
		&& craftingItems[2][0] == 0 && craftingItems[2][1] == 0 && craftingItems[2][2] == 0) {
		resultIndex = tmpV + 17;
		usedItem.set(tmpV, 5);
	}

	// 갑옷 조합
	tmpV = craftingItems[0][0];
	if(tmpV > 0 && craftingItems[0][1] == 0 && craftingItems[0][2] == tmpV
		&& craftingItems[1][0] == tmpV && craftingItems[1][1] == tmpV && craftingItems[1][2] == tmpV
		&& craftingItems[2][0] == tmpV && craftingItems[2][1] == tmpV && craftingItems[2][2]) {
		resultIndex = tmpV + 14;
		usedItem.set(tmpV, 8);
	}

	// 바지 조합
	tmpV = craftingItems[0][0];
	if(tmpV > 0 && craftingItems[0][1] == tmpV && craftingItems[0][2] == tmpV
		&& craftingItems[1][0] == tmpV && craftingItems[1][1] == 0 && craftingItems[1][2] == tmpV
		&& craftingItems[2][0] == tmpV && craftingItems[2][1] == 0 && craftingItems[2][2] == tmpV) {
		resultIndex = tmpV + 11;
		usedItem.set(tmpV, 7);
	}

	// 신발 조합
	tmpV = craftingItems[1][0];
	if(craftingItems[0][0] == 0 && craftingItems[0][1] == 0 && craftingItems[0][2] == 0
		&& tmpV > 0 && craftingItems[1][1] == 0 && craftingItems[1][2] == tmpV
		&& craftingItems[2][0] == tmpV && craftingItems[2][1] == 0 && craftingItems[2][2] == tmpV) {
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

		newDiv.on('mousedown', function(e) {

			for(let [itemType, count] of usedItem.entries()) {
				let current = havingItems.get(itemType - 1);
				havingItems.set(itemType - 1, current - count);
				if(havingItems.get(itemType - 1) == 0) {
					havingItems.delete(itemType - 1);
				}
			}

			for(let i = 0; i < craftingItems.length; i++) {
				for(let j = 0; j < craftingItems.length; j++) {
					craftingItems[i][j] = 0;
				}
			}
			
			if(havingItems.has(resultIndex)) havingItems.set(resultIndex, havingItems.get(resultIndex) + 1);
			else havingItems.set(resultIndex, 1);
			$('.clear_item').remove();
			drawInventory();
		});
			
		$('.clear').append(newDiv);
	}
}


// 조합창에 올려진 아이템을 저장하는 배열
let craftingItems = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]]

// 조합창의 칸 좌표를 저장하는 배열
let craftingPos = [
	{top: 235, left: 310}, {top: 230, left: 355}, {top: 230, left: 395},
	{top: 275, left: 310}, {top: 275, left: 355}, {top: 275, left: 395},
	{top: 320, left: 310}, {top: 320, left: 355}, {top: 320, left: 395}
];

// 이벤트 처리를 위한 전역변수 선언

let itemClicked = false;
let offsetX = 0;
let offsetY = 0;
let currentlyDraggingDiv = null;

$(document).on('mousemove', function(e) {
	if(itemClicked && currentlyDraggingDiv) {
		currentlyDraggingDiv.css({
			left: `${e.clientX - offsetX}px`,
			top: `${e.clientY - offsetY}px`
		});
	}
});

// 아이템을 클릭할 때 이벤트 함수
function handleLeftClick(e, newDiv, newImg) {
    const pos = newDiv.position();

    if (e.button === 0) {
		
        let clickSection = getClickSection(pos);
        if (clickSection === 'inventory' || clickSection === 'crafting') {
            itemClicked = !itemClicked;

            if (itemClicked) {
                // 드래그 시작
                offsetX = e.clientX - pos.left;
                offsetY = e.clientY - pos.top;
				currentlyDraggingDiv = newDiv;

                if (clickSection === 'crafting') {
					newDiv.removeClass('item_in_craft');
                    let i;
                    for (i = 0; i < 9; i++) {
                        if (pos.left >= craftingPos[i].left && pos.left <= craftingPos[i].left + 40 &&
                            pos.top >= craftingPos[i].top && pos.top <= craftingPos[i].top + 40) {
                            break;
                        }
                    }
                    craftingItems[parseInt(i / 3)][parseInt(i % 3)] = 0;
                }
            } else {
				currentlyDraggingDiv = null;
				$('#result_item').remove();
                // 드래그 놓기
                if (clickSection === 'crafting') {

					newDiv.addClass('item_in_craft');
					const centerX = pos.left + newDiv.outerWidth() / 2;
					const centerY = pos.top + newDiv.outerHeight() / 2;


                    let i;
                    for (i = 0; i < 9; i++) {
                        if (centerX >= craftingPos[i].left && centerX <= craftingPos[i].left + 40 &&
                            centerY >= craftingPos[i].top && centerY <= craftingPos[i].top + 40) {
                            break;
                        }
                    }

                    const itmSrc = newImg.attr('src').split('/').pop().replace('.png', '');
                    let indexX = parseInt(i / 3);
                    let indexY = parseInt(i % 3);

                    if (itmSrc === 'wood') craftingItems[indexX][indexY] = 1;
                    else if (itmSrc === 'stick') craftingItems[indexX][indexY] = 6;
                    else if (itmSrc === 'plank') craftingItems[indexX][indexY] = 5;
                    else if (itmSrc === 'iron') craftingItems[indexX][indexY] = 2;
                    else if (itmSrc === 'gold') craftingItems[indexX][indexY] = 3;
                    else if (itmSrc === 'diamond') craftingItems[indexX][indexY] = 4;

					checkCraftResult();
                }

            }
        }
    }
};

// 아이템 우클릭 이벤트 처리
function handleRightClick(e, originalDiv, originalImg) {
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

	offsetX = e.clientX - originalDiv.position().left;
	offsetY = e.clientY - originalDiv.position().top;

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

	currentlyDraggingDiv = halfDiv;
	itemClicked = true;

	// 새 div에도 이벤트 등록
	halfDiv.on('mousedown', function (ev) {
		handleLeftClick(ev, halfDiv, halfImg);
	});
	halfDiv.on('contextmenu', function (ev) {
		ev.preventDefault();
		handleRightClick(ev, halfDiv, halfImg);
	});
}


// 조합창에 아이템을 그리는 함수
function drawInventory() {
	let index = 0;
	for(let [itemType, count] of havingItems.entries()) {
		
		// 아이템 그리기
		const newDiv = $('<div />').addClass('clear_item').css({
			'left': `${262 + (index % 9) * 43}px`,
			'top': `${400 + (parseInt(index / 9)) * 43}px`,
			'position': 'absolute',
			'cursor': 'move'
		});

		const newImg = $('<img />').addClass('clear_item').attr('src', itemPaths[itemType]).css({ 'width': '32px', 'height': '32px' });
		newDiv.append(newImg);
		newDiv.attr('data-type', itemType);
	
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
		newDiv.on('mousedown', function(e) {
			handleLeftClick(e, newDiv, newImg);
		});

		// 우클릭 이벤트 추가 - 아이템 쪼개기
		newDiv.on('contextmenu', function(e) {
			e.preventDefault();
			handleRightClick(e, newDiv, newImg);
		});

		$('.clear').append(newDiv);
		index++;
	}
}

// 클리어
function gameclear() {
	
	havingItems.set(1, 20);  // 철
	havingItems.set(0, 20);  // 원목
	havingItems.set(4, 20);  // plank
	havingItems.set(2, 20);  // gold
	havingItems.set(3, 20);  // diamond
	havingItems.set(5, 20);  // stick
	

	SOUND_EFFECT.clear.play();
	$('.clear').css('display', 'flex');
	
	drawInventory();
}

			
// 메인 게임 루프
function draw() {
	if (!gameStarted) return;
	if (isClear) {
		gameclear();
		return;
	}
				
	ctx.clearRect(0, 0, canvas.width, canvas.height);
				
	// 배경 이미지 그리기
	if (BACKGROUND_IMAGES[gameDifficulty-1] && BACKGROUND_IMAGES[gameDifficulty-1].complete) {
		ctx.drawImage(BACKGROUND_IMAGES[gameDifficulty-1], 0, 0, canvas.width, canvas.height);
	}
				
	isClear = brickManager.draw(fallingItems.length);
	ball.draw();
	paddle.draw();
	drawFallingItems();
	brickManager.collisionDetection(ball);
	paddle.collisionDetection(ball);
	hotbar.draw(havingItems);
				
	// 패들 이동 및 기울기 처리
	paddle.updateRocation(canvas, leftPressed, rightPressed);
				
	// 공 회전 및 이동
	ball.updateRotation();
	ball.updateLocation();
				
	// 벽 충돌 처리
	if(ball.x + ball.width > canvas.width || ball.x < 0) {
		ball.dx = -ball.dx;
	}
	if(ball.y < 0) {
		ball.dy = -ball.dy;
	}
				
	else if(ball.y + ball.height > canvas.height) {
		console.log(ball.y, ball.height, canvas.height);
		gameover();
	}
				
	requestAnimationFrame(draw);
}