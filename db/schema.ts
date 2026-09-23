import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const vocabularyWords = sqliteTable(
  "vocabulary_words",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    word: text("word").notNull(),
    phonetic: text("phonetic").notNull().default(""),
    partOfSpeech: text("part_of_speech").notNull().default(""),
    coreMeaning: text("core_meaning").notNull(),
    collocations: text("collocations").notNull().default("[]"),
    example: text("example").notNull().default(""),
    exampleTranslation: text("example_translation").notNull().default(""),
    exampleType: text("example_type").notNull().default("六级语境助记句"),
    source: text("source").notNull().default(""),
    status: text("status").notNull().default("unlearned"),
    proficiency: text("proficiency"),
    firstLearnedAt: text("first_learned_at"),
    lastReviewedAt: text("last_reviewed_at"),
    nextReviewAt: text("next_review_at"),
    reviewCount: integer("review_count").notNull().default(0),
    corpusDay: integer("corpus_day").notNull().default(0),
    corpusIndex: integer("corpus_index").notNull().default(0),
    corpusUnit: text("corpus_unit").notNull().default(""),
    theme: text("theme").notNull().default(""),
    memoryHook: text("memory_hook").notNull().default(""),
    examMarker: text("exam_marker").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("vocabulary_words_word_unique").on(table.word),
    index("vocabulary_words_review_idx").on(
      table.nextReviewAt,
      table.proficiency,
    ),
  ],
);

export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  authProvider: text("auth_provider").notNull().default("chatgpt"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userWordProgress = sqliteTable(
  "user_word_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => vocabularyWords.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("unlearned"),
    proficiency: text("proficiency"),
    firstLearnedAt: text("first_learned_at"),
    lastReviewedAt: text("last_reviewed_at"),
    nextReviewAt: text("next_review_at"),
    reviewCount: integer("review_count").notNull().default(0),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("user_word_progress_unique").on(table.userId, table.wordId),
    index("user_word_progress_review_idx").on(
      table.userId,
      table.nextReviewAt,
      table.proficiency,
    ),
  ],
);

export const vocabularyExamples = sqliteTable("vocabulary_examples", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  wordId: integer("word_id")
    .notNull()
    .references(() => vocabularyWords.id, { onDelete: "cascade" }),
  sentence: text("sentence").notNull(),
  translation: text("translation").notNull().default(""),
  exampleType: text("example_type").notNull().default("六级语境助记句"),
  source: text("source").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const dailyTasks = sqliteTable(
  "daily_tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().default("legacy_owner"),
    taskDate: text("task_date").notNull(),
    newTarget: integer("new_target").notNull().default(20),
    reviewTarget: integer("review_target").notNull().default(25),
    origin: text("origin").notNull().default("generated"),
    label: text("label").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("daily_tasks_user_date_unique").on(
      table.userId,
      table.taskDate,
    ),
    index("daily_tasks_user_idx").on(table.userId, table.taskDate),
  ],
);

export const dailyTaskItems = sqliteTable(
  "daily_task_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    taskId: integer("task_id")
      .notNull()
      .references(() => dailyTasks.id, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => vocabularyWords.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    proficiency: text("proficiency"),
    completedAt: text("completed_at"),
  },
  (table) => [
    uniqueIndex("daily_task_item_unique").on(
      table.taskId,
      table.wordId,
      table.itemType,
    ),
  ],
);

export const reviewRecords = sqliteTable("review_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("legacy_owner"),
  wordId: integer("word_id")
    .notNull()
    .references(() => vocabularyWords.id, { onDelete: "cascade" }),
  taskDate: text("task_date").notNull(),
  proficiency: text("proficiency").notNull(),
  reviewedAt: text("reviewed_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const highlights = sqliteTable("highlights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("legacy_owner"),
  wordId: integer("word_id").references(() => vocabularyWords.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  color: text("color").notNull().default("#FCCEB4"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const writingCollections = sqliteTable("writing_collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("legacy_owner"),
  wordId: integer("word_id").references(() => vocabularyWords.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  translation: text("translation").notNull().default(""),
  expressionType: text("expression_type").notNull().default("句型"),
  topic: text("topic").notNull().default("通用"),
  replaceableParts: text("replaceable_parts").notNull().default(""),
  source: text("source").notNull().default("用户收藏"),
  note: text("note").notNull().default(""),
  proficiency: text("proficiency").notNull().default("unfamiliar"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const writingCollectionTags = sqliteTable(
  "writing_collection_tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => writingCollections.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => [
    uniqueIndex("writing_tag_unique").on(table.collectionId, table.tag),
  ],
);

export const writingPracticeRecords = sqliteTable("writing_practice_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  collectionId: integer("collection_id")
    .notNull()
    .references(() => writingCollections.id, { onDelete: "cascade" }),
  practiceText: text("practice_text").notNull(),
  proficiency: text("proficiency"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const importLogs = sqliteTable("import_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("legacy_owner"),
  importDate: text("import_date").notNull(),
  receivedCount: integer("received_count").notNull().default(0),
  insertedCount: integer("inserted_count").notNull().default(0),
  duplicateCount: integer("duplicate_count").notNull().default(0),
  status: text("status").notNull(),
  message: text("message").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  newTarget: integer("new_target").notNull().default(20),
  reviewTarget: integer("review_target").notNull().default(25),
  reminderTime: text("reminder_time").notNull().default("20:30"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  newTarget: integer("new_target").notNull().default(20),
  reviewTarget: integer("review_target").notNull().default(25),
  reminderTime: text("reminder_time").notNull().default("20:30"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
