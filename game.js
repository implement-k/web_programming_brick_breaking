const startBtn = document.getElementById('start-btn');
const settingBtn = document.getElementById('setting-btn');
const scoreBtn = document.getElementById('score-btn');
const scoreBackBtn = document.getElementById('score-back-btn');
const backBtn = document.getElementById('back-btn');
const createBtn = document.getElementById('create-btn');
const cancelBtn = document.getElementById('cancel-btn');

const btnSound = document.getElementById('btn-sound');
const bgm = document.getElementById('bgm');
const bgmToggle = document.getElementById('bgm-toggle');
const playerNameInput = document.getElementById('player-name');

const storyScene = document.getElementById('story-scene');
const storyImage = document.getElementById('story-image');
const speechBox = document.getElementById('speech-box');
const nextDialogueBtn = document.getElementById('next-dialogue-btn');

const miniCanvas = document.getElementById('miniCanvas');
const miniGameCanvas = document.getElementById('miniGameCanvas');
const gameCanvas = document.getElementById('gameCanvas');

let selectedBallSkin = "pick";      // 'pick' 또는 'sword'
let selectedWeaponId = "pick1";     // 실제 선택된 이미지 ID

$('.weapon-option').on('click', function() {
    BALL_STYLE = $(this).find('img').data().id;
    let tempImg = $(this).find('img');
    let weapondivs = $('.weapon-option');
    for(let i = 0; i < weapondivs.length; i++) {
        $(weapondivs[i]).find('img').removeClass('ball-selected');
    }
    $(tempImg).addClass('ball-selected');
    selectedWeaponId = BALL_STYLE;
});

function playClickSound() {
    btnSound.currentTime = 0;
    btnSound.play();
}

document.addEventListener('DOMContentLoaded', () => {
    showScene('title-screen');
    hideScene('main-game');
    if (miniGameCanvas) miniGameCanvas.style.display = 'none';
});

function showScene(id) {
    ['title-screen', 'setting-scene', 'create-scene', 'story-scene', 'score-scene', 'main-game'].forEach(sceneId => {
        if (document.getElementById(sceneId)) document.getElementById(sceneId).style.display = (sceneId === id) ? 'flex' : 'none';
    });
    if (id === 'main-game') {
        document.getElementById('main-game').style.display = 'block';
    }
}

function hideScene(id) {
    if (document.getElementById(id)) document.getElementById(id).style.display = 'none';
}

startBtn.addEventListener('click', () => {
    playClickSound();
    showScene('create-scene');
});

settingBtn.addEventListener('click', () => {
    playClickSound();
    showScene('setting-scene');
});

const bgmSelect = document.getElementById('music-btn');
bgmSelect.addEventListener('click', function () {
    playClickSound();
    let current_music = bgmSelect.innerText.split(': ')[1];
    if(current_music == 'piano 3') current_music = "moong city";
    else if(current_music == "moong city") current_music = "음악 끄기";
    else if(current_music = "음악 끄기") current_music = 'piano 3';
    bgmSelect.innerText = "배경음악: " + current_music;

    if (current_music == "음악 끄기") {
        bgm.pause();
        bgm.currentTime = 0;
    } else {
        if(current_music == 'piano 3') bgm.src = 'main/title_bgm.mp3';
        else if(current_music == 'moong city') bgm.src = 'main/title_bgm2.mp3';
        
        bgm.load();
        bgm.play();
    }
});

const diffSelect = document.getElementById('difficulty-btn');
diffSelect.addEventListener('click', function () {
    playClickSound();
    let current_diff = diffSelect.innerText.split(': ')[1];
    if(current_diff == 'Easy') current_diff = 'Normal';
    else if(current_diff == 'Normal') current_diff = 'Hard';
    else if(current_diff == 'Hard') current_diff = 'Easy';

    console.log(current_diff);
    diffSelect.innerText = "난이도: " + current_diff;
});

// 초기화 (페이지 로드시 select와 bgm 싱크)
window.addEventListener('DOMContentLoaded', () => {
    bgmSelect.value = "title_bgm.mp3";
});

scoreBtn.addEventListener('click', () => {
    playClickSound();
    showScene('score-scene');
});

backBtn.addEventListener('click', () => {
    playClickSound();
    showScene('title-screen');
});

cancelBtn.addEventListener('click', () => {
    playClickSound();
    showScene('title-screen');
});

scoreBackBtn.addEventListener('click', () => {
    playClickSound();
    showScene('title-screen');
});

