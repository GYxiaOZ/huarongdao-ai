/**
 * 游戏主逻辑模块
 * 负责初始化和事件绑定
 */

// 创建游戏实例
const game = new Game('gameCanvas');

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏（默认简单模式）
    game.init(1);

    // 更新最佳记录显示
    game.updateRecordsDisplay();

    // 绑定事件
    bindEvents();
});

/**
 * 绑定所有事件
 */
function bindEvents() {
    // 难度切换按钮
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            switchDifficulty(level);
        });
    });

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
        game.reset();
    });

    // 暂停/继续按钮
    document.getElementById('pauseBtn').addEventListener('click', () => {
        const isPaused = game.togglePause();
        game.updateUI();
    });

    // 新游戏按钮（胜利弹窗）
    document.getElementById('newGameBtn').addEventListener('click', () => {
        closeVictoryModal();
        game.init(game.level);
        game.updateRecordsDisplay();
    });

    // 点击关闭胜利弹窗
    document.getElementById('victoryModal').addEventListener('click', (e) => {
        if (e.target.id === 'victoryModal') {
            closeVictoryModal();
        }
    });

    // Canvas鼠标按下事件（开始拖拽）
    game.canvas.addEventListener('mousedown', (e) => {
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.canvas.width / rect.width;
        const scaleY = game.canvas.height / rect.height;

        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        game.handleMouseDown(canvasX, canvasY);
    });

    // Canvas鼠标移动事件（拖拽预览）
    game.canvas.addEventListener('mousemove', (e) => {
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.canvas.width / rect.width;
        const scaleY = game.canvas.height / rect.height;

        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        game.handleMouseMove(canvasX, canvasY);

        // 如果正在拖拽，需要不断重新渲染以显示预览
        if (game.dragState.isDragging && !game.dragState.moved) {
            game.render();
        } else if (!game.dragState.isDragging) {
            // 非拖拽状态下的悬停效果
            if (game.isPaused || game.isSolved || game.isAnimating) {
                return;
            }

            const gridX = Math.floor(canvasX / game.cellSize);
            const gridY = Math.floor(canvasY / game.cellSize);

            const piece = game.getPieceAt(gridX, gridY);

            // 更新光标
            game.canvas.style.cursor = piece ? 'grab' : 'default';
        }
    });

    // Canvas鼠标释放事件（结束拖拽）
    game.canvas.addEventListener('mouseup', () => {
        game.handleMouseUp();
    });

    // Canvas鼠标移出事件（取消拖拽）
    game.canvas.addEventListener('mouseleave', () => {
        if (game.dragState.isDragging) {
            game.dragState.isDragging = false;
            game.dragState.piece = null;
        }
        game.render();
    });

    // 全局鼠标释放事件（防止鼠标移出画布后释放）
    document.addEventListener('mouseup', () => {
        if (game.dragState.isDragging) {
            game.handleMouseUp();
        }
    });

    // Canvas触摸开始事件（开始拖拽）
    game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.canvas.width / rect.width;
        const scaleY = game.canvas.height / rect.height;

        const canvasX = (e.touches[0].clientX - rect.left) * scaleX;
        const canvasY = (e.touches[0].clientY - rect.top) * scaleY;

        game.handleMouseDown(canvasX, canvasY);
    });

    // Canvas触摸移动事件（拖拽预览）
    game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.canvas.width / rect.width;
        const scaleY = game.canvas.height / rect.height;

        const canvasX = (e.touches[0].clientX - rect.left) * scaleX;
        const canvasY = (e.touches[0].clientY - rect.top) * scaleY;

        game.handleMouseMove(canvasX, canvasY);

        if (game.dragState.isDragging && !game.dragState.moved) {
            game.render();
        }
    });

    // Canvas触摸结束事件（结束拖拽）
    game.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        game.handleMouseUp();
    });

    // 全局触摸结束事件（防止触摸移出画布后释放）
    document.addEventListener('touchend', () => {
        if (game.dragState.isDragging) {
            game.handleMouseUp();
        }
    });
}

/**
 * 切换难度
 * @param {number} level - 新的难度等级
 */
function switchDifficulty(level) {
    // 更新按钮状态
    const btns = document.querySelectorAll('.difficulty-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.level) === level) {
            btn.classList.add('active');
        }
    });

    // 重新初始化游戏
    game.init(level);
    game.updateRecordsDisplay();
}

/**
 * 关闭胜利弹窗
 */
function closeVictoryModal() {
    document.getElementById('victoryModal').classList.remove('show');
}
