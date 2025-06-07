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

    gameDifficulty = 1;  // 먼저 난이도 설정

    // manager 들 초기화
    user = new User(5, 9);      // 전역변수
    userCheckpoint = user.clone();
    bossGame = new BossGame(gameDifficulty);  // 난이도 설정 후 생성

    // 개발 시에만 if 문 사용, 완성시에는 초기에 mainGame.init만 사용하면 됨.
    if (CUR_GAME_STATE == GAME_STATE.BRICK_BREAKING) {
        mainGame.init();
    }

    // 리스폰 버튼 처리
    $('#respawn').click(() => {
        let preserveUser = false;

        const miniGameVisible = $('#miniGameCanvas').is(':visible');

        if (miniGameVisible) {
            // 미니게임에서 메인 게임으로 돌아가기
            $('#miniGameCanvas').hide();
            $('#gameCanvas').show();
        } else {
            // 보스 게임에서 온 경우 원래 상태로 복원
            if (bossGame && bossGame.originUser) {
                user = bossGame.originUser.clone();
                bossGame.originUser = null; // 백업 정리
                preserveUser = true; // 복원된 user 상태 유지
            }

            mainGame.init(preserveUser);
        }

        $('.dead').hide();
        // gameStarted 설정과 draw() 호출 대신 start() 메서드 사용
        mainGame.start();
    });
    $('#go2title').click(() => {
        $('#masterBtns').empty();
        // 타이틀 화면으로 돌아가기
        $('#gameCanvas').hide();
        $('.dead').hide();
        showScene('title-screen');
        if (user.score > 0) {
            let li = $("<li />");
            li.text(`${userName} - ${user.score}`);
            $('#score-list').append(li);
        }

        // 게임 상태 초기화
        gameDifficulty = 1;  // 난이도 초기화
        user = new User(5, 9);  // 사용자 상태 초기화
        bossGame = new BossGame(gameDifficulty);  // 보스 게임 초기화
    });
});

function miniGameStart() {
    console.log('미니 게임 시작');

    $('#gameCanvas').hide();

    $('#miniGameCanvas').show();

    if (typeof initJumpGame === 'function') {
        initJumpGame();
    } else {
        console.error('jump.js가 제대로 로드되지 않았습니다.');
    }
}