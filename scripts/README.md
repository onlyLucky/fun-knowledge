# 开发脚本

本目录包含项目开发过程中使用的各种脚本。

## 脚本列表

### setup-hooks.sh

**功能**: 安装 Git Hooks，配置提交前检查

**使用方法**:

```bash
# 进入项目根目录
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact

# 运行安装脚本
./scripts/setup-hooks.sh
```

**安装内容**:

- `pre-commit`: 提交前检查开发任务和日志

**检查内容**:

1. 开发任务状态是否更新
2. 开发日志是否已记录
3. 提交信息是否包含任务 ID
4. 版本号是否一致

**配置文件**:

- `.commit-check.config.json`: 检查规则配置
- `docs/TASK.md`: 开发任务清单
- `docs/DEVLOG.md`: 开发日志

---

## 开发流程

### 1. 安装 Git Hooks

```bash
./scripts/setup-hooks.sh
```

### 2. 开始新任务

```bash
# 1. 更新任务状态
# 编辑 docs/TASK.md，将任务标记为开发中
# - [~] 2.2.1 实现上下滑动手势识别

# 2. 创建功能分支
git checkout -b feature/card-swipe

# 3. 开始开发
```

### 3. 完成任务

```bash
# 1. 更新任务状态
# 编辑 docs/TASK.md，将任务标记为已完成
# - [x] 2.2.1 实现上下滑动手势识别

# 2. 更新开发日志
# 编辑 docs/DEVLOG.md，添加开发记录

# 3. 提交代码
git add .
git commit -m "feat(card): 实现卡片上下滑动切换功能 #2.2.1"

# 4. 合并到开发分支
git checkout develop
git merge feature/card-swipe
```

### 4. 版本发布

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

---

## 检查规则配置

配置文件: `.commit-check.config.json`

```json
{
  "enabled": true,
  "strictMode": false,
  "skipTypes": ["chore", "style", "test"],
  "requireTaskId": true,
  "autoUpdateLog": false
}
```

**配置说明**:

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enabled | boolean | true | 是否启用检查 |
| strictMode | boolean | false | 严格模式（所有提交必须关联任务） |
| skipTypes | array | [] | 跳过检查的提交类型 |
| requireTaskId | boolean | true | 是否要求提交信息包含任务 ID |
| autoUpdateLog | boolean | false | 是否自动更新开发日志 |

---

## 常见问题

### Q: 如何跳过检查？

A: 在非严格模式下，检查失败时会显示警告但允许提交。在严格模式下，必须完成所有检查才能提交。

### Q: 如何修改检查规则？

A: 编辑 `.commit-check.config.json` 文件，修改相应配置项。

### Q: 如何卸载 Git Hooks？

A: 删除 `.git/hooks/pre-commit` 文件即可。

### Q: 检查脚本报错怎么办？

A: 确保已安装 `jq` 工具：
- macOS: `brew install jq`
- Ubuntu: `sudo apt-get install jq`

---

## 相关文档

- [开发任务清单](../docs/TASK.md)
- [开发日志](../docs/DEVLOG.md)
- [软件需求规格说明](../docs/冷知识星球-软件需求规格说明-v1.0.md)
- [用户交互设计规范](../docs/冷知识星球-用户交互设计规范.md)

---

*此脚本由 Claude Code 自动生成，用于规范开发流程。*
