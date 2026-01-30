/**
 * 关卡配置模块
 * 包含三种难易度的关卡布局和最佳解法
 */

// 滑块类型常量
const PIECE_TYPES = {
    CAOCAO: 'caocao',    // 曹操: 2x2
    GENERAL_V: 'general_v', // 五虎将: 1x2 (竖)
    SOLDIER: 'soldier',    // 兵卒: 1x1
    GENERAL_H: 'general_h'  // 五虎将: 2x1 (横)
};

// 自定义关卡ID前缀
const CUSTOM_LEVELS_PREFIX = 'custom_';

// 滑块颜色配置
const PIECE_COLORS = {
    caocao: '#e74c3c',      // 红色 - 曹操
    general_v: '#f39c12',   // 橙色 - 竖将
    general_h: '#27ae60',   // 绿色 - 横将
    soldier: '#3498db'      // 蓝色 - 兵卒
};

/**
 * 关卡配置
 * 每个关卡包含：
 * - name: 关卡名称
 * - description: 关卡描述
 * - pieces: 初始滑块布局
 * - solution: 最佳解法（移动序列）
 */
const LEVELS = {
    1: {
        name: '飞燕归巢',
        description: '简单难度，约8步即可通关',
        pieces: [
            // 曹操 (2x2) - 顶部中央
            { id: 'C', type: PIECE_TYPES.CAOCAO, x: 1, y: 0, width: 2, height: 2, color: PIECE_COLORS.caocao, name: '曹操' },
            // 竖将 (1x2) - 左右两侧
            { id: 'G', type: PIECE_TYPES.GENERAL_V, x: 0, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '关羽' },
            { id: 'Z', type: PIECE_TYPES.GENERAL_V, x: 3, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '张飞' },
            // 兵卒 (1x1) - 底部
            { id: 'S1', type: PIECE_TYPES.SOLDIER, x: 0, y: 2, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S2', type: PIECE_TYPES.SOLDIER, x: 3, y: 2, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S3', type: PIECE_TYPES.SOLDIER, x: 1, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S4', type: PIECE_TYPES.SOLDIER, x: 2, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' }
        ],
        // 最佳解法 - 8步
        solution: [
            { pieceId: 'S1', dx: 0, dy: 1 },
            { pieceId: 'S2', dx: 0, dy: 1 },
            { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 },
            { pieceId: 'C', dx: -1, dy: 0 },
            { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'C', dx: 0, dy: 1 }
        ],
        minMoves: 8
    },

    2: {
        name: '层层设防',
        description: '中等难度，约50步即可通关',
        pieces: [
            // 曹操 (2x2) - 顶部中央
            { id: 'C', type: PIECE_TYPES.CAOCAO, x: 1, y: 0, width: 2, height: 2, color: PIECE_COLORS.caocao, name: '曹操' },
            // 竖将 (1x2) - 上方两侧
            { id: 'G', type: PIECE_TYPES.GENERAL_V, x: 0, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '关羽' },
            { id: 'Z', type: PIECE_TYPES.GENERAL_V, x: 3, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '张飞' },
            // 竖将 (1x2) - 下方两侧
            { id: 'Y', type: PIECE_TYPES.GENERAL_V, x: 0, y: 2, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '赵云' },
            { id: 'M', type: PIECE_TYPES.GENERAL_V, x: 3, y: 2, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '马超' },
            // 兵卒 (1x1) - 中央两个
            { id: 'S1', type: PIECE_TYPES.SOLDIER, x: 1, y: 2, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S2', type: PIECE_TYPES.SOLDIER, x: 2, y: 2, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            // 兵卒 (1x1) - 底部两个
            { id: 'S3', type: PIECE_TYPES.SOLDIER, x: 1, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S4', type: PIECE_TYPES.SOLDIER, x: 2, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' }
        ],
        // 解法
        solution: [
            { pieceId: 'S1', dx: 0, dy: 1 }, { pieceId: 'S2', dx: 0, dy: 1 },
            { pieceId: 'S3', dx: 0, dy: 1 }, { pieceId: 'S4', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'M', dx: 0, dy: 1 },
            { pieceId: 'G', dx: 0, dy: 1 }, { pieceId: 'Z', dx: 0, dy: 1 },
            { pieceId: 'C', dx: 0, dy: 1 }, { pieceId: 'Y', dx: 0, dy: -1 },
            { pieceId: 'M', dx: 0, dy: -1 }, { pieceId: 'G', dx: 0, dy: -1 },
            { pieceId: 'Z', dx: 0, dy: -1 }, { pieceId: 'C', dx: -1, dy: 0 },
            { pieceId: 'Y', dx: 1, dy: 0 }, { pieceId: 'M', dx: -1, dy: 0 },
            { pieceId: 'S1', dx: 0, dy: -1 }, { pieceId: 'S2', dx: 0, dy: -1 },
            { pieceId: 'S3', dx: 0, dy: -1 }, { pieceId: 'S4', dx: 0, dy: -1 },
            { pieceId: 'C', dx: 0, dy: 1 }, { pieceId: 'Z', dx: 1, dy: 0 },
            { pieceId: 'G', dx: 1, dy: 0 }, { pieceId: 'M', dx: 1, dy: 0 },
            { pieceId: 'S2', dx: 1, dy: 0 }, { pieceId: 'S3', dx: -1, dy: 0 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'G', dx: 0, dy: -1 }, { pieceId: 'Z', dx: 0, dy: -1 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'S1', dx: 0, dy: 1 },
            { pieceId: 'S4', dx: 0, dy: 1 }, { pieceId: 'C', dx: 1, dy: 0 },
            { pieceId: 'Z', dx: 1, dy: 0 }, { pieceId: 'G', dx: 1, dy: 0 },
            { pieceId: 'Y', dx: -1, dy: 0 }, { pieceId: 'S2', dx: -1, dy: 0 },
            { pieceId: 'S3', dx: 1, dy: 0 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: 1, dy: 0 }, { pieceId: 'S1', dx: 1, dy: 0 },
            { pieceId: 'S2', dx: 0, dy: -1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'S1', dx: 0, dy: 1 },
            { pieceId: 'S4', dx: 0, dy: 1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: -1 }, { pieceId: 'G', dx: 0, dy: -1 },
            { pieceId: 'Y', dx: 0, dy: -1 }, { pieceId: 'M', dx: 0, dy: -1 },
            { pieceId: 'S2', dx: -1, dy: 0 }, { pieceId: 'S3', dx: 1, dy: 0 },
            { pieceId: 'S1', dx: 0, dy: -1 }, { pieceId: 'S4', dx: 0, dy: -1 },
            { pieceId: 'C', dx: -1, dy: 0 }, { pieceId: 'Z', dx: -1, dy: 0 },
            { pieceId: 'G', dx: -1, dy: 0 }, { pieceId: 'Y', dx: -1, dy: 0 },
            { pieceId: 'M', dx: -1, dy: 0 }, { pieceId: 'S2', dx: 0, dy: 1 },
            { pieceId: 'S3', dx: 0, dy: 1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'M', dx: 0, dy: 1 }
        ],
        minMoves: 50
    },

    3: {
        name: '横刀立马',
        description: '经典布局，困难难度，约81步方可通关',
        pieces: [
            // 曹操 (2x2) - 顶部中央
            { id: 'C', type: PIECE_TYPES.CAOCAO, x: 1, y: 0, width: 2, height: 2, color: PIECE_COLORS.caocao, name: '曹操' },
            // 竖将 (1x2) - 左右两侧
            { id: 'G', type: PIECE_TYPES.GENERAL_V, x: 0, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '黄忠' },
            { id: 'Z', type: PIECE_TYPES.GENERAL_V, x: 3, y: 0, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '张飞' },
            // 竖将 (1x2) - 下方两侧
            { id: 'Y', type: PIECE_TYPES.GENERAL_V, x: 0, y: 2, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '赵云' },
            { id: 'M', type: PIECE_TYPES.GENERAL_V, x: 3, y: 2, width: 1, height: 2, color: PIECE_COLORS.general_v, name: '马超' },
            // 横将 (2x1) - 中央
            { id: 'H', type: PIECE_TYPES.GENERAL_H, x: 1, y: 2, width: 2, height: 1, color: PIECE_COLORS.general_h, name: '关羽' },
            // 兵卒 (1x1) - 底部
            { id: 'S1', type: PIECE_TYPES.SOLDIER, x: 1, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S2', type: PIECE_TYPES.SOLDIER, x: 2, y: 3, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S3', type: PIECE_TYPES.SOLDIER, x: 0, y: 4, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' },
            { id: 'S4', type: PIECE_TYPES.SOLDIER, x: 3, y: 4, width: 1, height: 1, color: PIECE_COLORS.soldier, name: '兵' }
        ],
        // 横刀立马经典解法 - 81步
        solution: [
            { pieceId: 'S1', dx: 0, dy: 1 }, { pieceId: 'S2', dx: 0, dy: 1 },
            { pieceId: 'S3', dx: 1, dy: 0 }, { pieceId: 'S4', dx: -1, dy: 0 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'H', dx: 0, dy: 1 },
            { pieceId: 'M', dx: 0, dy: 1 }, { pieceId: 'S3', dx: 0, dy: -1 },
            { pieceId: 'S4', dx: 0, dy: -1 }, { pieceId: 'Z', dx: 0, dy: 1 },
            { pieceId: 'G', dx: 0, dy: 1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: 1, dy: 0 }, { pieceId: 'H', dx: -1, dy: 0 },
            { pieceId: 'M', dx: -1, dy: 0 }, { pieceId: 'S1', dx: -1, dy: 0 },
            { pieceId: 'S2', dx: 1, dy: 0 }, { pieceId: 'C', dx: 0, dy: -1 },
            { pieceId: 'Z', dx: 0, dy: -1 }, { pieceId: 'G', dx: 0, dy: -1 },
            { pieceId: 'Y', dx: 0, dy: -1 }, { pieceId: 'M', dx: 0, dy: -1 },
            { pieceId: 'H', dx: 1, dy: 0 }, { pieceId: 'C', dx: 1, dy: 0 },
            { pieceId: 'S3', dx: 1, dy: 0 }, { pieceId: 'S4', dx: -1, dy: 0 },
            { pieceId: 'Y', dx: 0, dy: 1 }, { pieceId: 'M', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'H', dx: -1, dy: 0 }, { pieceId: 'C', dx: -1, dy: 0 },
            { pieceId: 'M', dx: 1, dy: 0 }, { pieceId: 'Y', dx: -1, dy: 0 },
            { pieceId: 'S3', dx: 0, dy: 1 }, { pieceId: 'S4', dx: 0, dy: 1 },
            { pieceId: 'C', dx: 0, dy: 1 }, { pieceId: 'Z', dx: 1, dy: 0 },
            { pieceId: 'G', dx: 1, dy: 0 }, { pieceId: 'H', dx: 0, dy: -1 },
            { pieceId: 'Y', dx: 0, dy: -1 }, { pieceId: 'M', dx: 0, dy: -1 },
            { pieceId: 'S3', dx: 0, dy: -1 }, { pieceId: 'S4', dx: 0, dy: -1 },
            { pieceId: 'C', dx: -1, dy: 0 }, { pieceId: 'Z', dx: 0, dy: -1 },
            { pieceId: 'G', dx: 0, dy: -1 }, { pieceId: 'S1', dx: 0, dy: -1 },
            { pieceId: 'S2', dx: 0, dy: -1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'H', dx: 1, dy: 0 }, { pieceId: 'Y', dx: 1, dy: 0 },
            { pieceId: 'M', dx: -1, dy: 0 }, { pieceId: 'S3', dx: 1, dy: 0 },
            { pieceId: 'S4', dx: -1, dy: 0 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: -1, dy: 0 }, { pieceId: 'M', dx: 1, dy: 0 },
            { pieceId: 'S1', dx: 0, dy: 1 }, { pieceId: 'S2', dx: 0, dy: 1 },
            { pieceId: 'H', dx: 0, dy: 1 }, { pieceId: 'C', dx: 1, dy: 0 },
            { pieceId: 'Z', dx: 1, dy: 0 }, { pieceId: 'G', dx: 1, dy: 0 },
            { pieceId: 'Y', dx: 0, dy: -1 }, { pieceId: 'M', dx: 0, dy: -1 },
            { pieceId: 'S3', dx: 0, dy: -1 }, { pieceId: 'S4', dx: 0, dy: -1 },
            { pieceId: 'C', dx: -1, dy: 0 }, { pieceId: 'Z', dx: 0, dy: -1 },
            { pieceId: 'G', dx: 0, dy: -1 }, { pieceId: 'S1', dx: 0, dy: -1 },
            { pieceId: 'S2', dx: 0, dy: -1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Y', dx: -1, dy: 0 }, { pieceId: 'M', dx: 1, dy: 0 },
            { pieceId: 'S3', dx: 1, dy: 0 }, { pieceId: 'S4', dx: -1, dy: 0 },
            { pieceId: 'C', dx: 0, dy: 1 }, { pieceId: 'Z', dx: 0, dy: 1 },
            { pieceId: 'G', dx: 0, dy: 1 }, { pieceId: 'Y', dx: 1, dy: 0 },
            { pieceId: 'M', dx: -1, dy: 0 }, { pieceId: 'S1', dx: 1, dy: 0 },
            { pieceId: 'S2', dx: 0, dy: -1 }, { pieceId: 'C', dx: 0, dy: 1 },
            { pieceId: 'Z', dx: 0, dy: 1 }, { pieceId: 'G', dx: 0, dy: 1 },
            { pieceId: 'H', dx: 0, dy: 1 }, { pieceId: 'Y', dx: 1, dy: 0 },
            { pieceId: 'M', dx: -1, dy: 0 }, { pieceId: 'S1', dx: 0, dy: 1 },
            { pieceId: 'S2', dx: 0, dy: 1 }, { pieceId: 'C', dx: 0, dy: 1 }
        ],
        minMoves: 81
    }
};

/**
 * 深拷贝关卡配置
 * @param {number} level - 关卡号
 * @returns {Object} 关卡配置的深拷贝
 */
function getLevelConfig(level) {
    const levelConfig = LEVELS[level];
    if (!levelConfig) {
        return null;
    }

    return {
        name: levelConfig.name,
        description: levelConfig.description,
        pieces: JSON.parse(JSON.stringify(levelConfig.pieces)),
        solution: JSON.parse(JSON.stringify(levelConfig.solution)),
        minMoves: levelConfig.minMoves
    };
}

/**
 * 从存储获取指定自定义关卡配置
 * @param {string} id - 自定义关卡ID
 * @returns {Object|null} 关卡配置的深拷贝，如果不存在则返回null
 */
function getCustomLevelConfig(id) {
    const levels = Storage.getCustomLevels();
    const level = levels.find(l => l.id === id);

    if (!level) {
        return null;
    }

    return {
        name: level.name,
        description: level.description,
        pieces: JSON.parse(JSON.stringify(level.pieces)),
        id: level.id,
        createdAt: level.createdAt,
        updatedAt: level.updatedAt
    };
}

/**
 * 获取所有自定义关卡列表
 * @returns {Array} 自定义关卡数组
 */
function getAllCustomLevels() {
    return Storage.getCustomLevels();
}

/**
 * 生成唯一的自定义关卡ID
 * @returns {string} 唯一的关卡ID
 */
function generateCustomLevelId() {
    return CUSTOM_LEVELS_PREFIX + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 创建新的自定义关卡配置
 * @param {string} name - 关卡名称
 * @returns {Object} 新的关卡配置对象
 */
function createCustomLevelConfig(name) {
    return {
        id: generateCustomLevelId(),
        name: name || '未命名关卡',
        description: '用户自定义',
        pieces: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}
