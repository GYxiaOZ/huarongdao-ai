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
            const levelValue = btn.dataset.level;
            const level = levelValue === 'custom' ? 'custom' : parseInt(levelValue);
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
        // 如果在自定义编辑模式下点击"再来一局"，返回到编辑模式而不是重新开始游戏
        if (game.isEditMode) {
            return;
        }
        if (game.customLevelId) {
            game.init(game.customLevelId);
        } else {
            game.init(game.level);
        }
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

    // 全局触摸移动事件（在拖动时阻止页面滚动）
    document.addEventListener('touchmove', (e) => {
        if (game.dragState.isDragging) {
            e.preventDefault();
        }
    }, { passive: false });

    // 滑块工具栏按钮点击事件
    const pieceBtns = document.querySelectorAll('.piece-btn');
    pieceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pieceBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            game.selectedPieceType = btn.dataset.type;
        });
    });

    // 保存按钮
    document.getElementById('saveLevelBtn').addEventListener('click', saveCustomLevel);

    // 编辑选中按钮
    document.getElementById('editLevelBtn').addEventListener('click', () => {
        const activeItem = document.querySelector('.level-item.active');
        if (activeItem) {
            loadCustomLevelForEdit(activeItem.dataset.id);
        } else {
            alert('请先选择要编辑的关卡');
        }
    });

    // 开始游戏按钮
    document.getElementById('playLevelBtn').addEventListener('click', () => {
        const activeItem = document.querySelector('.level-item.active');
        if (activeItem) {
            playCustomLevel(activeItem.dataset.id);
        } else {
            alert('请先选择要玩的关卡');
        }
    });

    // 删除按钮
    document.getElementById('deleteLevelBtn').addEventListener('click', deleteCustomLevel);

    // 导出按钮
    document.getElementById('exportLevelBtn').addEventListener('click', exportCustomLevel);

    // 导入按钮
    document.getElementById('importLevelBtn').addEventListener('click', importCustomLevel);

    // 文件上传输入框变化事件
    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileImport(file);
        }
        e.target.value = '';
    });

    // 测试按钮
    document.getElementById('testLevelBtn').addEventListener('click', testCustomLevel);

    // 返回按钮
    document.getElementById('returnBtn').addEventListener('click', () => {
        switchToStandardMode();
        game.init(1);
        game.updateRecordsDisplay();
    });

    // 标题输入框变化事件
    document.getElementById('levelTitle').addEventListener('input', (e) => {
        game.editingLevelName = e.target.value.trim();
    });
}

/**
 * 切换难度
 * @param {number|string} level - 新的难度等级 (1-3 或 'custom')
 */
function switchDifficulty(level) {
    if (level === 'custom') {
        switchToCustomMode();
        return;
    }

    switchToStandardMode();

    // 更新按钮状态
    const btns = document.querySelectorAll('.difficulty-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        const btnLevel = btn.dataset.level === 'custom' ? 'custom' : parseInt(btn.dataset.level);
        if (btnLevel === level) {
            btn.classList.add('active');
        }
    });

    // 重新初始化游戏
    game.init(level);
    game.updateRecordsDisplay();
}

/**
 * 切换到自定义模式
 */
function switchToCustomMode() {
    // 更新按钮状态
    const btns = document.querySelectorAll('.difficulty-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === 'custom') {
            btn.classList.add('active');
        }
    });

    // 显示自定义编辑器
    showCustomEditor();

    // 进入编辑模式
    game.enterEditMode();

    // 更新自定义记录显示
    game.updateRecordsDisplay();
}

/**
 * 切换回标准模式
 */
function switchToStandardMode() {
    // 隐藏自定义编辑器
    hideCustomEditor();

    // 退出编辑模式
    game.exitEditMode();

    // 隐藏自定义记录
    document.getElementById('customRecordItem').style.display = 'none';
}

/**
 * 显示自定义编辑器
 */
function showCustomEditor() {
    document.getElementById('customEditor').style.display = 'block';
    updateCustomLevelList();
    updateEditModeUI(true);
}

/**
 * 隐藏自定义编辑器
 */
function hideCustomEditor() {
    document.getElementById('customEditor').style.display = 'none';
    updateEditModeUI(false);
    document.getElementById('levelTitle').value = '';
}

/**
 * 更新编辑模式的UI状态
 * @param {boolean} isEditMode - 是否为编辑模式
 */
function updateEditModeUI(isEditMode) {
    const gameContainer = document.querySelector('.game-container');
    const stats = document.querySelector('.stats');
    const gameButtons = document.querySelector('.game-buttons');
    
    if (isEditMode) {
        gameContainer.classList.add('edit-mode');
        stats.classList.add('disabled');
        gameButtons.classList.add('disabled');
        
        // 添加编辑提示（如果不存在）
        let hint = document.querySelector('.edit-mode-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'edit-mode-hint';
            hint.innerHTML = '<strong>编辑模式：</strong>点击画布放置/移除滑块';
            gameContainer.insertBefore(hint, gameContainer.firstChild);
        }
    } else {
        gameContainer.classList.remove('edit-mode');
        stats.classList.remove('disabled');
        gameButtons.classList.remove('disabled');
        
        // 移除编辑提示
        const hint = document.querySelector('.edit-mode-hint');
        if (hint) {
            hint.remove();
        }
    }
}

