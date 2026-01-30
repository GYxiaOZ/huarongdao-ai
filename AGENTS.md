# AGENTS.md - 华容道项目代理指南

这是一个使用原生 JavaScript 开发的华容道拼图游戏，没有构建系统。

## 构建命令

未配置构建系统。这是一个静态 HTML/JS 应用程序。

### 开发
- 直接在浏览器中打开 `index.html`
- 或使用本地服务器：`python -m http.server 8000` 或 `npx serve`

### 测试
未配置测试框架。如需添加测试，可以考虑：
- Jest 用于单元测试
- Playwright/Cypress 用于端到端测试

### 代码检查
未配置代码检查工具。推荐工具：
- ESLint 用于 JavaScript 代码检查
- Prettier 用于代码格式化

## 代码风格指南

### JavaScript

#### 导入和依赖
- 无模块系统 - 所有脚本通过 `index.html` 中的 `<script>` 标签加载
- 加载顺序：`storage.js` → `levels.js` → `game.js` → `main.js`
- 无外部依赖 - 仅使用原生 JavaScript

#### 命名约定
- **类**：PascalCase（如 `Game`）
- **函数/方法**：camelCase（如 `handleMouseDown`、`getPieceAt`）
- **常量**：UPPER_SNAKE_CASE（如 `PIECE_TYPES`、`LEVELS`）
- **变量**：camelCase（如 `game`、`pieces`、`dragState`）
- **私有方法**：如需要，使用下划线前缀（如 `_animateMove`）
- **事件处理器**：使用描述性名称（如 `handleMouseDown`、`handleMouseMove`）

#### 格式化
- 使用 4 个空格缩进
- 使用分号
- 使用双引号表示字符串
- 回调函数使用箭头函数
- 使用模板字面量进行字符串插值

#### 类型和类型安全
- 无 TypeScript - 使用 JSDoc 注释提供类型提示
- 始终记录参数和返回值：
  ```javascript
  /**
   * @param {number} level - 关卡号 (1-3)
   * @returns {Object} 关卡配置的深拷贝
   */
  function getLevelConfig(level) { ... }
  ```

#### 错误处理
- localStorage 操作使用 try-catch
- 在函数边界验证输入
- 无效操作返回 null（如不存在的关卡）
- 无错误日志系统 - 使用 console.error 进行调试

#### 注释
- 在整个代码库中使用中文注释
- 为所有函数和类添加 JSDoc 风格的注释
- 为复杂逻辑添加内联注释
- 使用标题块注释代码段：
  ```javascript
  /**
   * 游戏状态管理模块
   * 负责游戏的核心逻辑、状态管理和渲染
   */
  ```

### 架构

#### 模块结构
- **main.js**：入口点，事件绑定，初始化
- **game.js**：Game 类 - 核心逻辑，状态管理，渲染
- **levels.js**：关卡配置，常量
- **storage.js**：localStorage 包装器，用于最佳记录

#### 类设计
- 使用 ES6 类语法
- 构造函数应初始化所有属性
- 保持方法单一职责
- 在类方法中一致使用 `this`

#### 状态管理
- 游戏状态集中在 Game 类中
- 使用深拷贝处理关卡配置：`JSON.parse(JSON.stringify(obj))`
- 状态更新应通过 `updateUI()` 和 `render()` 触发 UI 更新

### Canvas 和渲染

#### Canvas 指南
- 使用 2D 上下文进行渲染
- 每帧清除并重绘整个画布
- 使用 `requestAnimationFrame` 进行动画
- 处理鼠标和触摸事件
- 使用坐标转换实现响应式设计

#### 动画
- 使用 easeOutQuad 实现平滑动画
- 棋子移动动画时长：150ms
- 使用 `isAnimating` 标志跟踪动画状态

### 事件处理

#### 事件监听器
- 在 `bindEvents()` 函数中绑定事件
- 对所有交互使用 `addEventListener`
- 阻止触摸事件的默认行为
- 处理鼠标和触摸事件以支持移动端

#### 拖放
- 在 `dragState` 对象中跟踪拖拽状态
- 使用阈值（30px）区分点击和拖拽
- 拖拽期间提供视觉反馈
- 优雅处理鼠标离开/触摸结束

### HTML/CSS

#### HTML 结构
- 使用语义化 HTML5 元素
- 中文文本内容
- 使用媒体查询实现响应式设计
- 使用 data 属性存储元数据（如 `data-level="1"`）

#### CSS 指南
- 使用类 BEM 命名规范（如 `.difficulty-btn`、`.stat-item`）
- 使用 CSS 变量定义颜色和间距
- 移动优先的响应式设计
- 使用 flexbox 进行布局
- 为交互元素添加悬停和激活状态

### 最佳实践

#### 性能
- 批量更新 DOM
- 使用 canvas 进行游戏渲染（而非 DOM 操作）
- 适当缓存 DOM 查询
- 避免不必要的重渲染

#### 可访问性
- 使用语义化 HTML
- 尽可能添加键盘支持
- 确保足够的颜色对比度
- 为视觉元素提供文本替代

#### 移动端支持
- 触摸事件处理
- 游戏交互期间阻止页面滚动
- 响应式 canvas 尺寸
- 适当的触摸目标（最小 44x44px）

## 常见模式

### 创建新关卡
1. 在 `levels.js` 的 `LEVELS` 对象中添加关卡配置
2. 定义棋子，包含：`id`、`type`、`x`、`y`、`width`、`height`、`color`、`name`
3. 添加包含移动序列的解法数组
4. 设置关卡的 `minMoves`

### 添加游戏功能
- 在 Game 类构造函数中添加状态
- 更新 `reset()` 以初始化新状态
- 在 `render()` 方法中添加渲染逻辑
- 在 `updateUI()` 方法中更新 UI
- 在 `bindEvents()` 函数中绑定事件

### 存储操作
- 使用 `Storage` 对象进行所有 localStorage 操作
- 胜利后调用 `Storage.updateRecord(level, moves, time)`
- 使用 `Storage.formatRecord(record)` 显示记录
