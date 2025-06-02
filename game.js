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
const difficultySelect = document.getElementById('difficulty');
const playerNameInput = document.getElementById('player-name');

const storyScene = document.getElementById('story-scene');
const storyImage = document.getElementById('story-image');
const speechBox = document.getElementById('speech-box');
const nextDialogueBtn = document.getElementById('next-dialogue-btn');

const miniCanvas = document.getElementById('mini-game-canvas');
const gameCanvas = document.getElementById('game-canvas');

// document.getElementById('test-mini-btn').addEventListener('click', startMiniGame);

function playClickSound() {
    btnSound.currentTime = 0;
    btnSound.play();
}

document.addEventListener('DOMContentLoaded', () => {
    showScene('title-screen');
    hideScene('main-game');
    miniCanvas.style.display = 'none';
});

function showScene(id) {
    ['title-screen', 'setting-scene', 'create-scene', 'story-scene', 'score-scene', 'main-game'].forEach(sceneId => {
        document.getElementById(sceneId).style.display = (sceneId === id) ? 'flex' : 'none';
    });
    if (id === 'main-game') {
        document.getElementById('main-game').style.display = 'block';
        document.getElementById('instant-win-btn').style.display = 'block'; // 즉시 승리 버튼도 보이기
    }
}

function hideScene(id) {
    document.getElementById(id).style.display = 'none';
}

startBtn.addEventListener('click', () => {
    playClickSound();
    showScene('create-scene');
});

settingBtn.addEventListener('click', () => {
    playClickSound();
    showScene('setting-scene');
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
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert('이름을 입력하세요!');
        return;
    }
    startStory();
});

const story = [
    { image: 'story/coding.webp', lines: ["오늘도 한가로이 코딩을 하는중이다.", "어라라 이게 뭐지...?", "한 번 눌러봐야겠군."] },
    { image: 'story/other.jpeg', lines: ["어어....?", "으아악 빨려들어간다~~", "어... 여기가 어디지?"] },
    { image: 'story/mineworld.webp', lines: ["어라라 여기는 마인크래프트 세상?", "어떻게 빠져나가지?", "엇 저기 주민이다 함 물어보자!"] },
    { image: 'story/villager.png', lines: ["나: 어이 주민 나 왜 여깄는거야", "주민: 뭐야 이 네모난 건", "나: ?? 주민이 말대꾸? 아 모르겠고 여기서 어떻게 빠져나가?", "주민: 일단 좀비좀 잡아와봐라 ㅋ", "나: 뭔가 심부름 같은데 일단 ㅇㅋ."] },
    { image: 'story/villager.png', lines: ["나: 자 잡아왔어어", "주민: 왜 개꿀 ㅋ 할 일 줄었당", "나: ?? 와 당했넹.. 이젠 진짜 알려줘야된다?", "주민: 아아아 미안미안 이젠 진짜야", "주민: 이번에는 지옥가서 가스트 잡아오면 될거야", "나: 이번에도 속이면 디져? 일단 알겠어."] },
    { image: 'story/nether.webp', lines: ["여기가 지옥인가?", "가스트나 찾아봐야지", "어 저기에 뭔가 비슷해보이는데 댐벼라~"] },
    { image: 'story/villager.png', lines: ["나: 자 잡아왔어", "주민: 오? 좀 친다? 이젠 진짜 알려드림 ㅎㅎ", "나: 하 드디어..", "주민: 저기 저 엔더월드에 엔더드래곤 잡으면 돼", "나: 구랭? 드래곤아 내가 간다~"] },
    { image: 'story/endworld.webp', lines: ["하 엔더월드.. 공기부터 다른데?", "어 저기 뭔가 큰게 있는데?", "드래곤 딱 대 ^^"] },
    { image: 'story/other.jpeg', lines: ["뭐야 별거 없는데?", "어라라 내 몸이...?"] },
    { image: 'story/konkuk.jpeg', lines: ["어우 다시 돌아왔네", "아 학교가야되네..", "교수님: 다음주 퀴즈있어요 ㅎㅎ", "나: 아...여긴 교수님이 보스인가?? ㅠㅠㅠ", "다시 돌아갈래~~~"] }
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
    startMiniGameTimer();
    
    // 메인 게임 초기화
    mainGame.init();
    
    // 기존 게임 코드 실행
    $('#gameCanvas').show();
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
}

document.getElementById('instant-win-btn').addEventListener('click', () => {
    playClickSound();
    document.getElementById('instant-win-btn').style.display = 'none';
    if (gameDifficulty < 3) {
        startStory(gameDifficulty + 1);
    } else {
        startStory(4); // 3라운드 끝나면 종료 스토리(4라운드) 시작
    }
});

startStory(1);

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

function startMiniGame() {
    miniCanvas.style.display = 'block';
    miniGameActive = false;
    miniGameImage = new Image();
    miniGameImage.src = 'story/villager.png';
    miniGameImage.onload = () => {
        miniGameY = 0;
        miniGameActive = true;
        requestAnimationFrame(updateMiniGame);
    };
}

function updateMiniGame() {
    if (!miniGameActive) return;
    const ctx = miniCanvas.getContext('2d');
    const background = new Image();
    background.src = 'story/drop.webp';
    ctx.drawImage(background, 0, 0, miniCanvas.width, miniCanvas.height);
    miniGameY += miniGameSpeed;
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
        endMiniGame('Miss!');
    }
}

document.addEventListener('keydown', (e) => {
    if (miniGameActive && e.code === 'Space') {
        if (miniGameY >= miniCanvas.height - 60 && miniGameY <= miniCanvas.height - 10) {
            endMiniGame('성공!');
        } else {
            endMiniGame('Miss!');
        }
    }
});

function endMiniGame(message) {
    miniGameActive = false;
    miniCanvas.style.display = 'none';
    alert(`미니게임 결과: ${message}`);
}