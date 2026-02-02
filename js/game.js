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

        // 编辑模式相关
        this.isEditMode = false;
        this.selectedPieceType = null;
        this.customLevelId = null;
        this.editingLevelName = '';
        this.previewPosition = null;
    }

    init(level = 1) {
        if (typeof level === 'string' && level.startsWith(CUSTOM_LEVELS_PREFIX)) {
            this.level = 'custom';
            this.customLevelId = level;
            this.currentLevelConfig = getCustomLevelConfig(level);
        } else {
            this.level = level;
            this.customLevelId = null;
            this.currentLevelConfig = getLevelConfig(level);
        }
        this.reset();
        this.render();
    }

    reset() {
        if (this.currentLevelConfig && this.currentLevelConfig.pieces) {
            this.pieces = JSON.parse(JSON.stringify(this.currentLevelConfig.pieces));
        }
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

        if (this.isEditMode && this.previewPosition && this.selectedPieceType) {
            this.drawPreview();
        }

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

    drawPreview() {
        if (!this.previewPosition || !this.selectedPieceType) {
            return;
        }

        const pieceConfig = this.getPieceConfigByType(this.selectedPieceType);
        if (!pieceConfig) {
            return;
        }

        const { ctx } = this;
        const x = this.previewPosition.x * this.cellSize + this.padding;
        const y = this.previewPosition.y * this.cellSize + this.padding;
        const width = pieceConfig.width * this.cellSize - this.padding * 2;
        const height = pieceConfig.height * this.cellSize - this.padding * 2;

        ctx.globalAlpha = 0.5;

        ctx.fillStyle = pieceConfig.color;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

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
        // 编辑模式下允许操作，游戏模式下需要检查状态
        if (!this.isEditMode && (this.isSolved || this.isPaused || this.isAnimating)) {
            return;
        }

        const gridX = Math.floor(canvasX / this.cellSize);
        const gridY = Math.floor(canvasY / this.cellSize);

        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return;
        }

        if (this.isEditMode) {
            const piece = this.getPieceAt(gridX, gridY);
            if (piece) {
                this.removePiece(piece);
            } else if (this.selectedPieceType) {
                const success = this.addPieceToBoard(this.selectedPieceType, gridX, gridY);
                if (!success) {
                    // 添加失败时给出视觉反馈（可以通过闪烁边框等方式）
                    this.render();
                }
            }
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
        if (this.isEditMode) {
            const gridX = Math.floor(canvasX / this.cellSize);
            const gridY = Math.floor(canvasY / this.cellSize);

            if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                this.previewPosition = { x: gridX, y: gridY };
            } else {
                this.previewPosition = null;
            }
            this.render();
            return;
        }

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

            if (this.customLevelId) {
                Storage.updateCustomRecord(this.customLevelId, this.moves, this.time);
            } else {
                Storage.updateRecord(this.level, this.moves, this.time);
            }

            setTimeout(() => this.showVictory(), 300);
        }
    }

    showVictory() {
        const modal = document.getElementById('victoryModal');
        const message = document.getElementById('victoryMessage');

        const mins = Math.floor(this.time / 60);
        const secs = this.time % 60;
        const timeStr = mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

        // 获取关卡名称，提供多重后备确保不为空
        let levelName = '未知关卡';
        if (this.customLevelId) {
            levelName = this.editingLevelName || '自定义关卡';
        } else if (this.currentLevelConfig && this.currentLevelConfig.name) {
            levelName = this.currentLevelConfig.name;
        }

        message.innerHTML = `
            <strong>${levelName}</strong><br>
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

        if (this.customLevelId) {
            const record = Storage.getCustomRecord(this.customLevelId);
            document.getElementById('customRecord').textContent = Storage.formatRecord(record);
            // 优先使用 editingLevelName，否则从 currentLevelConfig 获取
            const levelName = this.editingLevelName || (this.currentLevelConfig && this.currentLevelConfig.name) || '自定义关卡';
            document.getElementById('customRecordLabel').textContent = levelName + '：';
            document.getElementById('customRecordItem').style.display = 'flex';
        }
    }

    /**
     * 进入编辑模式
     * @param {string} customLevelId - 自定义关卡ID，如果是新关卡则为null
     */
    enterEditMode(customLevelId = null) {
        this.isEditMode = true;
        this.customLevelId = customLevelId;
        this.editingLevelName = '';
        this.selectedPieceType = null;
        this.previewPosition = null;

        if (customLevelId) {
            const levelConfig = getCustomLevelConfig(customLevelId);
            if (levelConfig) {
                this.pieces = JSON.parse(JSON.stringify(levelConfig.pieces));
                this.editingLevelName = levelConfig.name;
                this.customLevelId = customLevelId;
            }
        } else {
            this.pieces = [];
        }

        this.moves = 0;
        this.time = 0;
        this.isSolved = false;
        this.isPaused = false;
        this.isAnimating = false;
        this.stopTimer();
        this.render();
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.isEditMode = false;
        this.selectedPieceType = null;
        this.customLevelId = null;
        this.editingLevelName = '';
        this.previewPosition = null;
        this.render();
    }

    /**
     * 在指定位置添加滑块
     * @param {string} type - 滑块类型
     * @param {number} x - 网格X坐标
     * @param {number} y - 网格Y坐标
     * @returns {boolean} 是否添加成功
     */
    addPieceToBoard(type, x, y) {
        const pieceConfig = this.getPieceConfigByType(type);
        if (!pieceConfig) {
            return false;
        }

        // 检查滑块类型限制
        if (type === PIECE_TYPES.CAOCAO) {
            // 检查是否已存在曹操
            const existingCaocao = this.pieces.find(p => p.type === PIECE_TYPES.CAOCAO);
            if (existingCaocao) {
                return false;
            }
        }

        const newPiece = {
            id: type === PIECE_TYPES.CAOCAO ? 'C' : this.generatePieceId(),
            type: type,
            x: x,
            y: y,
            width: pieceConfig.width,
            height: pieceConfig.height,
            color: pieceConfig.color,
            name: pieceConfig.name
        };

        if (!this.canPlacePiece(newPiece)) {
            return false;
        }

        this.pieces.push(newPiece);
        this.render();
        return true;
    }

    /**
     * 移除滑块
     * @param {Object} piece - 要移除的滑块
     * @returns {boolean} 是否移除成功
     */
    removePiece(piece) {
        const index = this.pieces.indexOf(piece);
        if (index > -1) {
            this.pieces.splice(index, 1);
            this.render();
            return true;
        }
        return false;
    }

    /**
     * 验证棋盘布局
     * @returns {Object} 验证结果 { valid: boolean, message: string }
     */
    validateLayout() {
        if (this.pieces.length === 0) {
            return { valid: false, message: '请至少添加一个滑块' };
        }

        const caocao = this.pieces.find(p => p.type === PIECE_TYPES.CAOCAO);
        if (!caocao) {
            return { valid: false, message: '必须包含一个曹操' };
        }

        for (const piece of this.pieces) {
            if (!this.isPieceInBounds(piece)) {
                return { valid: false, message: '滑块超出边界' };
            }
        }

        for (let i = 0; i < this.pieces.length; i++) {
            for (let j = i + 1; j < this.pieces.length; j++) {
                if (this.piecesOverlap(this.pieces[i], this.pieces[j])) {
                    return { valid: false, message: '滑块重叠' };
                }
            }
        }

        return { valid: true, message: '布局有效' };
    }

    /**
     * 获取当前关卡数据用于保存
     * @returns {Object} 关卡数据
     */
    getLevelDataForSave() {
        return {
            name: this.editingLevelName || '未命名关卡',
            description: '用户自定义',
            pieces: JSON.parse(JSON.stringify(this.pieces))
        };
    }

    /**
     * 加载指定自定义关卡
     * @param {string} id - 关卡ID
     * @returns {boolean} 是否加载成功
     */
    loadCustomLevel(id) {
        const levelConfig = getCustomLevelConfig(id);
        if (!levelConfig) {
            return false;
        }

        this.customLevelId = id;
        this.editingLevelName = levelConfig.name;
        this.pieces = JSON.parse(JSON.stringify(levelConfig.pieces));
        this.render();
        return true;
    }

    /**
     * 根据类型获取滑块配置
     * @param {string} type - 滑块类型
     * @returns {Object|null} 滑块配置
     */
    getPieceConfigByType(type) {
        const configs = {
            [PIECE_TYPES.CAOCAO]: { width: 2, height: 2, color: PIECE_COLORS.caocao, name: '曹操' },
            [PIECE_TYPES.GENERAL_V]: { width: 1, height: 2, color: PIECE_COLORS.general_v, name: '竖将' },
            [PIECE_TYPES.GENERAL_H]: { width: 2, height: 1, color: PIECE_COLORS.general_h, name: '横将' },
            [PIECE_TYPES.SOLDIER]: { width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵卒' }
        };
        return configs[type] || null;
    }

    /**
     * 生成滑块ID
     * @returns {string} 唯一的滑块ID
     */
    generatePieceId() {
        return 'P_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    /**
     * 检查滑块是否可以放置
     * @param {Object} piece - 滑块对象
     * @returns {boolean} 是否可以放置
     */
    canPlacePiece(piece) {
        if (!this.isPieceInBounds(piece)) {
            return false;
        }

        for (const other of this.pieces) {
            if (this.piecesOverlap(piece, other)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 检查滑块是否在边界内
     * @param {Object} piece - 滑块对象
     * @returns {boolean} 是否在边界内
     */
    isPieceInBounds(piece) {
        return piece.x >= 0 &&
               piece.y >= 0 &&
               piece.x + piece.width <= this.gridWidth &&
               piece.y + piece.height <= this.gridHeight;
    }

    /**
     * 检查两个滑块是否重叠
     * @param {Object} piece1 - 第一个滑块
     * @param {Object} piece2 - 第二个滑块
     * @returns {boolean} 是否重叠
     */
    piecesOverlap(piece1, piece2) {
        return piece1.x < piece2.x + piece2.width &&
               piece1.x + piece1.width > piece2.x &&
               piece1.y < piece2.y + piece2.height &&
               piece1.y + piece1.height > piece2.y;
    }
}