/**
 * 更新自定义关卡列表显示
 */
function updateCustomLevelList() {
    const container = document.getElementById('levelListContainer');
    const levels = getAllCustomLevels();

    container.innerHTML = '';

    // 防御性检查：确保 levels 是数组
    if (!Array.isArray(levels)) {
        console.error('获取自定义关卡列表失败：数据不是数组');
        container.innerHTML = '<div class="level-empty-state">数据错误，请刷新页面重试</div>';
        return;
    }

    if (levels.length === 0) {
        container.innerHTML = '<div class="level-empty-state">暂无自定义关卡，创建一个吧！</div>';
        return;
    }

    levels.forEach(level => {
        const item = document.createElement('div');
        item.className = 'level-item';
        if (game.customLevelId === level.id) {
            item.classList.add('active');
        }
        item.dataset.id = level.id;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'level-item-name';
        nameDiv.textContent = level.name;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'level-item-info';
        const date = new Date(level.updatedAt);
        infoDiv.textContent = `${level.pieces.length}个滑块 · 更新于 ${date.toLocaleDateString()}`;

        item.appendChild(nameDiv);
        item.appendChild(infoDiv);

        // 点击关卡项只进行选中，不直接加载
        item.addEventListener('click', () => {
            document.querySelectorAll('.level-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        // 双击关卡项直接开始游戏
        item.addEventListener('dblclick', () => {
            playCustomLevel(level.id);
        });

        container.appendChild(item);
    });
}

/**
 * 保存当前编辑的关卡
 */
function saveCustomLevel() {
    const titleInput = document.getElementById('levelTitle');
    const title = titleInput.value.trim();

    if (!title) {
        alert('请输入关卡标题');
        return;
    }

    game.editingLevelName = title;

    const validation = game.validateLayout();
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    const levelData = game.getLevelDataForSave();
    const id = game.customLevelId || generateCustomLevelId();

    Storage.saveCustomLevel(id, levelData);
    game.customLevelId = id;

    updateCustomLevelList();
    alert('关卡保存成功！');
}

/**
 * 加载指定自定义关卡到编辑器
 * @param {string} id - 关卡ID
 */
function loadCustomLevelForEdit(id) {
    if (game.loadCustomLevel(id)) {
        const levelConfig = getCustomLevelConfig(id);
        if (levelConfig) {
            document.getElementById('levelTitle').value = levelConfig.name;
            game.editingLevelName = levelConfig.name;
        }
    }
}

/**
 * 开始玩指定的自定义关卡
 * @param {string} id - 关卡ID
 */
function playCustomLevel(id) {
    const levelConfig = getCustomLevelConfig(id);
    if (!levelConfig) {
        alert('关卡不存在');
        return;
    }

    // 退出编辑模式，进入游戏模式
    switchToStandardMode();

    // 初始化游戏
    game.init(id);
    game.updateRecordsDisplay();
}

/**
 * 删除指定自定义关卡
 */
function deleteCustomLevel() {
    const activeItem = document.querySelector('.level-item.active');
    if (!activeItem) {
        alert('请先选择要删除的关卡');
        return;
    }

    if (!confirm('确定要删除这个关卡吗？')) {
        return;
    }

    const id = activeItem.dataset.id;
    if (Storage.deleteCustomLevel(id)) {
        updateCustomLevelList();
        game.enterEditMode();
        document.getElementById('levelTitle').value = '';
        alert('关卡删除成功！');
    }
}

/**
 * 导出当前关卡为 JSON 文件
 */
function exportCustomLevel() {
    const validation = game.validateLayout();
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    const levelData = game.getLevelDataForSave();
    levelData.id = game.customLevelId || generateCustomLevelId();
    levelData.exportedAt = Date.now();

    const json = JSON.stringify(levelData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `huarongdao_${levelData.name}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 从文件导入关卡
 */
function importCustomLevel() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

/**
 * 处理文件导入
 * @param {File} file - 导入的文件
 */
function handleFileImport(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const levelData = JSON.parse(e.target.result);

            if (!levelData.pieces || !Array.isArray(levelData.pieces)) {
                throw new Error('无效的关卡数据');
            }

            const id = generateCustomLevelId();
            levelData.id = id;
            levelData.importedAt = Date.now();

            Storage.saveCustomLevel(id, levelData);
            updateCustomLevelList();
            loadCustomLevelForEdit(id);

            alert('关卡导入成功！');
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    };

    reader.readAsText(file);
}

/**
 * 测试当前编辑的关卡（进入游戏模式）
 */
function testCustomLevel() {
    const validation = game.validateLayout();
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    // 如果没有保存过，先自动保存
    if (!game.customLevelId) {
        const titleInput = document.getElementById('levelTitle');
        const title = titleInput.value.trim();
        if (!title) {
            alert('请先输入关卡标题并保存');
            titleInput.focus();
            return;
        }
        // 自动保存
        game.editingLevelName = title;
        const levelData = game.getLevelDataForSave();
        const id = generateCustomLevelId();
        Storage.saveCustomLevel(id, levelData);
        game.customLevelId = id;
        updateCustomLevelList();
    }

    game.exitEditMode();
    game.init(game.customLevelId);
    game.updateRecordsDisplay();
}

/**
 * 关闭胜利弹窗
 */
function closeVictoryModal() {
    document.getElementById('victoryModal').classList.remove('show');
}
