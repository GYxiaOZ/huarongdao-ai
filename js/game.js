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

        // 绘制更精美的背景
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#3d2817');
        bgGradient.addColorStop(0.5, '#2c1810');
        bgGradient.addColorStop(1, '#1f1611');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 添加木纹效果
        ctx.globalAlpha = 0.07;
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 15, canvas.height);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

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

        // 主网格线 - 更精细的金色边框
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.lineWidth = 2;

        // 外边框
        ctx.strokeRect(0, 0, this.gridWidth * this.cellSize, this.gridHeight * this.cellSize);

        // 内部网格线
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 1; x < this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
            ctx.stroke();
        }

        for (let y = 1; y < this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
            ctx.stroke();
        }

        // 添加微妙的网格点装饰
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        for (let x = 0; x <= this.gridWidth; x++) {
            for (let y = 0; y <= this.gridHeight; y++) {
                ctx.beginPath();
                ctx.arc(x * this.cellSize, y * this.cellSize, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawPiece(piece) {
        const { ctx } = this;
        const x = piece.x * this.cellSize + this.padding;
        const y = piece.y * this.cellSize + this.padding;
        const width = piece.width * this.cellSize - this.padding * 2;
        const height = piece.height * this.cellSize - this.padding * 2;

        // 创建更精美的渐变效果
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        
        // 曹操（主将）特殊处理
        if (piece.id === 'C') {
            gradient.addColorStop(0, '#d4af37');
            gradient.addColorStop(0.5, '#ffd700');
            gradient.addColorStop(1, '#b8860b');
        } else {
            // 其他武将
            gradient.addColorStop(0, piece.color);
            gradient.addColorStop(0.5, this.lightenColor(piece.color, 15));
            gradient.addColorStop(1, this.darkenColor(piece.color, 20));
        }

        // 绘制阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // 绘制主体
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();

        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 添加高光效果
        const highlightGradient = ctx.createLinearGradient(x, y, x, y + height);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width - 6, height / 3, 6);
        ctx.fill();

        // 添加边框
        ctx.strokeStyle = piece.id === 'C' ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = piece.id === 'C' ? 3 : 2;
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = '#fff';
        ctx.font = piece.id === 'C' ? 'bold 28px "Microsoft YaHei"' : 'bold 24px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(piece.name, x + width / 2, y + height / 2);
        
        // 重置文字阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 为曹操添加特殊装饰
        if (piece.id === 'C') {
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x + 8, y + 8, width - 16, height - 16, 6);
            ctx.stroke();
        }
    }

    drawPiecePreview(piece, x, y) {
        const { ctx } = this;
        const drawX = x * this.cellSize + this.padding;
        const drawY = y * this.cellSize + this.padding;
        const width = piece.width * this.cellSize - this.padding * 2;
        const height = piece.height * this.cellSize - this.padding * 2;

        // 更精美的预览效果
        ctx.globalAlpha = 0.5;
        
        // 添加发光效果
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 绘制预览主体
        const previewGradient = ctx.createLinearGradient(drawX, drawY, drawX + width, drawY + height);
        previewGradient.addColorStop(0, piece.color);
        previewGradient.addColorStop(1, this.darkenColor(piece.color, 10));
        
        ctx.fillStyle = previewGradient;
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, width, height, 10);
        ctx.fill();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // 添加金色边框指示可移动位置
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.globalAlpha = 1.0;
    }

    drawExit() {
        const { ctx } = this;
        const x = 1.5 * this.cellSize;
        const y = 4 * this.cellSize;

        // 绘制更精美的出口标识
        ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 15);
        ctx.lineTo(x + this.cellSize + 5, y + 15);
        ctx.lineTo(x + this.cellSize / 2, y + this.cellSize + 5);
        ctx.closePath();
        ctx.fill();

        // 添加发光效果
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        
        // 绘制箭头
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + this.cellSize / 2, y + 20);
        ctx.lineTo(x + this.cellSize / 2, y + this.cellSize - 5);
        ctx.stroke();
        
        // 箭头头部
        ctx.beginPath();
        ctx.moveTo(x + this.cellSize / 2, y + this.cellSize - 5);
        ctx.lineTo(x + this.cellSize / 2 - 8, y + this.cellSize - 15);
        ctx.moveTo(x + this.cellSize / 2, y + this.cellSize - 5);
        ctx.lineTo(x + this.cellSize / 2 + 8, y + this.cellSize - 15);
        ctx.stroke();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // 绘制文字
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('出口', x + this.cellSize / 2, y + this.cellSize + 25);
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