createBtn.addEventListener('click', () => {
    playClickSound();
    userName = playerNameInput.value.trim();
    if (userName === '') {
        alert('이름을 입력하세요!');
        return;
    }
    let diff = diffSelect.innerText.split(': ')[1];
    if (diff == "Easy") startStory(1);
    else if (diff == "Normal") startStory(2);
    else if (diff == "Hard") startStory(3);
});

const story = [
    { image: 'story/coding.webp', lines: ["[나] 오늘도 한가로이 코딩을 하는중이다.", "[나] 어라라 이게 뭐지...?", "[나] 한 번 눌러봐야겠군."] },
    { image: 'story/other.jpeg', lines: ["[나] 어어....?", "[나] 으아악 빨려들어간다~~", "[나] 어... 여기가 어디지?"] },
    { image: 'story/mineworld.webp', lines: ["[나] 어라라 여기는 마인크래프트 세상?", "[나] 어떻게 빠져나가지?", "[나] 엇 저기 주민이다 한번 물어보자!"] },
    { image: 'story/villager.png', lines: ["[나] 어이 주민 나 왜 여깄는거야", "[주민] 뭐야 이 네모난 건", "[나] 여기서 어떻게 빠져나가?", "[주민] 일단 좀비좀 잡아와봐", "[나] 뭔가 심부름 같은데 일단 알겠어."] },
    { image: 'story/villager.png', lines: ["[나] 자 잡아왔어.", "[주민] 하하. 할 일 줄었다!!", "[나] ?? 와 당했네.. 이젠 진짜 알려줘야된다?", "[주민] 아아아 미안미안 이젠 진짜야", "[주민] 이번에는 지옥가서 가스트 잡아오면 될거야", "[나] 이번에도 속이면 안된다? 일단 알겠어."] },
    { image: 'story/nether.webp', lines: ["[나] 여기가 지옥인가?", "[나] 가스트나 찾아봐야지", "[나] 어 저기에 뭔가 비슷해보이는데.. 덤벼라!"] },
    { image: 'story/villager.png', lines: ["[나] 자 잡아왔어", "[주민] 오? 이것도 성공할줄이야. 이젠 진짜 알려줄게 ㅎㅎ!", "[나] 하 드디어..", "[주민] 저기 저 엔더월드에 엔더드래곤을 잡으면 돼", "[나] 그래? 드래곤아 기다려라, 내가 간다!"] },
    { image: 'story/endworld.webp', lines: ["[나] 하 엔더월드.. 공기부터 다른데?", "[나] 어 저기 뭔가 큰게 있는데?", "[나] 드래곤 게 섯거라!"] },
    { image: 'story/other.jpeg', lines: ["[나] 뭐야 별거 없는데?", "[나] 어라라 내 몸이...?"] },
    { image: 'story/konkuk.jpeg', lines: ["[나] 어우 다시 돌아왔네", "[나] 아 학교가야되네..", "[교수님] 다음주 퀴즈있어요 ㅎㅎ", "[나] 아...여긴 교수님이 보스인가?? ㅠㅠㅠ", "[나] 다시 돌아갈래~~~"] }
];

const storyRanges = { 1: { start: 0, end: 3 }, 2: { start: 4, end: 5 }, 3: { start: 6, end: 7 }, 4: { start: 8, end: 9 } };

let currentSceneIndex = 0;
let currentLineIndex = 0;

function startStory(round = 1) {
    gameDifficulty = round;
    const range = storyRanges[gameDifficulty];
    currentSceneIndex = range.start;
    currentLineIndex = 0;
    $('#gameCanvas').hide();
    showScene('story-scene');
    updateStory();
}

// 스토리 Skip 버튼 클릭 시 게임 바로 시작하는 이벤트 추가
document.getElementById('skip-story-btn').addEventListener('click', () => {
    startMainGame(gameDifficulty);
});

// 사용자 상태를 보존하면서 스토리 시작하는 함수
function startStoryWithUserState(round, userState) {
    // 전역 변수에 사용자 상태 저장
    window.preservedUserState = userState;
    startStory(round);
}

function updateStory() {
    const scene = story[currentSceneIndex];
    storyImage.src = scene.image;
    speechBox.textContent = scene.lines[currentLineIndex];
}

nextDialogueBtn.addEventListener('click', () => {
    const range = storyRanges[gameDifficulty];
    const scene = story[currentSceneIndex];

    if (currentLineIndex < scene.lines.length - 1) {
        currentLineIndex++;
        updateStory();
    } else if (currentSceneIndex < range.end) {
        currentSceneIndex++;
        currentLineIndex = 0;
        updateStory();
    } else {
        if (gameDifficulty < 3) {
            startMainGame(gameDifficulty);
        } else if (gameDifficulty === 3) {
            startMainGame(gameDifficulty); // 3라운드 메인게임 후 종료 스토리로 연결
        } else if (gameDifficulty === 4) {
            showScene('title-screen');
            hideScene('main-game');
        }
    }
});

