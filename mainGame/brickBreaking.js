
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
let isClear = false;

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

// 클리어
function gameclear() {
	// 테스트용 코드
	
	havingItems.set(1, 2);
	havingItems.set(0, 1);
	havingItems.set(4, 5);
	havingItems.set(2, 3);
	havingItems.set(3, 4);
	
	
	SOUND_EFFECT.clear.play();
	$('.clear').css('display', 'flex');
	
	let i = 0;
	for (let [itemType, count] of havingItems.entries()) {
		
		const newDiv = $('<div />').addClass('clear_item').css({
			'left': `${262 + i * 43}px`,
			'top': '535px',
			'position': 'absolute',
			'cursor': 'move'
		});
		
		const newImg = $('<img />').addClass('clear_item');
		
		newImg.attr('src', itemPaths[itemType]);
		newImg.css({
			'width': '32px',
			'height': '32px'
		});
		newDiv.append(newImg);
		
		/*
		newI.css({
		'background-image': `url(${itemImages[itemType].src})`,
		'background-size': 'contain',
		'left': `${260 + i * 43}px`,
		'top': '535px',
		});
		*/
		
		if(count > 1) {
			const countSpan = $('<span />').text(count).css({
				'position': 'absolute',
				'bottom': '0',
				'right': '0',
				'font-family': 'Minecraftia',
				'font-size': '15px',
				'color': '#FFFFFF',
				'text-shadow': '1px 1px 0 #000000',
				'padding': '0px'
			});
			newDiv.append(countSpan);
		}
		
		let isDragging = false;
		let offsetX, offsetY;
		
		newDiv.on('mousedown', function (e) {
			isDragging = true;
			offsetX = e.clientX - newDiv.position().left;
			offsetY = e.clientY - newDiv.position().top;
			
			$(document).on('mousemove.drag', function (e) {
				if (isDragging) {
					const x = e.clientX - offsetX;
					const y = e.clientY - offsetY;
					
					newDiv.css({
						left: `${x}px`,
						top: `${y}px`
					});
					
					console.log(`Dragging: x = ${x}, y = ${y}`);
				}
			});
			
			$(document).on('mouseup.drag', function () {
				if (isDragging) {
					isDragging = false;
					$(document).off('.drag'); // remove mousemove and mouseup handlers
					const finalX = newDiv.position().left;
					const finalY = newDiv.position().top;
					console.log(`Dropped at: x = ${finalX}, y = ${finalY}`);
				}
			});
		});
		
		//newDiv.addEventListener("dragstart", )
		$('.clear').append(newDiv);
		i++;
		
		/*
		const newDiv = document.createElement('div');
		newDiv.className = 'clear_item';
		newDiv.css({})
		
		// 아이템
		ctx.drawImage(itemImages[itemType], hotbar.x + 11 + i*42, hotbar.y + 8, 33, 33);
		
		// 아이템 개수
		if (count == 1) {
		i++;
		continue;
		}
		ctx.font = "20px Minecraftia";
		ctx.textAlign = "right";
		ctx.fillStyle = "rgba(0, 0, 0, .5)";
		ctx.fillText(count, hotbar.x + 53 + 42*i, hotbar.y + 46);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(count, hotbar.x + 50 + 42*i, hotbar.y + 43);
		
		i++;
		*/
	}   
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