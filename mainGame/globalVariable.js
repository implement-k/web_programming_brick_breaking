// 설정
const WIDTH = 900;
const HEIGHT = 650;

let canvas, ctx;

let gameDifficulty = 1; // 난이도  (1: 오버월드, 2: 네더월드, 3: 엔더월드)

// 키보드 컨트롤
let rightPressed = false;
let leftPressed = false;
let curHotbarIdx = 1;

let paddle, hotbar;

const SOUND_EFFECT = {
    death: new Audio('mainGame/etc_sound/death.mp3'),
    clear: new Audio('mainGame/etc_sound/levelup.mp3')
};

let user, userCheckpoint;