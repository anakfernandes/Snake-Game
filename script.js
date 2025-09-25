// ====================================================================================
// CONFIGURAÇÃO INICIAL E VARIÁVEIS GLOBAIS
// ====================================================================================

// Obtém o elemento Canvas e o contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Obtém os elementos do HUD (Placares)
const scoreDisplay = document.getElementById('score');
const applesEatenDisplay = document.getElementById('apples-eaten'); 
const highScoreDisplay = document.getElementById('high-score'); 

// NOVO: Seletores de Tela
const mainMenu = document.getElementById('mainMenu');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText'); 
let gameRunning = false; // Flag para controlar se o jogo está ativo

const gridSize = 20; 
let snake = [{ x: 10, y: 10 }];
let foods = []; 
const maxFoods = 3; 
let direction = 'right'; 
let changingDirection = false; 
let score = 0; 
let applesEaten = 0; 
let highScore = 0; 

// VELOCIDADE E PROGRESSÃO
const BASE_SPEED = 300; 
const SPEED_DECREMENT = 20; 
let currentSpeed = BASE_SPEED; 
let gameInterval; 

// OBSTÁCULOS: Divididos em Níveis
const OBSTACLE_LEVELS = [
    [
        { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 },
    ],
    [
        { x: 15, y: 15 }, { x: 16, y: 15 }, { x: 17, y: 15 },
    ],
    [
        { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 11, y: 3 },
    ],
];
let activeObstacles = []; 
const PROGRESSION_STEP = 5; 
let currentProgressionStep = 0; 

const appleImage = new Image();
appleImage.src = 'apple.png'; 

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

// Salva o recorde
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = `Recorde: ${highScore}`;
    }
}

// Gera comidas
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
// FUNÇÃO DE DESENHO
// ====================================================================================

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha Obstáculos Ativos
    ctx.fillStyle = "#34495e"; 
    activeObstacles.forEach(obstacle => {
        let x = obstacle.x * gridSize;
        let y = obstacle.y * gridSize;
        ctx.fillRect(x, y, gridSize, gridSize);
        ctx.strokeStyle = "#2c3e50";
        ctx.strokeRect(x, y, gridSize, gridSize);
    });
    
    // Desenha a Cobrinha
    snake.forEach((segment, index) => {
        let x = segment.x * gridSize + gridSize / 2;
        let y = segment.y * gridSize + gridSize / 2;

        if (index === 0) {
            // Cabeça (código mantido)
            let gradient = ctx.createRadialGradient(x, y, 4, x, y, gridSize / 1.2);
            gradient.addColorStop(0, "#2ecc71");
            gradient.addColorStop(1, "#27ae60");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, gridSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Olhos Brancos
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2); 
            ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2); 
            ctx.fill();

            // Pupilas Pretas (CORRIGIDO: ambos usam y - 4)
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, 1.5, 0, Math.PI * 2); // Olho esquerdo
            ctx.arc(x + 4, y - 4, 1.5, 0, Math.PI * 2); // Olho direito
            ctx.fill();
        } else {
            // Corpo (código mantido)
            let gradient = ctx.createRadialGradient(x, y, 3, x, y, gridSize / 1.2);
            gradient.addColorStop(0, "#27ae60");
            gradient.addColorStop(1, "#145a32");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, gridSize / 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Desenha as Comidas
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    foods.forEach(f => {
        ctx.drawImage(appleImage, f.x * gridSize, f.y * gridSize, gridSize, gridSize);
    });
    ctx.shadowBlur = 0;
}

// ====================================================================================
// LOOP PRINCIPAL DO JOGO (UPDATE)
// ====================================================================================

