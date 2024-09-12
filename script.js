// <!-- Custom Solflare Wallet Adapter -->

    class SolflareWalletAdapter {
        constructor() {
            this.connected = false;
            this.publicKey = null;
        }

        async connect() {
            try {
                const provider = window.solflare;
                if (provider) {
                    await provider.connect();
                    this.publicKey = provider.publicKey.toString();
                    this.connected = true;
                } else {
                    await alert_("Solflare wallet is not installed.");
                }
            } catch (err) {
                console.error(err);
                this.connected = false;
            }
        }

        disconnect() {
            if (this.connected) {
                window.solflare.disconnect();
                this.connected = false;
                this.publicKey = null;
            }
        }
    }

    class PhantomWalletAdapter {
        constructor() {
            this.connected = false;
            this.publicKey = null;
        }

        async connect() {
            try {
                const provider = window.solana;
                if (provider && provider.isPhantom) {
                    await provider.connect();
                    this.publicKey = provider.publicKey.toString();
                    this.connected = true;
                } else {
                    await alert_("Phantom wallet is not installed.");
                }
            } catch (err) {
                console.error(err);
                this.connected = false;
            }
        }

        disconnect() {
            if (this.connected) {
                window.solana.disconnect();
                this.connected = false;
                this.publicKey = null;
            }
        }
    }

    async function connectSolflare() {
        const solflareWallet = new SolflareWalletAdapter();
        await solflareWallet.connect();

        if (solflareWallet.connected) {
            await alert_(`Connected! Public Key: ${solflareWallet.publicKey} . You have been whitelisted for our Project. Thank you.`);
            // Optionally handle the connected wallet here
        } else {
            await alert_("Failed to connect Solflare wallet.");
        }
    }

    async function connectPhantom() {
        const phantomWallet = new PhantomWalletAdapter();
        await phantomWallet.connect();

        if (phantomWallet.connected) {
            await alert_(`Connected! Public Key: ${phantomWallet.publicKey} . You have been whitelisted for our Project. Thank you.`);
            // Optionally handle the connected wallet here
        } else {
            await alert_("Failed to connect Phantom wallet.");
        }
    }

    async function manualInput() {
        const address = await prompt_("Enter your Solana address:");
        if (address) {
            await alert_(`Public Key: ${address}  . You have been whitelisted for our Project. Thank you.`);
            // Optionally handle the manual input address here
        }
    }


