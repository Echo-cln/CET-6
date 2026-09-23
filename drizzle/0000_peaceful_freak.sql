CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`new_target` integer DEFAULT 20 NOT NULL,
	`review_target` integer DEFAULT 25 NOT NULL,
	`reminder_time` text DEFAULT '20:30' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_task_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	`item_type` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`proficiency` text,
	`completed_at` text,
	FOREIGN KEY (`task_id`) REFERENCES `daily_tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_task_item_unique` ON `daily_task_items` (`task_id`,`word_id`,`item_type`);--> statement-breakpoint
CREATE TABLE `daily_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_date` text NOT NULL,
	`new_target` integer DEFAULT 20 NOT NULL,
	`review_target` integer DEFAULT 25 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_tasks_date_unique` ON `daily_tasks` (`task_date`);--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word_id` integer,
	`content` text NOT NULL,
	`color` text DEFAULT '#FCCEB4' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `import_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`import_date` text NOT NULL,
	`received_count` integer DEFAULT 0 NOT NULL,
	`inserted_count` integer DEFAULT 0 NOT NULL,
	`duplicate_count` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word_id` integer NOT NULL,
	`task_date` text NOT NULL,
	`proficiency` text NOT NULL,
	`reviewed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vocabulary_examples` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word_id` integer NOT NULL,
	`sentence` text NOT NULL,
	`translation` text DEFAULT '' NOT NULL,
	`example_type` text DEFAULT '六级语境助记句' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vocabulary_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`phonetic` text DEFAULT '' NOT NULL,
	`part_of_speech` text DEFAULT '' NOT NULL,
	`core_meaning` text NOT NULL,
	`collocations` text DEFAULT '[]' NOT NULL,
	`example` text DEFAULT '' NOT NULL,
	`example_translation` text DEFAULT '' NOT NULL,
	`example_type` text DEFAULT '六级语境助记句' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'unlearned' NOT NULL,
	`proficiency` text,
	`first_learned_at` text,
	`last_reviewed_at` text,
	`next_review_at` text,
	`review_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocabulary_words_word_unique` ON `vocabulary_words` (`word`);--> statement-breakpoint
CREATE INDEX `vocabulary_words_review_idx` ON `vocabulary_words` (`next_review_at`,`proficiency`);--> statement-breakpoint
CREATE TABLE `writing_collection_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `writing_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `writing_tag_unique` ON `writing_collection_tags` (`collection_id`,`tag`);--> statement-breakpoint
CREATE TABLE `writing_collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word_id` integer,
	`content` text NOT NULL,
	`translation` text DEFAULT '' NOT NULL,
	`expression_type` text DEFAULT '句型' NOT NULL,
	`topic` text DEFAULT '通用' NOT NULL,
	`replaceable_parts` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '用户收藏' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`proficiency` text DEFAULT 'unfamiliar' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `writing_practice_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`practice_text` text NOT NULL,
	`proficiency` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `writing_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
