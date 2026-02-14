const routes = require('express').Router();

routes.get('/animation', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Duelo Yu-Gi-Oh!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a5a);
            color: white;
            font-family: 'Arial', sans-serif;
            min-height: 100vh;
            overflow: hidden;
            position: relative;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
            animation: pulsate 2s infinite;
        }
        
        .duel-field {
            display: flex;
            justify-content: space-between;
            height: 70vh;
            position: relative;
            margin-top: 30px;
        }
        
        .player {
            width: 200px;
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .player-yugi {
            align-self: flex-start;
        }
        
        .player-kaiba {
            align-self: flex-end;
        }
        
        .player-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 3px solid gold;
            box-shadow: 0 0 15px yellow;
            background-size: cover;
            margin: 0 auto;
        }
        
        .yugi-avatar {
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="20" fill="%23ffcc00"/><rect x="40" y="60" width="20" height="30" fill="%23ffcc00"/><circle cx="40" cy="35" r="5" fill="%23000"/><circle cx="60" cy="35" r="5" fill="%23000"/></svg>') center/cover;
        }
        
        .kaiba-avatar {
            
            background: url('https://static.wikia.nocookie.net/animeverso/images/5/59/SetoKaibaFinal.png/revision/latest/scale-to-width-down/1000?cb=20240113030422&path-prefix=pt-br');
        }
        
        .monster-card {
            width: 120px;
            height: 180px;
            position: absolute;
            background: linear-gradient(135deg, #ffcc00, #ff9900);
            border: 2px solid gold;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 20px rgba(255, 204, 0, 0.7);
            transition: transform 0.3s;
            overflow: hidden;
        }
        
        .monster-card::before {
            content: "";
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
        }
        
        .dark-magician {
            background: linear-gradient(135deg, #800080, #4b0082);
            left: 25%;
            top: 30%;
            animation: float 4s ease-in-out infinite;
        }
        
        .blue-eyes {
            background: linear-gradient(135deg, #00ccff, #0066ff);
            right: 25%;
            top: 30%;
            animation: float 4s ease-in-out infinite 0.5s;
        }
        
        .monster-name {
            font-weight: bold;
            font-size: 0.9rem;
            text-align: center;
            margin-top: 10px;
            text-shadow: 1px 1px 2px #000;
        }
        
        .monster-atk {
            font-size: 0.8rem;
            margin-top: 5px;
        }
        
        .attack-animation {
            position: absolute;
            width: 100px;
            height: 100px;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,0 65,35 100,35 70,60 85,100 50,75 15,100 30,60 0,35 35,35" fill="%23ffffff"/></svg>') center/cover;
            opacity: 0;
            z-index: 10;
        }
        
        .life-points {
            font-size: 1.5rem;
            margin-top: 10px;
            font-weight: bold;
            text-shadow: 0 0 10px #ff0000;
        }
        
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        .particle {
            position: absolute;
            background-color: white;
            border-radius: 50%;
            opacity: 0.7;
        }
        
        @keyframes pulsate {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        
        @keyframes attack {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(2) rotate(360deg); }
        }
        
        @keyframes damage {
            0% { transform: translateX(0); }
            25% { transform: translateX(-20px); }
            50% { transform: translateX(20px); }
            75% { transform: translateX(-20px); }
            100% { transform: translateX(0); }
        }
        
        .message {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            font-size: 1.5rem;
            text-align: center;
            text-shadow: 0 0 10px #00ff00;
            animation: pulsate 1.5s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YU-GI-OH! DUELO DE ANIMAÇÃO</h1>
        
        <div class="duel-field">
            <div class="player player-yugi">
                <div class="player-img yugi-avatar"></div>
                <div class="player-name">Yugi Muto</div>
                <div class="life-points" id="yugi-life">4000</div>
            </div>
            
            <div class="player player-kaiba">
                <div class="player-img kaiba-avatar"></div>
                <div class="player-name">Seto Kaiba</div>
                <div class="life-points" id="kaiba-life">4000</div>
            </div>
            
            <div class="monster-card dark-magician">
                <div class="monster-name">Mago Negro</div>
                <div class="monster-atk">ATK: 2500</div>
            </div>
            
            <div class="monster-card blue-eyes">
                <div class="monster-name">Dragão Branco de Olhos Azuis</div>
                <div class="monster-atk">ATK: 3000</div>
            </div>
        </div>
        
        <div class="message" id="battle-message">Seu turno, Yugi!</div>
    </div>
    
    <div class="particles" id="particles"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Criar partículas
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                const size = Math.random() * 5 + 2;
                particle.style.width = \`\${size}px\`;
                particle.style.height = \`\${size}px\`;
                
                particle.style.left = \`\${Math.random() * 100}%\`;
                particle.style.top = \`\${Math.random() * 100}%\`;
                
                particle.style.animation = \`float \${Math.random() * 6 + 4}s ease-in-out infinite\`;
                particle.style.animationDelay = \`\${Math.random() * 5}s\`;
                
                particlesContainer.appendChild(particle);
            }
            
            // Animação de ataque
            const darkMagician = document.querySelector('.dark-magician');
            const blueEyes = document.querySelector('.blue-eyes');
            const yugiLife = document.getElementById('yugi-life');
            const kaibaLife = document.getElementById('kaiba-life');
            const battleMessage = document.getElementById('battle-message');
            
            let yugiLifeValue = 4000;
            let kaibaLifeValue = 4000;
            
            function createAttackAnimation(startX, startY, endX, endY) {
                const attack = document.createElement('div');
                attack.classList.add('attack-animation');
                attack.style.left = \`\${startX}px\`;
                attack.style.top = \`\${startY}px\`;
                document.body.appendChild(attack);
                
                attack.style.animation = 'attack 1s forwards';
                
                setTimeout(() => {
                    document.body.removeChild(attack);
                }, 1000);
            }
            
            function updateLifePoints() {
                yugiLife.textContent = yugiLifeValue;
                kaibaLife.textContent = kaibaLifeValue;
                
                if (yugiLifeValue <= 0 || kaibaLifeValue <= 0) {
                    battleMessage.textContent = yugiLifeValue <= 0 ? "Kaiba venceu!" : "Yugi venceu!";
                    clearInterval(duelInterval);
                }
            }
            
            function performAttack() {
                // Mago Negro ataca
                const darkMagicianRect = darkMagician.getBoundingClientRect();
                const blueEyesRect = blueEyes.getBoundingClientRect();
                
                createAttackAnimation(
                    darkMagicianRect.left + darkMagicianRect.width/2,
                    darkMagicianRect.top + darkMagicianRect.height/2,
                    blueEyesRect.left + blueEyesRect.width/2,
                    blueEyesRect.top + blueEyesRect.height/2
                );
                
                battleMessage.textContent = "Mago Negro ataca!";
                
                setTimeout(() => {
                    kaibaLifeValue -= 500;
                    updateLifePoints();
                    
                    // Dragão Branco contra-ataca
                    setTimeout(() => {
                        createAttackAnimation(
                            blueEyesRect.left + blueEyesRect.width/2,
                            blueEyesRect.top + blueEyesRect.height/2,
                            darkMagicianRect.left + darkMagicianRect.width/2,
                            darkMagicianRect.top + darkMagicianRect.height/2
                        );
                        
                        battleMessage.textContent = "Dragão Branco contra-ataca!";
                        
                        setTimeout(() => {
                            yugiLifeValue -= 500;
                            updateLifePoints();
                            battleMessage.textContent = "Seu turno, Yugi!";
                        }, 1000);
                    }, 1500);
                }, 1000);
            }
            
            // Iniciar duelo automático
            const duelInterval = setInterval(performAttack, 5000);
            
            // Primeiro ataque após um breve delay
            setTimeout(performAttack, 2000);
        });
    </script>
</body>
</html>
  `);
});

module.exports = routes;