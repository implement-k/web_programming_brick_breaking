const GAME_STATE = {
    BRICK_BREAKING: 1,
    BOSS: 2,
}
const CUR_GAME_STATE = 1;

$(document).ready(function () {
    canvas = $('#gameCanvas')[0];
    ctx = canvas.getContext('2d');
    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);

    gameDifficulty = 2;  // 먼저 난이도 설정
    
    // manager 들 초기화
    user = new User(5);      // 전역변수
    userCheckpoint = user.clone();
    bossGame = new BossGame(gameDifficulty);  // 난이도 설정 후 생성

    // 개발 시에만 if 문 사용, 완성시에는 초기에 brick_breaking_init만 사용하면 됨.
    if (CUR_GAME_STATE == GAME_STATE.BRICK_BREAKING) {
        brick_breaking_init();
    } 
    
    // 임시: 보스전 시작버튼
    $('#tmp_boss_start').click(() => {
        gameStarted = false;
        $('.clear').hide();
        bossGame.init(gameDifficulty);
    });
    // 임시: 게임 시작
    $('#tmp_game_start').click(() => {
        $('#gameCanvas').show();
        gameStarted = true;
        $(this).hide();
        draw();

        // 마스터 버튼들
        let btn1 = $('<button/>');
        btn1.text('블록 다 깨기');
        btn1.click(() => {
            isClear = true;
    //         for(let i = fallingItems.length-1; i >= 0; i--) {
    //             const item = fallingItems[i];

	// 	// 슬라임 영역 안에 있을 때 아이템 먹기
	// 	if (item.y + item.height > paddle.y &&
	// 		item.y < paddle.y + paddle.height &&
	// 		item.x + item.width > paddle.x &&
	// 		item.x < paddle.x + paddle.width
	// 	) {
	// 		paddle.eatSound.play();
	// 		deleteIdx.push(i);
	// 		continue;
	// 	}
	// 	item.y += item.dy;
		
	// 	// 아이템 그리기
	// 	ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
	// }
	
	// // fallingItem에서 아이템 제거 및 인벤토리에 추가
	// for (let i = deleteIdx.length-1; i >= 0; i--) {
	// 	const itemType = fallingItems[deleteIdx[i]].type;
	// 	if (!user.havingItems.has(itemType)) user.havingItems.set(itemType, 0);
	// 	user.havingItems.set(itemType, user.havingItems.get(itemType)+1);
	// 	fallingItems.splice(deleteIdx[i], 1);
	// }
            // 블록 아이템 모두 유저걸로
        });
        $('#masterBtns').append(btn1);
        let btn2 = $('<button/>');
        btn2.text('죽기');
        btn2.click(() => {
            user.heart.health = 0;
            user.hit(1);
        });
        $('#masterBtns').append(btn2);
    });
    // 시작 버튼 처리
    $('#startButton').click(function() {
        $('#gameCanvas').show();
        gameStarted = true;
        $(this).hide();
        draw();

        // 마스터 버튼들
        let btn1 = $('<button/>');
        btn1.text('블록 다 깨기');
        btn1.click(() => {
            isClear = true;
            // 블록 아이템 모두 유저걸로
        });
        $('#masterBtns').append(btn1);
        let btn2 = $('<button/>');
        btn2.text('죽기');
        btn2.click(() => {
            user.heart.health = 0;
        });
        $('#masterBtns').append(btn2);
    });
    // 리스폰 버튼 처리
    $('#respawn').click(() => {
        brick_breaking_init();
        $('.dead').hide();
        gameStarted = true;
        draw();
    });
    
})