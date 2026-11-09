CREATE TABLE `progress` (
	`user_id` text NOT NULL,
	`record_key` text NOT NULL,
	`payload` text NOT NULL,
	PRIMARY KEY(`user_id`, `record_key`)
);
