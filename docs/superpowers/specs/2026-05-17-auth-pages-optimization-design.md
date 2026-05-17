# Auth 页面结构优化设计文档

## 概述

优化 `app/src/app/pages/auth/` 目录下的页面结构，提取公共组件，修复导出问题，并使用文件夹隔离每个页面。

## 当前问题

1. **Field 组件重复**：`LoginPage.tsx` 和 `RegisterPage.tsx` 中有完全相同的 `Field` 组件
2. **SplashScreen 未导出**：`index.ts` 中没有导出 `SplashScreen`
3. **页面文件平铺**：所有页面文件都在同一目录下，缺乏组织

## 设计方案

### 1. 文件结构调整

**优化前：**
```
auth/
├── index.ts
├── LoginPage.tsx
├── RegisterPage.tsx
├── SplashScreen.tsx
└── WelcomePage.tsx
```

**优化后：**
```
auth/
├── index.ts
├── components/
│   └── Field.tsx
├── login/
│   └── LoginPage.tsx
├── register/
│   └── RegisterPage.tsx
├── splash/
│   └── SplashScreen.tsx
└── welcome/
    └── WelcomePage.tsx
```

### 2. 提取 Field 组件

**位置：** `auth/components/Field.tsx`

**组件接口：**
```typescript
interface FieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  right?: React.ReactNode;
}
```

**组件功能：**
- 支持标签显示
- 支持多种输入类型（text, tel, email, password, number）
- 支持错误状态显示
- 支持右侧自定义内容（如获取验证码按钮、密码显示/隐藏按钮）

### 3. 更新 index.ts 导出

**当前：**
```typescript
export { WelcomePage } from './WelcomePage';
export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
```

**优化后：**
```typescript
export { WelcomePage } from './welcome/WelcomePage';
export { LoginPage } from './login/LoginPage';
export { RegisterPage } from './register/RegisterPage';
export { SplashScreen } from './splash/SplashScreen';
```

### 4. 更新页面导入

**LoginPage.tsx 和 RegisterPage.tsx：**
- 导入路径从 `../../components/AppLogo` 改为 `../../../components/AppLogo`
- 导入 Field 组件从 `../components/Field`

## 实施步骤

### 步骤 1：创建目录结构
```bash
mkdir -p app/src/app/pages/auth/components
mkdir -p app/src/app/pages/auth/login
mkdir -p app/src/app/pages/auth/register
mkdir -p app/src/app/pages/auth/splash
mkdir -p app/src/app/pages/auth/welcome
```

### 步骤 2：提取 Field 组件
1. 从 `LoginPage.tsx` 复制 `Field` 组件代码
2. 创建 `auth/components/Field.tsx` 文件
3. 粘贴组件代码并导出

### 步骤 3：移动页面文件
1. 移动 `LoginPage.tsx` 到 `login/` 目录
2. 移动 `RegisterPage.tsx` 到 `register/` 目录
3. 移动 `SplashScreen.tsx` 到 `splash/` 目录
4. 移动 `WelcomePage.tsx` 到 `welcome/` 目录

### 步骤 4：更新导入路径
1. 更新 `LoginPage.tsx` 的导入路径
2. 更新 `RegisterPage.tsx` 的导入路径
3. 更新 `index.ts` 的导出路径

### 步骤 5：更新其他引用
检查项目中是否有其他文件引用了这些页面，更新导入路径。

## 预期收益

1. **代码复用**：Field 组件只需维护一份
2. **结构清晰**：每个页面有独立的目录，便于管理
3. **导出完整**：所有页面组件都能正确导出
4. **易于扩展**：未来添加新页面时，只需创建新目录

## 风险评估

- **风险等级**：低
- **主要风险**：导入路径错误可能导致编译失败
- **缓解措施**：仔细检查所有导入路径，确保相对路径正确

## 验证标准

1. 所有页面组件正常渲染
2. 表单功能正常（登录、注册）
3. 导航功能正常
4. 无 TypeScript 编译错误
5. 无运行时错误