// window.onload = function() {
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Adjust canvas size to fit its parent container
    function resizeCanvas() {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth > 600 ? 600 : parent.clientWidth;
        canvas.height = parent.clientHeight > 800 ? 800 : parent.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const laneWidth = canvas.width / 3;
    const playerHeight = canvas.height / 12;
    const playerWidth = laneWidth / 2;
    let playerX = laneWidth + (laneWidth - playerWidth) / 2;
    let playerY = canvas.height - playerHeight - 20;
    let playerLane = 1;
    let isJumping = false; // Track if the player is jumping
    let jumpStartY = playerY; // Initial player Y position
    let jumpHeight = 100; // Maximum height of jump
    let jumpSpeed = 5; // Speed of the jump
    let jumpDirection = 1; // 1 for up, -1 for down

    let score = 0;
    let timer = 30;
    let obstacles = [];
    let tokens = [];
    let gameInterval;
    let timerInterval;

    function startGame() {
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
        timerInterval = setInterval(updateTimer, 1000);
    }

    function resetGame() {
        score = 0;
        timer = 30;
        playerLane = 1;
        playerX = laneWidth + (laneWidth - playerWidth) / 2;
        obstacles = [];
        tokens = [];
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        startGame();
    }

    function updateTimer() {
        timer--;
        document.getElementById('timerDisplay').innerText = `Time: ${timer}`;
        if (timer <= 0) {
            endGame();
        }
    }

    async function endGame() {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        await alert_(`Game Over! Your score: ${score}`);
        const walletChoice = await confirm_("Do you have a Solana wallet: Solfare or Phantom? (yes/no)");
        if (walletChoice === 'yes') {
            document.getElementById('walletButtons').style.display = 'flex';
        } else {
            manualInput();
        }
    }

    function drawPlayer() {
        ctx.font = `${playerWidth}px Arial`;
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'center';
        ctx.fillText('🚗', playerX + playerWidth / 2, playerY + playerHeight / 1.5);
    }

    function drawObstacles() {
        obstacles.forEach((obs, index) => {
            ctx.font = `${playerWidth}px Arial`;
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('🚓', obs.x + playerWidth / 2, obs.y + playerHeight / 1.5);
            obs.y += 5;
            if (obs.y > canvas.height) {
                obstacles.splice(index, 1);
            }
            // Check collision (skip collision during jump)
            if (!isJumping && obs.y + playerHeight > playerY && obs.y < playerY + playerHeight &&
                obs.x < playerX + playerWidth && obs.x + playerWidth > playerX) {
                endGame();
            }
        });
    }

    function drawTokens() {
        tokens.forEach((token, index) => {
            ctx.font = `${playerWidth}px Arial`;
            ctx.fillStyle = 'green';
            ctx.textAlign = 'center';
            ctx.fillText('💰', token.x + playerWidth / 2, token.y + playerHeight / 1.5);
            token.y += 5;
            if (token.y > canvas.height) {
                tokens.splice(index, 1);
            }
            if (!isJumping && token.y + playerHeight > playerY && token.y < playerY + playerHeight &&
                token.x < playerX + playerWidth && token.x + playerWidth > playerX) {
                tokens.splice(index, 1);
                score += 10;
                document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawObstacles();
        drawTokens();
    }

    function gameLoop() {
        draw();
        if (Math.random() < 0.02) {
            obstacles.push({
                x: Math.floor(Math.random() * 3) * laneWidth,
                y: -playerHeight
            });
        }
        if (Math.random() < 0.01) {
            tokens.push({
                x: Math.floor(Math.random() * 3) * laneWidth,
                y: -playerHeight
            });
        }
        handleJump(); // Update player jump during the loop
    }

    function movePlayer(direction) {
        if (direction === 'left' && playerLane > 0) {
            playerLane--;
        } else if (direction === 'right' && playerLane < 2) {
            playerLane++;
        }
        playerX = playerLane * laneWidth + (laneWidth - playerWidth) / 2;
    }

    function handleJump() {
        if (isJumping) {
            playerY -= jumpSpeed * jumpDirection;
            if (playerY <= jumpStartY - jumpHeight) {
                jumpDirection = -1; // Start falling after reaching max height
            }
            if (playerY >= jumpStartY) {
                playerY = jumpStartY;
                isJumping = false;
                jumpDirection = 1; // Reset direction for the next jump
            }
        }
    }

    // Mobile-specific: Tap to move left or right, or jump
    canvas.addEventListener('touchstart', (e) => {
        const touchX = e.touches[0].clientX;
        if (!isJumping) {
            if (touchX < canvas.width / 2) {
                movePlayer('left');
            } else {
                movePlayer('right');
            }
        }
    });

    // Double-tap to jump on mobile
    let lastTap = 0;
    canvas.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTap;
        if (tapInterval < 300 && !isJumping) {
            isJumping = true;
        }
        lastTap = currentTime;
    });

    // Desktop-specific: Arrow keys to move, space to jump
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight') {
            movePlayer('right');
        } else if (e.key === ' ') {
            if (!isJumping) {
                isJumping = true;
            }
        }
    });

    //Adding event listeners...
    document.getElementById('solflareButton').addEventListener('click', connectSolflare);
    document.getElementById('phantomButton').addEventListener('click', connectPhantom);
    document.getElementById('manualButton').addEventListener('click', manualInput);


    resetGame(); // Start the game on page load
    
});



