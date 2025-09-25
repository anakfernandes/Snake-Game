// ====================================================================================
// CONFIGURAÇÃO INICIAL E VARIÁVEIS GLOBAIS
// ====================================================================================

// Canvas e contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos do HUD (placares)
const scoreDisplay = document.getElementById('score'); // Mostra pontuação
const applesEatenDisplay = document.getElementById('apples-eaten'); // Mostra maçãs comidas
const highScoreDisplay = document.getElementById('high-score'); // Mostra recorde

// Elementos de menu e tela de game over
const mainMenu = document.getElementById('mainMenu');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText'); // Pontuação final

// Flag para saber se o jogo está rodando
let gameRunning = false;

// Configurações da grade e cobrinha
const gridSize = 20; // Tamanho de cada "bloco"
let snake = [{ x: 10, y: 10 }]; // Posição inicial da cobrinha
let foods = []; // Lista de comidas (maçãs)
const maxFoods = 3; // Número máximo de maçãs na tela
let direction = 'right'; // Direção inicial
let changingDirection = false; // Impede mudanças de direção rápidas demais
let score = 0; // Pontuação
let applesEaten = 0; // Número de maçãs comidas
let highScore = 0; // Recorde

// Velocidade do jogo
const BASE_SPEED = 300; // Intervalo inicial em ms
const SPEED_DECREMENT = 20; // Quanto diminui a cada fase
let currentSpeed = BASE_SPEED; 
let gameInterval; // Armazena o setInterval do loop do jogo

// Obstáculos divididos por níveis de progressão
const OBSTACLE_LEVELS = [
    [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }],   // Nível 1
    [{ x: 15, y: 15 }, { x: 16, y: 15 }, { x: 17, y: 15 }], // Nível 2
    [{ x: 10, y: 2 }, { x: 10, y: 3 }, { x: 11, y: 3 }] // Nível 3
];
let activeObstacles = []; // Obstáculos atualmente ativos
const PROGRESSION_STEP = 5; // A cada 5 maçãs, aumenta dificuldade
let currentProgressionStep = 0; // Controle da progressão

// Imagem da maçã
const appleImage = new Image();
appleImage.src = 'apple.png'; 

// ====================================================================================
// SONS DO JOGO (Web Audio API)
// ====================================================================================

// Cria o contexto de áudio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Função para tocar som dependendo do tipo de evento
function playSound(type) {
    const oscillator = audioCtx.createOscillator(); // Gera o som
    const gainNode = audioCtx.createGain(); // Controle do volume

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
        case "eat": // Comer maçã
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            break;
        case "gameover": // Game Over
            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
            break;
        case "start": // Início do jogo
            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            break;
    }

    oscillator.start(); // Começa o som
    oscillator.stop(audioCtx.currentTime + 0.25); // Duração curta
}

// ====================================================================================
// FUNÇÕES DE PERSISTÊNCIA E INICIALIZAÇÃO
// ====================================================================================

// Carrega o recorde salvo no navegador
function loadHighScore() {
    const savedScore = localStorage.getItem('snakeHighScore');
    if (savedScore) {
        highScore = parseInt(savedScore, 10);
        highScoreDisplay.textContent = `Recorde: ${highScore}`;
    } else {
        highScoreDisplay.textContent = `Recorde: 0`;
    }
}

// Salva o recorde se for maior que o atual
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = `Recorde: ${highScore}`;
    }
}

// Gera as maçãs aleatórias no campo
function generateFood() {
  while (foods.length < maxFoods) {
    let newFood = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    foods.push(newFood);
  }
}

// ====================================================================================
// FUNÇÃO DE DESENHO NO CANVAS
// ====================================================================================

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa a tela

    // Desenha obstáculos
    ctx.fillStyle = "#34495e"; 
    activeObstacles.forEach(obstacle => {
        let x = obstacle.x * gridSize;
        let y = obstacle.y * gridSize;
        ctx.fillRect(x, y, gridSize, gridSize);
        ctx.strokeStyle = "#2c3e50";
        ctx.strokeRect(x, y, gridSize, gridSize);
    });
    
    // Desenha a cobrinha
    snake.forEach((segment, index) => {
        let x = segment.x * gridSize + gridSize / 2;
        let y = segment.y * gridSize + gridSize / 2;

        if (index === 0) {
            // Cabeça
            let gradient = ctx.createRadialGradient(x, y, 4, x, y, gridSize / 1.2);
            gradient.addColorStop(0, "#2ecc71");
            gradient.addColorStop(1, "#27ae60");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, gridSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Olhos
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2); 
            ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2); 
            ctx.fill();

            // Pupilas
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 1.5, 0, Math.PI * 2);
            ctx.arc(x + 4, y - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Corpo
            let gradient = ctx.createRadialGradient(x, y, 3, x, y, gridSize / 1.2);
            gradient.addColorStop(0, "#27ae60");
            gradient.addColorStop(1, "#145a32");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, gridSize / 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Desenha maçãs
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    foods.forEach(f => {
        ctx.drawImage(appleImage, f.x * gridSize, f.y * gridSize, gridSize, gridSize);
    });
    ctx.shadowBlur = 0;
}

