# 🐍 Snake Game (Turbo Edition)

Um projeto clássico do **Jogo da Cobrinha (Snake)** recriado com funcionalidades modernas e progressão de dificuldade dinâmica.  
Desenvolvido puramente com tecnologias web: **HTML, CSS e JavaScript**.

---

## ✨ Funcionalidades Principais

Esta versão vai muito além do jogo clássico, oferecendo um desafio progressivo e uma experiência de usuário aprimorada:

- **Dificuldade Progressiva**: A cada 5 maçãs comidas, o jogo aumenta a dificuldade em duas frentes:
  - **Obstáculos Crescentes**: Novos blocos fixos aparecem no mapa.
  - **Aceleração**: A cobra se move progressivamente mais rápido.
- **Efeito Túnel (Loop Around)**: Colidir com as bordas da tela faz a cobra reaparecer no lado oposto (não há morte por colisão de parede).
- **Recorde (High Score)**: O seu melhor resultado é salvo localmente no navegador (`localStorage`).
- **Múltiplas Comidas**: Até 3 maçãs podem aparecer na tela simultaneamente.
- **Telas de Estado**: Possui telas dedicadas de **Menu Principal** e **Game Over** interativas.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia         | Finalidade                                                  |
|--------------------|-------------------------------------------------------------|
| **HTML5 (Canvas)** | Estrutura e área de desenho do jogo.                       |
| **CSS3**           | Estilização, layout e gerenciamento das telas (`.overlay`). |
| **JavaScript (ES6)** | Lógica de jogo, persistência de dados (`localStorage`) e gerenciamento de estados. |

---

## 🕹️ Como Jogar

O controle é feito inteiramente pelo teclado.  
O jogo é iniciado pela **Tela de Menu Principal** ao clicar em **"INICIAR JOGO"**.

| Ação      | Tecla / Botão         |
|-----------|------------------------|
| **Mover** | Setas direcionais (↑ ↓ ← →) |
| **Pausar** | Botão ⏸️ **Pausar** |
| **Retomar** | Botão ▶️ **Retomar** |

---

## 📐 Estrutura do Código

Os arquivos contêm comentários detalhados para facilitar a leitura e futuras modificações:

| Arquivo       | Descrição                                                                 |
|---------------|---------------------------------------------------------------------------|
| **index.html** | Define a estrutura do **Canvas**, do **HUD** (High Score, Pontuação, Maçãs) e das telas de Menu/Game Over. |
| **style.css**  | Define a aparência de todos os elementos e a forma como as telas são apresentadas. |
| **script.js**  | Contém toda a lógica de jogo, funções de colisão, progressão de dificuldade (velocidade e obstáculos) e gerenciamento das telas. |

---

## 💡 Próximas Ideias

Se você quiser continuar a desenvolver o projeto, considere adicionar:

- 🎵 **Sons**: Efeitos sonoros para comer, morte e progressão de nível.  
- ⚡ **Power-ups**: Itens temporários que dão vantagens (ex: escudo, lentidão).  
- 🗺️ **Seleção de Mapas**: Diferentes layouts de obstáculos no menu.  

---

Feito com 🐍 por **[Ana Fernandes/anakfernandes]**
