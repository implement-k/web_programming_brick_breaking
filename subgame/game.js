const startBtn = document.getElementById('start-btn');
const settingBtn = document.getElementById('setting-btn');
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

function playClickSound() {
    btnSound.currentTime = 0;
    btnSound.play();
}

function showScene(id) {
    ['title-screen', 'setting-scene', 'create-scene', 'story-scene'].forEach(scene => {
        document.getElementById(scene).style.display = 'none';
    });
    document.getElementById(id).style.display = 'flex';
}

startBtn.addEventListener('click', () => {
    playClickSound();
    showScene('create-scene');
});

settingBtn.addEventListener('click', () => {
    playClickSound();
    showScene('setting-scene');
});

backBtn.addEventListener('click', () => {
    playClickSound();
    showScene('title-screen');
});

cancelBtn.addEventListener('click', () => {
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

// 스토리 데이터
const story = [
    {
        image: 'act1.jpg',
        lines: [
            "어느 날, 평화롭던 세계에 이상한 징조가 나타나기 시작했다.",
            "하늘은 붉게 물들고, 바람은 방향을 잃었다.",
            "모험은 그렇게 시작되었다..."
        ]
    },
    {
        image: 'act2.jpg',
        lines: [
            "깊은 숲을 지나며 당신은 잊혀진 유적을 발견한다.",
            "거대한 문에는 이상한 문자가 새겨져 있다.",
            "그 문이 열리는 순간, 모든 것이 달라졌다."
        ]
    },
    {
        image: 'act3.jpg',
        lines: [
            "이제 선택의 시간이 다가온다.",
            "과연 당신은 이 세계를 구할 수 있을까?",
            "운명은 당신의 손에 달렸다."
        ]
    }
];

let currentSceneIndex = 0;
let currentLineIndex = 0;

function startStory() {
    currentSceneIndex = 0;
    currentLineIndex = 0;
    showScene('story-scene');
    updateStory();
}

function updateStory() {
    const scene = story[currentSceneIndex];
    storyImage.src = scene.image;
    speechBox.textContent = scene.lines[currentLineIndex];
}

nextDialogueBtn.addEventListener('click', () => {
    const scene = story[currentSceneIndex];
    if (currentLineIndex < scene.lines.length - 1) {
        currentLineIndex++;
        updateStory();
    } else if (currentSceneIndex < story.length - 1) {
        currentSceneIndex++;
        currentLineIndex = 0;
        updateStory();
    } else {
        alert('스토리 끝! 게임 시작으로 이동합니다.');
        // TODO: canvas 화면 전환
    }
});