function update() {
    // Sai da função se o jogo não estiver rodando (pausa ou menu)
    if (!gameRunning) return; 

    if (isGameOver()) {
        clearInterval(gameInterval);
        gameRunning = false; // Marca o jogo como inativo

        saveHighScore(); // Salva o recorde
        
        // Mostra a tela de Game Over
        gameOverScreen.classList.remove('hidden');
        finalScoreText.textContent = `Sua Pontuação Final: ${score} - Maçãs Comidas: ${applesEaten}`;
        
        return;
    }

    changingDirection = false;
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'right': head.x += 1; break;
        case 'left': head.x -= 1; break;
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
    }

    // EFEITO TÚNEL (Loop Around): Se bater na parede, reaparece no lado oposto
    const maxGridX = canvas.width / gridSize;
    const maxGridY = canvas.height / gridSize;

    if (head.x < 0) head.x = maxGridX - 1;
    else if (head.x >= maxGridX) head.x = 0;
    if (head.y < 0) head.y = maxGridY - 1;
    else if (head.y >= maxGridY) head.y = 0;

    snake.unshift(head);

    // Colisão com Comidas
    let foodEatenIndex = foods.findIndex(f => head.x === f.x && head.y === f.y);

    if (foodEatenIndex !== -1) {
        score += 10;
        applesEaten += 1; 
        
        scoreDisplay.textContent = `Pontuação: ${score}`;
        applesEatenDisplay.textContent = `🍎 Comidas: ${applesEaten}`; 
        
        foods.splice(foodEatenIndex, 1);
        generateFood(); 
        
        // LÓGICA DE PROGRESSÃO DE DIFICULDADE (Obstáculos + Velocidade)
        const nextProgressionTarget = PROGRESSION_STEP * (currentProgressionStep + 1);

        if (applesEaten >= nextProgressionTarget) 
        {
            // 1. Aumenta a velocidade
            if (currentSpeed > SPEED_DECREMENT) {
                currentSpeed -= SPEED_DECREMENT;
                clearInterval(gameInterval);
                gameInterval = setInterval(update, currentSpeed); // Reinicia o loop
            }
            
            // 2. Ativa o próximo nível de obstáculos
            if (currentProgressionStep < OBSTACLE_LEVELS.length) {
                const nextObstacles = OBSTACLE_LEVELS[currentProgressionStep];
                activeObstacles = activeObstacles.concat(nextObstacles); 
            }
            
            currentProgressionStep++; 
        }
        
    } else {
        snake.pop(); 
    }

    draw();
}

// ====================================================================================
// FUNÇÕES DE COLISÃO E CONTROLES
// ====================================================================================

function isGameOver() {
    const head = snake[0];
    
    // 1. Colisão com o próprio corpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    // 2. Colisão com OBSTÁCULOS ATIVOS
    for (let i = 0; i < activeObstacles.length; i++) {
        if (head.x === activeObstacles[i].x && head.y === activeObstacles[i].y) {
            return true; 
        }
    }

    return false;
}

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const key = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingRight = direction === 'right';
    const goingLeft = direction === 'left';

    // Impede o giro de 180 graus
    if (key === 'ArrowUp' && !goingDown) direction = 'up';
    else if (key === 'ArrowDown' && !goingUp) direction = 'down';
    else if (key === 'ArrowLeft' && !goingRight) direction = 'left';
    else if (key === 'ArrowRight' && !goingLeft) direction = 'right';
}

// ====================================================================================
// FUNÇÕES DE PAUSA E INÍCIO DE JOGO
// ====================================================================================

let isPaused = false;

function pauseGame() {
    if (gameRunning && !isPaused) { // Garante que só pausa se o jogo estiver rodando
        clearInterval(gameInterval); 
        isPaused = true;
    }
}

function resumeGame() {
    if (isPaused) {
        gameInterval = setInterval(update, currentSpeed); 
        isPaused = false;
    }
}

function startGame() {
    // 1. Oculta a tela de menu/game over
    mainMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // 2. Reseta o estado do jogo
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    applesEaten = 0;
    currentSpeed = BASE_SPEED;
    activeObstacles = [];
    currentProgressionStep = 0;
    isPaused = false;
    gameRunning = true;

    // 3. Atualiza o HUD
    scoreDisplay.textContent = `Pontuação: 0`;
    applesEatenDisplay.textContent = `🍎 Comidas: 0`;
    loadHighScore(); // Garante que o recorde esteja visível

    generateFood(); 
    draw(); // Desenha o primeiro frame
    gameInterval = setInterval(update, currentSpeed); // Inicia o loop
}

// ====================================================================================
// INICIALIZAÇÃO
// ====================================================================================

// O jogo não inicia no carregamento da página, apenas prepara o ambiente:
loadHighScore(); 
generateFood(); 
draw(); // Desenha a cobra e as comidas iniciais no fundo do menu

// Event listeners para os botões de controle
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.addEventListener('keydown', changeDirection);