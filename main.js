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
    user = new User();      // 전역변수
    bossGame = new BossGame(gameDifficulty);
    gameDifficulty = 2;

    // 개발 시에만 if 문 사용, 완성시에는 초기에 brick_breaking_init만 사용하면 됨.
    if (CUR_GAME_STATE == GAME_STATE.BRICK_BREAKING) {
        brick_breaking_init();
    } 
    
    // 임시: 보스전 시작버튼
    $('#tmp_boss_start').click(() => {
        gameStarted = false;
        bossGame.init(gameDifficulty);
    });
    // 시작 버튼 처리
    $('#startButton').click(function() {
        $('#gameCanvas').show();
        gameStarted = true;
        $(this).hide();
        draw();
    });
    // 리스폰 버튼 처리
    $('#respawn').click(() => {
        brick_breaking_init();
        $('.dead').hide();
        gameStarted = true;
        draw();
    });
})