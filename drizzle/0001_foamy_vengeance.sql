CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`auth_provider` text DEFAULT 'chatgpt' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`new_target` integer DEFAULT 20 NOT NULL,
	`review_target` integer DEFAULT 25 NOT NULL,
	`reminder_time` text DEFAULT '20:30' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_word_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`word_id` integer NOT NULL,
	`status` text DEFAULT 'unlearned' NOT NULL,
	`proficiency` text,
	`first_learned_at` text,
	`last_reviewed_at` text,
	`next_review_at` text,
	`review_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`word_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_word_progress_unique` ON `user_word_progress` (`user_id`,`word_id`);--> statement-breakpoint
CREATE INDEX `user_word_progress_review_idx` ON `user_word_progress` (`user_id`,`next_review_at`,`proficiency`);--> statement-breakpoint
DROP INDEX `daily_tasks_date_unique`;--> statement-breakpoint
ALTER TABLE `daily_tasks` ADD `user_id` text DEFAULT 'legacy_owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `daily_tasks` ADD `origin` text DEFAULT 'generated' NOT NULL;--> statement-breakpoint
ALTER TABLE `daily_tasks` ADD `label` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `daily_tasks_user_date_unique` ON `daily_tasks` (`user_id`,`task_date`);--> statement-breakpoint
CREATE INDEX `daily_tasks_user_idx` ON `daily_tasks` (`user_id`,`task_date`);--> statement-breakpoint
ALTER TABLE `highlights` ADD `user_id` text DEFAULT 'legacy_owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `import_logs` ADD `user_id` text DEFAULT 'legacy_owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `review_records` ADD `user_id` text DEFAULT 'legacy_owner' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `corpus_day` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `corpus_index` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `corpus_unit` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `theme` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `memory_hook` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `vocabulary_words` ADD `exam_marker` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `writing_collections` ADD `user_id` text DEFAULT 'legacy_owner' NOT NULL;