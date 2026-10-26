
# 溯·辞（SuCi Vocabulary）
<p align="center">
  
  <strong>面向大学英语六级学习者的词汇学习与复习应用</strong><br>
  通过词义、搭配、例句和个人复习记录，帮助你把单词放回真实语境中学习。
</p>

<p align="center">
  <a href="https://github.com/Echo-cln/CET-6">GitHub</a> ·
  <a href="https://su-ci-vocabulary.vercel.app">在线体验</a> ·
  <a href="https://github.com/Echo-cln/CET-6/issues">问题反馈</a>
</p>

## 项目导航

- [项目简介](#项目简介)
- [功能](#功能)
- [技术栈](#技术栈)
- [本地开发](#本地开发)
- [部署](#部署)
- [项目结构](#项目结构)
- [数据与隐私](#数据与隐私)
- [开源与贡献](#开源与贡献)
- [许可证](#许可证)

## 项目简介

“溯·辞”是一款英语六级词汇学习网站。它围绕词汇的多重释义、常见搭配、例句和学习状态组织内容，并提供每日学习、复习与历史记录。项目名称中的“溯”指追溯词义与用法，“辞”指语言表达。

本仓库是开源代码项目。线上服务可能依赖托管平台、数据库、第三方词典 API 和环境变量；克隆仓库不代表获得这些服务的凭证或数据。

## 功能

- 六级核心词汇库与词汇搜索。
- 每日新词和复习任务。
- 词汇熟练度与学习进度记录。
- 多义项、搭配、例句与英美音标展示。
- 收藏词汇与重点表达。
- 按日期查看学习历史。
- 使用 Supabase 持久化用户与学习数据。

具体可用内容和在线部署状态以当前应用为准。

## 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- Supabase（Auth / Database）

## 本地开发

### 环境要求

- Node.js（建议使用当前 LTS 版本）
- npm
- Supabase 项目及其本地开发配置

### 安装与启动

```bash
git clone https://github.com/Echo-cln/CET-6.git
cd CET-6
npm install
npm run dev
```

打开终端提示的本地地址（通常为 `http://localhost:3000`）。

### 环境变量

在项目根目录创建 `.env.local`，根据代码中使用的变量及 Supabase 项目配置填写：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

不要把真实密钥提交到 Git。仅可在浏览器端使用受 Row Level Security 保护的公开 anon/publishable key；具有管理权限的 service-role key 只能放在服务端环境中。部署相关的可选 API 凭据请以代码中的环境变量读取位置为准。

## 部署

项目采用 Next.js，可部署到支持 Next.js 的托管平台。配置生产环境变量后再构建：

```bash
npm run build
npm run start
```

线上体验地址为 [su-ci-vocabulary.vercel.app](https://su-ci-vocabulary.vercel.app)；部署、域名和数据库状态可能变化，请以实际服务为准。

## 项目结构

主要目录以仓库当前实现为准：

- `app/`：页面与路由（若该分支使用 App Router）。
- `src/`：可复用组件、工具与业务逻辑（若存在）。
- `public/`：静态资源。
- `supabase/`：数据库迁移或 Supabase 配置（若存在）。

## 数据与隐私

学习记录和账户信息可能存储在配置的 Supabase 实例中。词典或例句服务可能把查询词发送给对应第三方服务。部署者应检查 Supabase RLS 策略、API 路由权限和第三方服务条款，再开放给其他用户使用。

## 开源与贡献

欢迎提交 Issue 反馈缺陷或建议，也欢迎通过 Pull Request 参与改进。请在 Issue 中提供复现步骤、预期行为、实际行为和必要的脱敏截图。不要提交 API 密钥、账户数据或个人学习记录。

## 许可证

请查看仓库根目录中的许可证文件。若仓库未附许可证，默认版权法仍然适用；请先联系项目维护者确认再复制、分发或用于商业用途。
