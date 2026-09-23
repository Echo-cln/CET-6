/*
 * Safe, resumable importer for data/vocabulary-1800-enhanced.json.
 * It updates lexicon content only; users, learning progress and daily tasks
 * are never deleted or reset.
 */
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const secret = process.env.SUPABASE_SECRET_KEY;
if (!baseUrl || !secret) throw new Error("请设置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SECRET_KEY 后再运行。");
const data = JSON.parse(fs.readFileSync(path.resolve("data/vocabulary-1800-enhanced.json"), "utf8"));
const headers = { apikey: secret, authorization: `Bearer ${secret}`, "content-type": "application/json" };
const request = async (endpoint, options = {}) => {
  const response = await fetch(`${baseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${endpoint}: ${response.status} ${body}`);
  }

  return body ? JSON.parse(body) : [];
};
const chunk = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
const quoteIn = (items) => `in.(${items.map((item) => encodeURIComponent(item)).join(",")})`;

for (const [index, batch] of chunk(data, 40).entries()) {
  const words = batch.map((item) => ({
  lemma: item.word,
  phonetic_uk: item.phoneticUK,
  phonetic_us: item.phoneticUS,
}));
  await request("vocabulary_words?on_conflict=normalized_lemma", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(words) });
  const rows = await request(`vocabulary_words?select=id,normalized_lemma&normalized_lemma=${quoteIn(batch.map((item) => item.word))}`);
  const ids = new Map(rows.map((row) => [row.normalized_lemma, row.id]));
  const senses = batch.flatMap((item) => item.meanings.map((meaning, senseNo) => ({ word_id: ids.get(item.word), sense_no: senseNo + 1, part_of_speech: meaning.pos, core_meaning: meaning.meaning, difficulty: item.difficulty, note: "完整释义：ECDICT" })));
  await request("vocabulary_senses?on_conflict=word_id,sense_no", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(senses) });
  const savedSenses = await request(`vocabulary_senses?select=id,word_id,sense_no&word_id=${quoteIn([...ids.values()])}`);
  const firstSense = new Map(savedSenses.filter((row) => row.sense_no === 1).map((row) => [row.word_id, row.id]));
  const senseIds = [...firstSense.values()];
  if (senseIds.length) {
    await request(`word_collocations?sense_id=${quoteIn(senseIds)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    await request(`vocabulary_examples?sense_id=${quoteIn(senseIds)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  }
  const collocations = batch.flatMap((item) => item.collocations.map((c, rank) => ({ sense_id: firstSense.get(ids.get(item.word)), content: c.phrase, translation: c.translation, rank: rank + 1, source_type: "dictionary", source_label: "1800 六级词增强包" })));
  if (collocations.length) await request("word_collocations", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(collocations) });
  const examples = batch.map((item) => ({ sense_id: firstSense.get(ids.get(item.word)), sentence: item.example.sentence, translation: item.example.translation, source_type: item.example.type === "真题原句" ? "exam" : "mnemonic", source_label: item.example.source, verified: item.example.type === "真题原句", rank: 1 }));
  await request("vocabulary_examples", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(examples) });
  const comparisons = batch.map((item) => ({ word_id: ids.get(item.word), similar_words: item.comparison.similarWords, distinction: item.comparison.distinction, contrast_example: item.comparison.contrastExample, updated_at: new Date().toISOString() }));
  await request("word_comparisons?on_conflict=word_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(comparisons) });
  console.log(`已导入 ${Math.min((index + 1) * 40, data.length)}/${data.length}`);
}
console.log("完成：1800 词词库已增强；用户学习记录未被改动。");
