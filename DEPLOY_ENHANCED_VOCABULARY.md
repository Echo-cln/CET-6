# 溯·辞最终增强版：一次部署说明

本包已经包含：1800 词增强 JSON、可恢复的导入脚本、网页字段展示和质量报告。导入不会删除账号、熟练度、每日任务、收藏或学习记录。

## 1. 先导入数据

1. 在 Supabase 项目打开 **SQL Editor**，粘贴并运行 `supabase/001_enhanced_vocabulary_schema.sql`。
2. 在项目根目录创建 `.env.local`（不要上传 GitHub）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
SUPABASE_SECRET_KEY=你的 Supabase Secret Key
```

3. 执行：

```powershell
npm install
node scripts/import-enhanced-lexicon.mjs
```

控制台出现“完成：1800 词词库已增强”即表示数据已写入。若网络中断，直接再次运行；词条按唯一键更新，不会产生重复词。

## 2. 再发布网页

```powershell
git add .
git commit -m "Release enhanced CET-6 vocabulary corpus"
git push origin main
```

EdgeOne Pages 中只部署显示该新提交号的一次记录。部署成功后强制刷新网页（Windows：`Ctrl + F5`）。

## 3. 验收四个点

- 任意词卡在单词下方同时有“英 /…/”和“美 /…/”，两个小喇叭分别朗读；
- 含义列按 `n.`、`v.`、`adj.` 等逐条显示，不再只显示“核心含义”；
- 每条必记搭配都有中文；
- 例句显示“真题原句 + 年份/套卷”或“原创六级风格例句”，两者都有中文翻译；词卡底部有相近词辨析。

## 数据边界

真题原句仅来自本包配套的 2016–2026 真题资料；没有命中的词明确标为“原创六级风格例句”，不会冒充真题。发音按钮使用浏览器的本地英音/美音语音，不请求 Oxford 或任何运行时词典服务。
