ALTER TABLE `announcements` ADD `visible_until` date;--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `handled_at` timestamp;--> statement-breakpoint
ALTER TABLE `news_posts` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `session_version` int DEFAULT 1 NOT NULL;