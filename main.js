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
    
    // manager 들 초기화
    user = new User(5);      // 전역변수
    userCheckpoint = user.clone();
    bossGame = new BossGame(gameDifficulty);  // 난이도 설정 후 생성

    // 개발 시에만 if 문 사용, 완성시에는 초기에 mainGame.init만 사용하면 됨.
    if (CUR_GAME_STATE == GAME_STATE.BRICK_BREAKING) {
        mainGame.init();
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
        mainGame.gameStarted = true;
        $(this).hide();
        mainGame.draw();

        // 마스터 버튼들
        let btn1 = $('<button/>');
        btn1.text('블록 다 깨기');
        btn1.click(() => {
            // 현재 블록에 있는 모든 광물들 수집
            mainGame.collectAllItems();
            mainGame.isClear = true;
        });
        $('#masterBtns').append(btn1);
        let btn2 = $('<button/>');
        btn2.text('죽기');
        btn2.click(() => {
            user.heart.health = 0;
            user.hit(1);
        });
        $('#masterBtns').append(btn2);
        
        let btn3 = $('<button/>');
        btn3.text('보스 죽이기');
        btn3.click(() => {
            if (bossGame && bossGame.bossManager && bossGame.bossManager.curBoss) {
                bossGame.bossManager.curBoss.health = 1;
                bossGame.bossManager.curBoss.isDying = true;
                bossGame.bossManager.curBoss.dropItem();
                bossGame.bossManager.curBoss.deathSound.play();
            }
        });
        $('#masterBtns').append(btn3);
    });
    // 시작 버튼 처리
    $('#startButton').click(function() {
        $('#gameCanvas').show();
        mainGame.gameStarted = true;
        $(this).hide();
        mainGame.draw();

        // 마스터 버튼들
        let btn1 = $('<button/>');
        btn1.text('블록 다 깨기');
        btn1.click(() => {
            // 현재 블록에 있는 모든 광물들 수집
            mainGame.collectAllItems();
            mainGame.isClear = true;
        });
        $('#masterBtns').append(btn1);
        let btn2 = $('<button/>');
        btn2.text('죽기');
        btn2.click(() => {
            user.heart.health = 0;
        });
        $('#masterBtns').append(btn2);
        
        let btn3 = $('<button/>');
        btn3.text('보스 죽이기');
        btn3.click(() => {
            if (bossGame && bossGame.bossManager && bossGame.bossManager.curBoss) {
                bossGame.bossManager.curBoss.health = 1;
                bossGame.bossManager.curBoss.isDying = true;
                bossGame.bossManager.curBoss.dropItem();
                bossGame.bossManager.curBoss.deathSound.play();
            }
        });
        $('#masterBtns').append(btn3);
    });
    // 리스폰 버튼 처리
    $('#respawn').click(() => {
        mainGame.init();
        $('.dead').hide();
        mainGame.gameStarted = true;
        mainGame.draw();
    });
    
})