// ====================================================================================
// LOOP PRINCIPAL DO JOGO
// ====================================================================================

function update() {
    if (!gameRunning) return; // Não atualiza se o jogo estiver pausado

    if (isGameOver()) { // Se bater, finaliza
        clearInterval(gameInterval);
        gameRunning = false;
        saveHighScore();
        gameOverScreen.classList.remove('hidden');
        finalScoreText.textContent = `Sua Pontuação Final: ${score} - Maçãs Comidas: ${applesEaten}`;
        playSound('gameover');
        return;
    }

    changingDirection = false;

    // Atualiza posição da cabeça
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'right': head.x += 1; break;
        case 'left': head.x -= 1; break;
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
    }

    // Efeito túnel: se bater na parede, reaparece
    const maxGridX = canvas.width / gridSize;
    const maxGridY = canvas.height / gridSize;
    if (head.x < 0) head.x = maxGridX - 1;
    else if (head.x >= maxGridX) head.x = 0;
    if (head.y < 0) head.y = maxGridY - 1;
    else if (head.y >= maxGridY) head.y = 0;

    snake.unshift(head); // Adiciona a cabeça ao início

    // Colisão com comida
    let foodEatenIndex = foods.findIndex(f => head.x === f.x && head.y === f.y);
    if (foodEatenIndex !== -1) {
        score += 10;
        applesEaten += 1;
        scoreDisplay.textContent = `Pontuação: ${score}`;
        applesEatenDisplay.textContent = `🍎 Comidas: ${applesEaten}`;
        foods.splice(foodEatenIndex, 1); // Remove comida
        generateFood(); // Gera nova comida
        playSound('eat'); // Som de comer

        // Progressão de dificuldade
        const nextProgressionTarget = PROGRESSION_STEP * (currentProgressionStep + 1);
        if (applesEaten >= nextProgressionTarget) {
            if (currentSpeed > SPEED_DECREMENT) {
                currentSpeed -= SPEED_DECREMENT;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, currentSpeed);
            }
            if (currentProgressionStep < OBSTACLE_LEVELS.length) {
                activeObstacles = activeObstacles.concat(OBSTACLE_LEVELS[currentProgressionStep]);
            }
            currentProgressionStep++;
        }
    } else {
        snake.pop(); // Remove última parte do corpo
    }

    draw(); // Atualiza canvas
}

// ====================================================================================
// FUNÇÕES DE COLISÃO E CONTROLE DE DIREÇÃO
// ====================================================================================

function isGameOver() {
    const head = snake[0];
    // Colisão com o próprio corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    // Colisão com obstáculos
    for (let obs of activeObstacles) {
        if (head.x === obs.x && head.y === obs.y) return true;
    }
    return false;
}

// Muda a direção da cobrinha com setas
function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const key = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingRight = direction === 'right';
    const goingLeft = direction === 'left';

    if (key === 'ArrowUp' && !goingDown) direction = 'up';
    else if (key === 'ArrowDown' && !goingUp) direction = 'down';
    else if (key === 'ArrowLeft' && !goingRight) direction = 'left';
    else if (key === 'ArrowRight' && !goingLeft) direction = 'right';
}

// ====================================================================================
// FUNÇÕES DE PAUSA E INÍCIO DE JOGO
// ====================================================================================

let isPaused = false;

// Pausa o jogo
function pauseGame() {
    if (gameRunning && !isPaused) {
        clearInterval(gameInterval); 
        isPaused = true;
    }
}

// Retoma o jogo
function resumeGame() {
    if (isPaused) {
        gameInterval = setInterval(update, currentSpeed); 
        isPaused = false;
    }
}

// Inicia o jogo do zero
function startGame() {
    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    applesEaten = 0;
    currentSpeed = BASE_SPEED;
    activeObstacles = [];
    currentProgressionStep = 0;
    isPaused = false;
    gameRunning = true;

    scoreDisplay.textContent = `Pontuação: 0`;
    applesEatenDisplay.textContent = `🍎 Comidas: 0`;
    loadHighScore();

    generateFood(); 
    draw();
    gameInterval = setInterval(update, currentSpeed); 

    playSound('start'); // Som ao iniciar
}

// ====================================================================================
// INICIALIZAÇÃO DE EVENTOS
// ====================================================================================

loadHighScore(); // Carrega recorde
generateFood(); // Gera comida inicial
draw(); // Desenha cobrinha e comida

// Botões de menu
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);

// Captura setas do teclado
document.addEventListener('keydown', changeDirection);
