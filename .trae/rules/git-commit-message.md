# Git Commit 提交信息规范

## 格式要求

```
<类型>(<范围>): <主题>

[可选的正文]

[可选的页脚]
```

## 类型标识

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(knowledge): 新增知识库分类搜索功能` |
| `fix` | 缺陷修复 | `fix(auth): 修复登录超时验证问题` |
| `docs` | 文档更新 | `docs(api): 更新用户管理接口文档` |
| `style` | 代码格式 | `style(dashboard): 调整仪表盘布局间距` |
| `refactor` | 代码重构 | `refactor(user): 重构用户权限验证逻辑` |
| `perf` | 性能优化 | `perf(query): 优化知识库查询性能` |
| `test` | 测试相关 | `test(auth): 添加用户登录单元测试` |
| `build` | 构建相关 | `build(deps): 升级 NestJS 到 v10` |
| `ci` | CI 配置 | `ci: 配置 GitHub Actions 自动化流程` |
| `chore` | 其他更改 | `chore: 更新项目依赖版本` |

## 范围标识

使用小写字母标识影响模块：

- `auth` - 认证授权模块
- `user` - 用户管理模块
- `knowledge` - 知识库模块
- `category` - 分类管理模块
- `import` - 导入功能模块
- `export` - 导出功能模块
- `ai` - AI 功能模块
- `log` - 日志模块
- `config` - 配置模块
- `upload` - 上传功能模块
- `dashboard` - 仪表盘模块
- `ui` - 用户界面相关
- `api` - API 接口相关
- `db` - 数据库相关
- `server` - 服务端通用
- `manage` - 管理后台通用

## 主题规则

1. **语言要求**
   - 主题必须使用**中文**描述
   - 首字母小写（符合 conventional commits 国际规范）
   - 不使用句号结尾

2. **长度限制**
   - 主题不超过 50 个字符
   - 正文中每行不超过 80 个字符

3. **编写原则**
   - 使用祈使语气："添加"而不是"已添加"
   - 使用一般现在时："修复"而不是"修复了"
   - 描述做了什么，而不是结果

## 提交示例

### 功能提交

```
feat(knowledge): 新增知识库批量导入功能

- 支持 Excel 文件批量导入知识条目
- 添加导入进度实时显示
- 实现导入错误回滚机制

关闭 #TASK-2.1.3
```

### 修复提交

```
fix(auth): 修复 Token 刷新竞态条件问题

- 添加分布式锁防止并发刷新
- 优化 Token 过期时间逻辑
- 补充异常情况处理

相关issue: #ISSUE-456
```

### 重构提交

```
refactor(user): 重构用户权限验证架构

- 采用策略模式替代多层 if-else
- 提取公共权限校验基类
- 优化权限缓存机制
```

### 文档提交

```
docs(api): 更新知识库查询接口文档

- 补充请求参数说明
- 添加响应示例
- 完善错误码说明
```

### 测试提交

```
test(correction): 补充纠错功能集成测试

- 添加端到端测试用例
- 覆盖异常输入场景
- 补充边界条件测试
```

## 分支规范

### 分支命名

```
<类型>/<描述>

示例：
- feature/user-authentication
- fix/token-refresh-issue
- refactor/permission-check
- docs/api-upgrade-guide
```

### 常见场景

1. **功能开发**
   ```
   git checkout -b feature/knowledge-recommendation
   git commit -m "feat(knowledge): 新增个性化推荐算法"
   ```

2. **问题修复**
   ```
   git checkout -b fix/login-timeout
   git commit -m "fix(auth): 修复登录超时验证失败问题"
   ```

3. **文档更新**
   ```
   git checkout -b docs/api-v2-upgrade
   git commit -m "docs: 更新 API v2 接口文档"
   ```

## 版本标签

### 标签格式

```
v<主版本>.<次版本>.<补丁版本>

示例：v1.2.3
```

### 打标签流程

```bash
# 1. 更新版本号（确保与 package.json 一致）
# 2. 创建标签
git tag -a v1.2.3 -m "v1.2.3 - 新增知识库推荐功能"

# 3. 推送标签
git push origin v1.2.3
```

## 提交检查清单

- [ ] 提交类型是否符合规范
- [ ] 影响范围是否正确标注
- [ ] 主题描述是否使用中文
- [ ] 主题是否符合祈使语气
- [ ] 是否包含任务关联（如有）
- [ ] 提交信息是否清晰简洁

## 工具配置

### commitlint 配置

项目已配置 `.commit-check.config.json`，提交信息会自动检查：

```json
{
  "enabled": true,
  "strictMode": false,
  "skipTypes": ["chore", "style", "test"],
  "requireTaskId": true,
  "autoUpdateLog": false
}
```

### Git Hooks

项目已配置 pre-commit hook，会自动检查提交信息格式。
