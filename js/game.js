/**
 * 游戏状态管理模块
 * 负责游戏的核心逻辑、状态管理和渲染
 */

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // 游戏配置
        this.gridWidth = 4;
        this.gridHeight = 5;
        this.cellSize = 80;
        this.padding = 5;

        // 游戏状态
        this.level = 1;
        this.pieces = [];
        this.moves = 0;
        this.time = 0;
        this.isSolved = false;
        this.isPaused = false;
        this.isAnimating = false;

        // 计时器
        this.timerInterval = null;

        // 动画
        this.animationQueue = [];
        this.currentAnimation = null;

        // 胜利位置（曹操到达此位置即通关）
        this.victoryPosition = { x: 1, y: 3 };

        // 关卡配置
        this.currentLevelConfig = null;

        // 拖拽相关
        this.dragState = {
            isDragging: false,
            piece: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            moved: false
        };

        // 拖拽移动阈值（像素）
        this.dragThreshold = 30;
    }

    init(level = 1) {
        this.level = level;
        this.currentLevelConfig = getLevelConfig(level);
        this.reset();
        this.render();
    }

    reset() {
        this.pieces = JSON.parse(JSON.stringify(this.currentLevelConfig.pieces));
        this.moves = 0;
        this.time = 0;
        this.isSolved = false;
        this.isPaused = false;
        this.isAnimating = false;
        this.animationQueue = [];
        this.currentAnimation = null;

        this.stopTimer();
        this.startTimer();

        this.updateUI();
        this.render();
    }

    startTimer() {
        if (this.timerInterval) {
            return;
        }
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isSolved) {
                this.time++;
                this.updateUI();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    updateUI() {
        document.getElementById('moves').textContent = this.moves;

        const mins = Math.floor(this.time / 60);
        const secs = this.time % 60;
        document.getElementById('time').textContent =
            mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }

    render() {
        const { ctx, canvas } = this;

        ctx.fillStyle = '#2d1b0e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawGrid();

        this.pieces.forEach(piece => {
            if (this.dragState.isDragging && this.dragState.piece === piece && !this.dragState.moved) {
                const preview = this.getDragPreview();
                if (preview) {
                    this.drawPiecePreview(piece, preview.x, preview.y);
                }
            }
            this.drawPiece(piece);
        });

        this.drawExit();
    }

    drawGrid() {
        const { ctx } = this;

        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 3;

        for (let x = 0; x <= this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
            ctx.stroke();
        }

        for (let y = 0; y <= this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
            ctx.stroke();
        }
    }

    drawPiece(piece) {
        const { ctx } = this;
        const x = piece.x * this.cellSize + this.padding;
        const y = piece.y * this.cellSize + this.padding;
        const width = piece.width * this.cellSize - this.padding * 2;
        const height = piece.height * this.cellSize - this.padding * 2;

        const mainColor = piece.id === 'C' ? '#ffd700' : piece.color;
        const darkColor = piece.id === 'C' ? '#8b6914' : this.darkenColor(piece.color, 30);
        const borderColor = piece.id === 'C' ? '#fff' : '#d4af37';

        ctx.fillStyle = mainColor;
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = darkColor;
        ctx.fillRect(x, y + height - 4, width, 4);
        ctx.fillRect(x + width - 4, y, 4, height);

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#1a0f08';
        ctx.font = piece.id === 'C' ? 'bold 24px "Courier New"' : 'bold 20px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(piece.name, x + width / 2, y + height / 2);
    }

    drawPiecePreview(piece, x, y) {
        const { ctx } = this;
        const drawX = x * this.cellSize + this.padding;
        const drawY = y * this.cellSize + this.padding;
        const width = piece.width * this.cellSize - this.padding * 2;
        const height = piece.height * this.cellSize - this.padding * 2;

        ctx.globalAlpha = 0.6;

        ctx.fillStyle = piece.color;
        ctx.fillRect(drawX, drawY, width, height);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(drawX, drawY, width, height);

        ctx.globalAlpha = 1.0;
    }

    drawExit() {
        const { ctx } = this;
        const x = 1.5 * this.cellSize;
        const y = 4 * this.cellSize;

        ctx.fillStyle = '#4d3827';
        ctx.fillRect(x, y + this.cellSize, this.cellSize, 20);

        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 30, y + this.cellSize + 5, 20, 10);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('出口', x + this.cellSize / 2, y + this.cellSize + 10);
    }

    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    handleMouseDown(canvasX, canvasY) {
        if (this.isSolved || this.isPaused || this.isAnimating) {
            return;
        }

        const gridX = Math.floor(canvasX / this.cellSize);
        const gridY = Math.floor(canvasY / this.cellSize);

        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return;
        }

        const piece = this.getPieceAt(gridX, gridY);
        if (!piece) {
            return;
        }

        this.dragState = {
            isDragging: true,
            piece: piece,
            startX: canvasX,
            startY: canvasY,
            currentX: canvasX,
            currentY: canvasY,
            moved: false
        };
    }

    handleMouseMove(canvasX, canvasY) {
        if (!this.dragState.isDragging || this.dragState.moved) {
            return;
        }

        this.dragState.currentX = canvasX;
        this.dragState.currentY = canvasY;

        const deltaX = canvasX - this.dragState.startX;
        const deltaY = canvasY - this.dragState.startY;

        if (Math.abs(deltaX) < this.dragThreshold && Math.abs(deltaY) < this.dragThreshold) {
            return;
        }

        let moveDirection = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            moveDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            moveDirection = deltaY > 0 ? 'down' : 'up';
        }

        const validMoves = this.getValidMoves(this.dragState.piece);
        const selectedMove = validMoves.find(m => m.dir === moveDirection);

        if (selectedMove) {
            this.dragState.moved = true;
            this.movePiece(this.dragState.piece, selectedMove.dx, selectedMove.dy);
        }
    }

    handleMouseUp() {
        if (!this.dragState.isDragging) {
            return;
        }

        this.dragState.isDragging = false;
        this.dragState.piece = null;

        if (!this.dragState.moved) {
            const gridX = Math.floor(this.dragState.startX / this.cellSize);
            const gridY = Math.floor(this.dragState.startY / this.cellSize);
            const piece = this.getPieceAt(gridX, gridY);
            if (piece) {
                const validMoves = this.getValidMoves(piece);
                if (validMoves.length > 0) {
                    this.movePiece(piece, validMoves[0].dx, validMoves[0].dy);
                }
            }
        }

        this.dragState.moved = false;
    }

    getDragPreview() {
        if (!this.dragState.isDragging || this.dragState.moved) {
            return null;
        }

        const deltaX = this.dragState.currentX - this.dragState.startX;
        const deltaY = this.dragState.currentY - this.dragState.startY;

        if (Math.abs(deltaX) < this.dragThreshold && Math.abs(deltaY) < this.dragThreshold) {
            return null;
        }

        let moveDirection = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            moveDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            moveDirection = deltaY > 0 ? 'down' : 'up';
        }

        const directions = {
            'up': { dx: 0, dy: -1 },
            'down': { dx: 0, dy: 1 },
            'left': { dx: -1, dy: 0 },
            'right': { dx: 1, dy: 0 }
        };

        const move = directions[moveDirection];
        if (this.canMove(this.dragState.piece, move.dx, move.dy)) {
            return {
                x: this.dragState.piece.x + move.dx,
                y: this.dragState.piece.y + move.dy,
                dx: move.dx,
                dy: move.dy
            };
        }

        return null;
    }

    getPieceAt(x, y) {
        return this.pieces.find(p =>
            x >= p.x && x < p.x + p.width &&
            y >= p.y && y < p.y + p.height
        );
    }

    tryMovePiece(piece, preferredDirections = ['down', 'up', 'left', 'right']) {
        const validMoves = this.getValidMoves(piece);

        if (validMoves.length === 0) {
            return;
        }

        let selectedMove = null;
        for (const dir of preferredDirections) {
            selectedMove = validMoves.find(m => m.dir === dir);
            if (selectedMove) {
                break;
            }
        }

        if (!selectedMove) {
            selectedMove = validMoves[0];
        }

        this.movePiece(piece, selectedMove.dx, selectedMove.dy);
    }

    getValidMoves(piece) {
        const directions = [
            { dx: 0, dy: -1, dir: 'up' },
            { dx: 0, dy: 1, dir: 'down' },
            { dx: -1, dy: 0, dir: 'left' },
            { dx: 1, dy: 0, dir: 'right' }
        ];

        const validMoves = [];

        for (const dir of directions) {
            if (this.canMove(piece, dir.dx, dir.dy)) {
                validMoves.push(dir);
            }
        }

        return validMoves;
    }

    canMove(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        if (newX < 0 || newX + piece.width > this.gridWidth) {
            return false;
        }
        if (newY < 0 || newY + piece.height > this.gridHeight) {
            return false;
        }

        for (const other of this.pieces) {
            if (other.id === piece.id) {
                continue;
            }

            if (newX < other.x + other.width &&
                newX + piece.width > other.x &&
                newY < other.y + other.height &&
                newY + piece.height > other.y) {
                return false;
            }
        }

        return true;
    }

    movePiece(piece, dx, dy) {
        const animation = {
            piece,
            fromX: piece.x,
            fromY: piece.y,
            toX: piece.x + dx,
            toY: piece.y + dy,
            progress: 0,
            duration: 150,
            startTime: Date.now()
        };

        this.isAnimating = true;
        this.currentAnimation = animation;

        this.animateMove(animation);
    }

    animateMove(animation) {
        const animate = () => {
            const elapsed = Date.now() - animation.startTime;
            animation.progress = Math.min(elapsed / animation.duration, 1);

            const eased = this.easeOutQuad(animation.progress);

            animation.piece.x = animation.fromX + (animation.toX - animation.fromX) * eased;
            animation.piece.y = animation.fromY + (animation.toY - animation.fromY) * eased;

            this.render();

            if (animation.progress < 1) {
                requestAnimationFrame(animate);
            } else {
                animation.piece.x = animation.toX;
                animation.piece.y = animation.toY;

                this.currentAnimation = null;
                this.isAnimating = false;

                this.moves++;
                this.updateUI();

                this.checkVictory();
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }

    checkVictory() {
        const caocao = this.pieces.find(p => p.id === 'C');

        if (caocao && caocao.x === this.victoryPosition.x && caocao.y === this.victoryPosition.y) {
            this.isSolved = true;
            this.stopTimer();

            Storage.updateRecord(this.level, this.moves, this.time);

            setTimeout(() => this.showVictory(), 300);
        }
    }

    showVictory() {
        const modal = document.getElementById('victoryModal');
        const message = document.getElementById('victoryMessage');

        const mins = Math.floor(this.time / 60);
        const secs = this.time % 60;
        const timeStr = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

        message.innerHTML = `
            <strong>${this.currentLevelConfig.name}</strong><br>
            步数：${this.moves}<br>
            时间：${timeStr}
        `;

        modal.classList.add('show');
    }

    updateRecordsDisplay() {
        for (let i = 1; i <= 3; i++) {
            const record = Storage.getRecord(i);
            const element = document.getElementById('record' + i);
            element.textContent = Storage.formatRecord(record);
        }
    }
}
