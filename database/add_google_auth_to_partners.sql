-- ============================================================================
-- Migration: Add Google OAuth columns to partners table
-- Compatible with Hostinger phpMyAdmin / MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- ============================================================================

-- 1. Add google_id column if it doesn't already exist
ALTER TABLE `partners` 
ADD COLUMN IF NOT EXISTS `google_id` VARCHAR(255) NULL AFTER `last_login_at`;

-- 2. Add avatar_url column if it doesn't already exist
ALTER TABLE `partners` 
ADD COLUMN IF NOT EXISTS `avatar_url` TEXT NULL AFTER `google_id`;

-- 3. Add index on google_id for ultra-fast lookup
ALTER TABLE `partners`
ADD INDEX IF NOT EXISTS `idx_partners_google_id` (`google_id`);

-- Note for older MySQL 5.7 versions where 'IF NOT EXISTS' in ALTER TABLE isn't supported:
-- Run these individually:
-- ALTER TABLE `partners` ADD COLUMN `google_id` VARCHAR(255) NULL;
-- ALTER TABLE `partners` ADD COLUMN `avatar_url` TEXT NULL;
-- ALTER TABLE `partners` ADD INDEX `idx_partners_google_id` (`google_id`);
