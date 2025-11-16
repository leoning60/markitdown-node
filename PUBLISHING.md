# 发布指南 (Publishing Guide)

本文档说明如何将 `markitdown-node` 发布到 npm 和 GitHub。

## 📋 前置准备

### 1. npm 账号设置

1. 如果没有 npm 账号，请先注册：https://www.npmjs.com/signup
2. 登录 npm：
```bash
npm login
```

3. 验证登录状态：
```bash
npm whoami
```

### 2. GitHub Token 设置（用于自动发布）

在 GitHub 仓库设置中添加 Secrets：
1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加 `NPM_TOKEN`：
   - 在 npm 网站生成 Access Token：https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - 选择 "Automation" 类型
   - 将 token 添加到 GitHub Secrets

## 🚀 发布流程

### 方式一：使用 release 脚本（推荐）

项目已配置 `release` 脚本，会自动完成版本号更新、构建、提交、打标签和发布。

```bash
cd markitdown-node
pnpm run release
```

这个命令会：
1. ✅ 运行类型检查 (`preversion` hook)
2. ✅ 构建项目 (`preversion` hook)
3. ✅ 使用 `bumpp` 交互式选择版本号（patch/minor/major）
4. ✅ 自动更新 `package.json` 版本号
5. ✅ 提交更改并推送到 GitHub
6. ✅ 创建 git tag
7. ✅ 发布到 npm

**注意**：`bumpp` 会提示你选择版本号类型：
- `patch` (1.5.0 → 1.5.1) - 小修复
- `minor` (1.5.0 → 1.6.0) - 新功能
- `major` (1.5.0 → 2.0.0) - 重大变更

### 方式二：手动发布

如果需要更多控制，可以分步执行：

#### 1. 更新版本号

```bash
# 方式 A: 使用 bumpp（推荐）
npx bumpp

# 方式 B: 手动编辑 package.json
# 修改 version 字段，例如：1.5.0 → 1.5.1
```

#### 2. 构建项目

```bash
pnpm run rebuild
```

#### 3. 检查发布内容（可选）

```bash
pnpm run publish:dry-run
```

这会显示将要发布到 npm 的文件列表，不会实际发布。

#### 4. 提交更改

```bash
git add .
git commit -m "chore: release v1.5.1"
git push
```

#### 5. 创建 Git Tag

```bash
git tag v1.5.1
git push origin v1.5.1
```

或者一次性推送代码和标签：
```bash
git push && git push --tags
```

#### 6. 发布到 npm

```bash
pnpm publish
```

## 🔄 GitHub Actions 自动发布

项目已配置 GitHub Actions workflows，当推送包含版本号的 tag 时会自动：

1. **CI Workflow** (`.github/workflows/ci.yml`): 
   - 在 push 和 PR 时运行
   - 执行构建和类型检查

2. **Release Workflow** (`.github/workflows/release.yml`):
   - 当推送 `v*` 格式的 tag 时触发（例如：`v1.5.1`）
   - 自动构建并发布到 npm
   - 创建 GitHub Release

### 触发自动发布

```bash
# 1. 更新版本号并创建 tag
cd markitdown-node
pnpm run release

# 或者手动创建 tag
git tag v1.5.1
git push origin v1.5.1
```

推送 tag 后，GitHub Actions 会自动：
- ✅ 构建项目
- ✅ 发布到 npm（需要配置 NPM_TOKEN）
- ✅ 创建 GitHub Release

## 📦 发布检查清单

发布前请确认：

- [ ] 代码已通过所有测试
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新（如果有）
- [ ] README.md 是最新的
- [ ] 构建成功 (`pnpm run build`)
- [ ] 类型检查通过 (`pnpm run typecheck`)
- [ ] 已运行 `publish:dry-run` 检查发布内容
- [ ] npm 账号已登录
- [ ] GitHub token 已配置（如果使用自动发布）

## 🔍 验证发布

### 检查 npm 发布

```bash
# 查看包信息
npm view markitdown-node

# 查看特定版本
npm view markitdown-node@1.5.1

# 查看所有版本
npm view markitdown-node versions

# 安装测试
npm install markitdown-node@latest
```

### 检查 GitHub Release

访问：https://github.com/leoning60/markitdown-node/releases

## 🛠️ 故障排除

### npm 发布失败

1. **认证错误**：
```bash
npm login
# 重新登录
```

2. **版本已存在**：
```bash
# 检查当前版本
npm view markitdown-node version

# 更新到新版本
npx bumpp
```

3. **权限错误**：
- 确认你是包的 owner
- 检查 npm 账号权限

### GitHub Actions 失败

1. **NPM_TOKEN 未设置**：
   - 检查 GitHub Secrets 中是否有 `NPM_TOKEN`
   - 确认 token 有效且有发布权限

2. **构建失败**：
   - 检查本地构建是否成功：`pnpm run build`
   - 查看 GitHub Actions 日志

3. **Tag 未触发 workflow**：
   - 确认 tag 格式为 `v*`（例如：`v1.5.1`）
   - 检查 workflow 文件中的触发条件

## 📝 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号** (major): 不兼容的 API 修改
- **次版本号** (minor): 向下兼容的功能性新增
- **修订号** (patch): 向下兼容的问题修正

示例：
- `1.5.0` → `1.5.1` (patch: bug fix)
- `1.5.0` → `1.6.0` (minor: new feature)
- `1.5.0` → `2.0.0` (major: breaking change)

## 🔗 Git 命令说明

### `git push`
推送当前分支的提交到远程仓库（通常是 `origin`）。

### `git push --tags`
推送所有本地标签（tags）到远程仓库。标签用于标记版本号（如 `v1.5.1`）。

### `git push && git push --tags`
先推送代码提交，成功后再推送标签。确保两者都同步到远程仓库。

### 查看远程仓库
```bash
# 查看所有远程仓库
git remote -v

# 查看当前分支的上游分支
git branch -vv
```

## 📚 相关链接

- npm 文档: https://docs.npmjs.com/
- GitHub Actions: https://docs.github.com/en/actions
- Semantic Versioning: https://semver.org/
- bumpp: https://github.com/antfu/bumpp
- 项目仓库: https://github.com/leoning60/markitdown-node

## 📝 发布历史

查看 `CHANGELOG.md` 了解详细的版本变更历史。

