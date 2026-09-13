CREATE TABLE `findings` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`source_label` text NOT NULL,
	`confidence` text NOT NULL,
	`metric` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_findings_project_created` ON `findings` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`sector` text NOT NULL,
	`region` text NOT NULL,
	`icp` text NOT NULL,
	`question` text NOT NULL,
	`score` integer DEFAULT 50 NOT NULL,
	`demand` integer DEFAULT 50 NOT NULL,
	`saturation` integer DEFAULT 50 NOT NULL,
	`readiness` integer DEFAULT 50 NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_projects_owner_updated` ON `projects` (`owner_id`,`updated_at`);