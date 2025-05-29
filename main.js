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

    if (CUR_GAME_STATE == GAME_STATE.BRICK_BREAKING) {
        brick_breaking_init();
    }
    
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