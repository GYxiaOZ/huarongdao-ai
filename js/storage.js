/**
 * 本地存储管理模块
 * 负责保存和读取玩家的最佳记录
 */

const Storage = {
    STORAGE_KEY: 'huarongdao_records',

    /**
     * 获取所有记录
     * @returns {Object} 记录对象
     */
    getRecords() {
        const records = localStorage.getItem(this.STORAGE_KEY);
        return records ? JSON.parse(records) : {
            level1: { bestMoves: null, bestTime: null },
            level2: { bestMoves: null, bestTime: null },
            level3: { bestMoves: null, bestTime: null }
        };
    },

    /**
     * 保存记录
     * @param {Object} records - 记录对象
     */
    saveRecords(records) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    },

    /**
     * 获取指定关卡的记录
     * @param {number} level - 关卡号 (1-3)
     * @returns {Object} 该关卡的记录
     */
    getRecord(level) {
        const records = this.getRecords();
        const key = `level${level}`;
        return records[key] || { bestMoves: null, bestTime: null };
    },

    /**
     * 更新记录（如果更好）
     * @param {number} level - 关卡号 (1-3)
     * @param {number} moves - 步数
     * @param {number} time - 时间（秒）
     * @returns {boolean} 是否更新了记录
     */
    updateRecord(level, moves, time) {
        const records = this.getRecords();
        const key = `level${level}`;
        const current = records[key] || { bestMoves: null, bestTime: null };

        let updated = false;

        // 更新步数记录（更少的步数更好）
        if (current.bestMoves === null || moves < current.bestMoves) {
            current.bestMoves = moves;
            updated = true;
        }

        // 更新时间记录（更短的时间更好）
        if (current.bestTime === null || time < current.bestTime) {
            current.bestTime = time;
            updated = true;
        }

        if (updated) {
            records[key] = current;
            this.saveRecords(records);
        }

        return updated;
    },

    /**
     * 格式化记录为显示字符串
     * @param {Object} record - 记录对象
     * @returns {string} 格式化后的字符串
     */
    formatRecord(record) {
        if (record.bestMoves === null && record.bestTime === null) {
            return '-- / --';
        }

        const movesStr = record.bestMoves !== null ? `${record.bestMoves}步` : '--';
        const timeStr = record.bestTime !== null ? this.formatTime(record.bestTime) : '--';

        return `${movesStr} / ${timeStr}`;
    },

    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * 清除所有记录
     */
    clearAllRecords() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    /**
     * 自定义关卡存储键名
     */
    CUSTOM_LEVELS_KEY: 'huarongdao_custom_levels',

    /**
     * 获取所有自定义关卡
     * @returns {Array} 自定义关卡数组
     */
    getCustomLevels() {
        try {
            const levels = localStorage.getItem(this.CUSTOM_LEVELS_KEY);
            if (!levels) {
                return [];
            }
            const parsed = JSON.parse(levels);
            // 确保返回的是数组
            if (!Array.isArray(parsed)) {
                console.warn('自定义关卡数据格式错误，已重置');
                localStorage.removeItem(this.CUSTOM_LEVELS_KEY);
                return [];
            }
            return parsed;
        } catch (e) {
            console.error('读取自定义关卡失败:', e);
            localStorage.removeItem(this.CUSTOM_LEVELS_KEY);
            return [];
        }
    },

    /**
     * 保存/更新自定义关卡
     * @param {string} id - 关卡ID
     * @param {Object} config - 关卡配置
     * @returns {boolean} 是否保存成功
     */
    saveCustomLevel(id, config) {
        const levels = this.getCustomLevels();
        const existingIndex = levels.findIndex(level => level.id === id);

        const levelData = {
            id: id,
            name: config.name || '未命名关卡',
            description: config.description || '用户自定义',
            pieces: config.pieces || [],
            createdAt: config.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        if (existingIndex >= 0) {
            levels[existingIndex] = levelData;
        } else {
            levels.push(levelData);
        }

        localStorage.setItem(this.CUSTOM_LEVELS_KEY, JSON.stringify(levels));
        return true;
    },

    /**
     * 删除指定自定义关卡
     * @param {string} id - 关卡ID
     * @returns {boolean} 是否删除成功
     */
    deleteCustomLevel(id) {
        const levels = this.getCustomLevels();
        const filteredLevels = levels.filter(level => level.id !== id);

        if (filteredLevels.length === levels.length) {
            return false;
        }

        localStorage.setItem(this.CUSTOM_LEVELS_KEY, JSON.stringify(filteredLevels));
        return true;
    },

    /**
     * 清除所有自定义关卡
     * @returns {boolean} 是否清除成功
     */
    clearCustomLevels() {
        localStorage.removeItem(this.CUSTOM_LEVELS_KEY);
        return true;
    },

    /**
     * 获取自定义关卡的记录
     * @param {string} id - 关卡ID
     * @returns {Object} 该关卡的记录
     */
    getCustomRecord(id) {
        const records = this.getRecords();
        const key = `custom_${id}`;
        return records[key] || { bestMoves: null, bestTime: null };
    },

    /**
     * 更新自定义关卡记录（如果更好）
     * @param {string} id - 关卡ID
     * @param {number} moves - 步数
     * @param {number} time - 时间（秒）
     * @returns {boolean} 是否更新了记录
     */
    updateCustomRecord(id, moves, time) {
        const records = this.getRecords();
        const key = `custom_${id}`;
        const current = records[key] || { bestMoves: null, bestTime: null };

        let updated = false;

        if (current.bestMoves === null || moves < current.bestMoves) {
            current.bestMoves = moves;
            updated = true;
        }

        if (current.bestTime === null || time < current.bestTime) {
            current.bestTime = time;
            updated = true;
        }

        if (updated) {
            records[key] = current;
            this.saveRecords(records);
        }

        return updated;
    }
};