function startMainGame(round) {
    gameDifficulty = round;
    hideScene('story-scene');
    
    // 캔버스를 먼저 보여줌으로써 canvas.width가 올바르게 설정되도록 함
    $('#gameCanvas').show();

    startMiniGameTimer();

    // 보존된 사용자 상태가 있으면 사용, 없으면 기본 초기화
    const preserveUser = window.preservedUserState ? true : false;
    if (window.preservedUserState) {
        // 보존된 사용자 상태를 현재 user로 설정
        user = window.preservedUserState.clone();
        window.preservedUserState = null; // 사용 후 정리
    }

    // 메인 게임 초기화 (사용자 상태 보존 여부 전달)
    mainGame.init(preserveUser);

    // 게임 시작
    mainGame.start();

    // 기존 마스터 버튼들 제거
    $('#masterBtns').empty();

    // 마스터 버튼들
    let btn1 = $('<button/>');
    btn1.text('블록 다 깨기');
    btn1.click(() => {
        mainGame.collectAllItems();
        mainGame.isClear = true;
    });
    $('#masterBtns').append(btn1);

    let btn2 = $('<button/>');
    btn2.text('죽기');
    btn2.click(() => {
        if (user && user.heart) user.heart.health = 0;
    });
    $('#masterBtns').append(btn2);

    let btn3 = $('<button/>');
    btn3.text('보스 죽이기');
    btn3.click(() => {
        if (bossGame && bossGame.bossManager && bossGame.bossManager.curBoss) {
            bossGame.bossManager.curBoss.health = 1;
            bossGame.bossManager.curBoss.isDying = true;
            bossGame.bossManager.curBoss.deathSound.play();
        }
    });
    $('#masterBtns').append(btn3);
}

function startMiniGameTimer() {
    const maxTime = 60000;
    const randomDelay = Math.random() * maxTime;

    setTimeout(() => {
        if (document.getElementById('main-game').style.display !== 'none') {
            startMiniGame();
        } else {
            startMiniGameTimer();
        }
    }, randomDelay);
}

let miniGameActive = false;
let miniGameY = 0;
let miniGameSpeed = 3;
let miniGameImage;
let lastMiniGameTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function startMiniGame() {
    if (miniCanvas) {
        miniCanvas.style.display = 'block';
        miniGameActive = false;
        miniGameImage = new Image();
        miniGameImage.src = 'story/villager.png';
        miniGameImage.onload = () => {
            miniGameY = 0;
            miniGameActive = true;
            lastMiniGameTime = performance.now();
            requestAnimationFrame(updateMiniGame);
        };
    }
}

function updateMiniGame(currentTime) {
    if (!miniGameActive || !miniCanvas) return;
    
    // 프레임 보정 계산 (60fps 기준)
    const deltaTime = currentTime - lastMiniGameTime;
    const deltaMultiplier = Math.min(deltaTime / FRAME_TIME, 3); // 최대 3배까지만 보정
    lastMiniGameTime = currentTime;
    
    const ctx = miniCanvas.getContext('2d');
    const background = new Image();
    background.src = 'story/drop.webp';
    ctx.drawImage(background, 0, 0, miniCanvas.width, miniCanvas.height);
    
    // 프레임 보정 적용
    miniGameY += miniGameSpeed * deltaMultiplier;
    
    ctx.drawImage(miniGameImage, miniCanvas.width / 2 - 25, miniGameY, 50, 50);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, miniCanvas.height - 10);
    ctx.lineTo(miniCanvas.width, miniCanvas.height - 10);
    ctx.stroke();
    if (miniGameY < miniCanvas.height) {
        requestAnimationFrame(updateMiniGame);
    } else {
        endMiniGame('실패!');
    }
}

document.addEventListener('keydown', (e) => {
    if (miniGameActive && e.code === 'Space') {
        if (miniGameY >= miniCanvas.height - 60 && miniGameY <= miniCanvas.height - 10) {
            endMiniGame('성공!');
        } else {
            endMiniGame('실패!');
        }
    }
});

function endMiniGame(message) {
    miniGameActive = false;
    if (miniCanvas) miniCanvas.style.display = 'none';
    alert(`미니게임 결과: ${message}`);
    if (message === '실패!') {
        if (user && user.heart) {
            user.hit(gameDifficulty, 2);
        }
    }
}