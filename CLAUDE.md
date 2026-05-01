# 冷知识星球 - Claude Code 配置

## 项目概述

冷知识星球是一款面向碎片化学习场景的微信小程序，以图文卡片的形式向用户推送涵盖生活、大自然、科学、数学、历史等多个类目的小知识。

## 开发规范

### Git 提交规范

提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(card): 实现卡片上下滑动切换功能

- 添加手势识别
- 实现切换动画
- 添加预加载机制

Closes #123
```

### 分支规范

- `main`: 主分支，稳定版本
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支
- `release/*`: 发布分支

## 文档管理

### 核心文档

| 文档 | 路径 | 说明 |
|------|------|------|
| README.md | ./README.md | 项目说明 |
| TASK.md | ./docs/TASK.md | 开发任务清单 |
| DEVLOG.md | ./docs/DEVLOG.md | 开发日志 |
| PRD | ./docs/冷知识星球-软件需求规格说明-v1.0.md | 需求文档 |
| 设计规范 | ./docs/冷知识星球-用户交互设计规范.md | 设计规范 |

### 文档更新规则

1. **开发任务更新**
   - 开始新任务时：将 `[ ]` 更新为 `[~]`
   - 完成任务时：将 `[~]` 更新为 `[x]`
   - 任务阻塞时：将 `[~]` 更新为 `[!]`

2. **开发日志更新**
   - 每次功能提交后，更新 `docs/DEVLOG.md`
   - 记录完成任务、技术实现、相关文件
   - 版本发布时更新版本历史

3. **Git 提交前检查**
   - 自动检查任务状态是否更新
   - 自动检查开发日志是否记录
   - 自动检查文档一致性

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.3.5 | 构建工具 |
| Tailwind CSS | 4.1.12 | 样式框架 |
| React Router | 7.13.0 | 路由管理 |
| Radix UI | - | 无样式组件库 |
| MUI | 7.3.5 | Material Design 组件 |
| Framer Motion | 12.x | 动画库 |

## 开发流程

### 1. 开始新任务

```bash
# 1. 更新任务状态
# 编辑 docs/TASK.md，将任务标记为开发中
# - [~] 2.2.1 实现上下滑动手势识别

# 2. 创建功能分支
git checkout -b feature/card-swipe

# 3. 开始开发
```

### 2. 完成任务

```bash
# 1. 更新任务状态
# 编辑 docs/TASK.md，将任务标记为已完成
# - [x] 2.2.1 实现上下滑动手势识别

# 2. 更新开发日志
# 编辑 docs/DEVLOG.md，添加开发记录

# 3. 提交代码
git add .
git commit -m "feat(card): 实现卡片上下滑动切换功能"

# 4. 合并到开发分支
git checkout develop
git merge feature/card-swipe
```

### 3. 版本发布

```bash
# 1. 更新版本号
# 编辑 package.json，更新版本号

# 2. 更新开发日志
# 编辑 docs/DEVLOG.md，更新版本历史

# 3. 创建发布分支
git checkout -b release/v0.1.0

# 4. 合并到主分支
git checkout main
git merge release/v0.1.0
git tag v0.1.0
```

## 检查规则

### Git 提交前自动检查

当执行 `git commit` 时，Claude Code 会自动检查：

1. **开发任务检查**
   - 检查提交涉及的任务是否已更新状态
   - 检查提交信息是否关联任务编号

2. **开发日志检查**
   - 检查功能提交是否已添加开发日志
   - 检查版本发布是否已更新版本历史

3. **文档一致性检查**
   - 检查任务与日志是否对应
   - 检查版本号是否一致

### 检查配置

检查规则配置文件：`.commit-check.config.json`

```json
{
  "enabled": true,
  "strictMode": false,
  "skipTypes": ["chore", "style", "test"],
  "requireTaskId": true,
  "autoUpdateLog": false
}
```

## 注意事项

1. **任务状态必须及时更新**
   - 开始任务时标记为 `[~]`
   - 完成任务时标记为 `[x]`
   - 避免任务状态与实际进度不符

2. **开发日志必须完整记录**
   - 记录完成任务
   - 记录技术实现
   - 记录相关文件

3. **提交信息必须规范**
   - 使用正确的 type 类型
   - 关联任务编号
   - 描述清晰简洁

4. **版本号必须一致**
   - package.json 版本号
   - DEVLOG.md 版本记录
   - Git tag 版本号

---

*此配置由 Claude Code 自动读取，确保开发规范的执行。*
