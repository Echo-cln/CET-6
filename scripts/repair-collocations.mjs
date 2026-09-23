/*
 * Rebuild required collocations from the enhanced lexicon without touching
 * users, progress, daily tasks, examples, or comparisons.
 */
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const secret = process.env.SUPABASE_SECRET_KEY;
if (!baseUrl || !secret) throw new Error("请设置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SECRET_KEY 后再运行。");

const inputPath = path.resolve("data/vocabulary-1800-enhanced.json");
if (!fs.existsSync(inputPath)) throw new Error(`找不到 ${inputPath}，请确认增强词库数据文件仍在 data 目录。`);
const lexicon = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const headers = { apikey: secret, authorization: `Bearer ${secret}`, "content-type": "application/json" };

async function request(endpoint, options = {}) {
  const response = await fetch(`${baseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`${endpoint}: ${response.status} ${body}`);
  return body ? JSON.parse(body) : [];
}
const chunk = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
const quoteIn = (items) => `in.(${items.map((item) => encodeURIComponent(String(item))).join(",")})`;

const missingCollocations = lexicon
  .filter((item) => !Array.isArray(item.collocations) || !item.collocations.some((entry) => String(entry?.phrase || "").trim() && String(entry?.translation || "").trim()))
  .map((item) => String(item.word));
if (missingCollocations.length) {
  throw new Error(`增强词库未达到 1800/1800 标准：缺少 ${missingCollocations.length} 个词的“英文搭配 + 中文含义”，例如：${missingCollocations.slice(0, 20).join(", ")}。已中止，数据库没有被修改。`);
}
const expected = lexicon.flatMap((item) => item.collocations);
if (lexicon.length !== 1800) throw new Error(`增强词库应为 1800 词，当前只有 ${lexicon.length} 词，已中止。`);

const wordIdByLemma = new Map();
for (const batch of chunk(lexicon, 120)) {
  const rows = await request(`vocabulary_words?select=id,normalized_lemma&normalized_lemma=${quoteIn(batch.map((item) => item.word))}`);
  rows.forEach((row) => wordIdByLemma.set(String(row.normalized_lemma).toLowerCase(), Number(row.id)));
}
const missingWords = lexicon.filter((item) => !wordIdByLemma.has(String(item.word).toLowerCase()));
if (missingWords.length) throw new Error(`有 ${missingWords.length} 个单词未导入 vocabulary_words，例如：${missingWords.slice(0, 5).map((item) => item.word).join(", ")}`);

const firstSenseByWord = new Map();
for (const ids of chunk([...wordIdByLemma.values()], 300)) {
  const rows = await request(`vocabulary_senses?select=id,word_id,sense_no&word_id=in.(${ids.join(",")})&order=sense_no`);
  rows.forEach((row) => {
    const wordId = Number(row.word_id);
    if (!firstSenseByWord.has(wordId) || Number(row.sense_no) < Number(firstSenseByWord.get(wordId).sense_no)) firstSenseByWord.set(wordId, row);
  });
}
const records = lexicon.flatMap((item) => {
  const wordId = wordIdByLemma.get(String(item.word).toLowerCase());
  const sense = firstSenseByWord.get(wordId);
  if (!sense) throw new Error(`单词 ${item.word} 缺少词义记录，不能修复搭配。`);
  return (item.collocations || []).map((entry, index) => ({
    sense_id: Number(sense.id),
    content: String(entry.phrase || "").trim(),
    translation: String(entry.translation || "").trim(),
    rank: index + 1,
    source_type: "dictionary",
    source_label: "1800 六级词增强包",
  })).filter((entry) => entry.content);
});
if (!records.length) throw new Error("没有形成可写入的搭配记录，已中止。");

const senseIds = [...new Set(records.map((row) => row.sense_id))];
for (const ids of chunk(senseIds, 250)) {
  await request(`word_collocations?sense_id=in.(${ids.join(",")})`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
}
for (const batch of chunk(records, 200)) {
  await request("word_collocations", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(batch) });
}

let verified = 0;
for (const ids of chunk(senseIds, 250)) {
  const rows = await request(`word_collocations?select=id&sense_id=in.(${ids.join(",")})`);
  verified += rows.length;
}
if (new Set(records.map((row) => row.sense_id)).size !== 1800) throw new Error("校验失败：并非每个词都形成了搭配记录。");
if (verified !== records.length) throw new Error(`校验失败：应写入 ${records.length} 条，实际读回 ${verified} 条。请不要刷新网站，先保留这段输出。`);
console.log(`完成：1800/1800 个单词均已写入必记搭配，共 ${verified} 条（英文短语 + 中文含义）。`);
