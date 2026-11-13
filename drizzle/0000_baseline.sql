CREATE TABLE `announcements` (
	`id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`published` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(64) NOT NULL DEFAULT '',
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`handled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` char(36) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`postal` varchar(32) NOT NULL,
	`city` varchar(128) NOT NULL,
	`phone` varchar(64) NOT NULL,
	`phone_tel` varchar(64) NOT NULL,
	`email` varchar(255) NOT NULL,
	`zorgmail` varchar(255),
	`maps_query` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `news_posts` (
	`id` char(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`image_url` varchar(512),
	`image_alt` varchar(255),
	`published` boolean NOT NULL DEFAULT true,
	`published_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `opening_exceptions` (
	`id` char(36) NOT NULL,
	`location_id` char(36),
	`date` date NOT NULL,
	`opens` time,
	`closes` time,
	`is_closed` boolean NOT NULL DEFAULT false,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `opening_exceptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opening_hours` (
	`id` char(36) NOT NULL,
	`location_id` char(36) NOT NULL,
	`weekday` int NOT NULL,
	`opens` time,
	`closes` time,
	`is_closed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `opening_hours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` char(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`image_url` varchar(512),
	`image_alt` varchar(255),
	`href` varchar(512),
	`sort_order` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`id` char(36) NOT NULL,
	`page` varchar(64) NOT NULL,
	`block_key` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`image_url` varchar(512),
	`image_alt` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `site_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` char(36) NOT NULL,
	`role` varchar(64) NOT NULL,
	CONSTRAINT `user_roles_user_id_role_pk` PRIMARY KEY(`user_id`,`role`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `opening_exceptions` ADD CONSTRAINT `opening_exceptions_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opening_hours` ADD CONSTRAINT `opening_hours_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;