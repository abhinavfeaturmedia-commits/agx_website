-- ============================================================================
-- AGX CRM & Business Operating System Database Schema
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+ (Hostinger Compatible)
-- Character Set: utf8mb4 (Full Emoji & Multilingual Support)
-- Storage Engine: InnoDB (Full ACID & Foreign Key Constraint Support)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ----------------------------------------------------------------------------
-- 1. Profiles / Team Members Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(64) NOT NULL DEFAULT 'Developer',
    `avatar_url` TEXT NULL,
    `phone` VARCHAR(64) NULL,
    `department` VARCHAR(128) NULL,
    `password_hash` TEXT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `permissions` JSON NULL,
    `last_active_at` DATETIME NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_profiles_email` (`email`),
    KEY `idx_profiles_role` (`role`),
    KEY `idx_profiles_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Leads Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `leads`;
CREATE TABLE `leads` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NULL,
    `phone` VARCHAR(64) NULL,
    `email` VARCHAR(255) NULL,
    `whatsapp` VARCHAR(64) NULL,
    `location` VARCHAR(255) NULL,
    `interested_service` VARCHAR(255) NOT NULL DEFAULT 'AI Automation',
    `estimated_deal_value` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `probability` INT NOT NULL DEFAULT 50,
    `source` VARCHAR(128) NULL DEFAULT 'Website',
    `assigned_to` VARCHAR(255) NULL,
    `priority` VARCHAR(32) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(64) NOT NULL DEFAULT 'NEW',
    `next_follow_up` DATETIME NULL,
    `last_contacted` DATETIME NULL,
    `notes` TEXT NULL,
    `loss_reason` TEXT NULL,
    `partner_id` VARCHAR(36) NULL,
    `partner_name` VARCHAR(255) NULL,
    `partner_code` VARCHAR(64) NULL,
    `converted_client_id` VARCHAR(36) NULL,
    `converted_project_id` VARCHAR(36) NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_leads_status` (`status`),
    KEY `idx_leads_assigned` (`assigned_to`),
    KEY `idx_leads_deleted` (`deleted_at`),
    KEY `idx_leads_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Lead Activities Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `lead_activities`;
CREATE TABLE `lead_activities` (
    `id` VARCHAR(36) NOT NULL,
    `lead_id` VARCHAR(36) NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `activity_type` VARCHAR(64) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_lead_activities_lead` (`lead_id`),
    CONSTRAINT `fk_lead_activities_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Clients Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(64) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `industry` VARCHAR(128) NULL,
    `gst_tax_id` VARCHAR(64) NULL,
    `account_manager` VARCHAR(255) NULL,
    `partner_id` VARCHAR(36) NULL,
    `partner_name` VARCHAR(255) NULL,
    `partner_code` VARCHAR(64) NULL,
    `total_value` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `total_paid` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `outstanding_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `source` VARCHAR(128) NULL DEFAULT 'Inbound',
    `notes` TEXT NULL,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Active',
    `portal_enabled` TINYINT(1) NOT NULL DEFAULT 1,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_clients_status` (`status`),
    KEY `idx_clients_deleted` (`deleted_at`),
    KEY `idx_clients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Projects Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `client_id` VARCHAR(36) NULL,
    `client_name` VARCHAR(255) NULL,
    `service_type` VARCHAR(128) NOT NULL,
    `project_manager` VARCHAR(255) NULL,
    `assigned_team` JSON NULL,
    `start_date` DATE NULL,
    `due_date` DATE NULL,
    `delivery_date` DATE NULL,
    `project_value` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `received_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `pending_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(64) NOT NULL DEFAULT 'PLANNING',
    `priority` VARCHAR(32) NOT NULL DEFAULT 'Medium',
    `progress` INT NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `portal_token` VARCHAR(128) NULL,
    `client_portal_token` VARCHAR(128) NULL,
    `portal_enabled` TINYINT(1) NOT NULL DEFAULT 1,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_projects_client` (`client_id`),
    KEY `idx_projects_status` (`status`),
    KEY `idx_projects_token` (`portal_token`),
    KEY `idx_projects_deleted` (`deleted_at`),
    CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Invoices Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_number` VARCHAR(64) NOT NULL,
    `client_id` VARCHAR(36) NULL,
    `client_name` VARCHAR(255) NOT NULL,
    `project_id` VARCHAR(36) NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `items` JSON NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `is_gst` TINYINT(1) NOT NULL DEFAULT 1,
    `gst_type` VARCHAR(32) NOT NULL DEFAULT 'IGST',
    `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    `tax` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `cgst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `sgst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `igst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `client_gstin` VARCHAR(64) NULL,
    `hsn_sac_code` VARCHAR(64) NULL DEFAULT '998313',
    `total` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `paid_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Draft',
    `currency` VARCHAR(16) NOT NULL DEFAULT 'INR',
    `quotation_id` VARCHAR(36) NULL,
    `quotation_number` VARCHAR(64) NULL,
    `terms_conditions` TEXT NULL,
    `notes` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_invoices_number` (`invoice_number`),
    KEY `idx_invoices_client` (`client_id`),
    KEY `idx_invoices_project` (`project_id`),
    KEY `idx_invoices_status` (`status`),
    KEY `idx_invoices_deleted` (`deleted_at`),
    CONSTRAINT `fk_invoices_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_invoices_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Project Milestones Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `project_milestones`;
CREATE TABLE `project_milestones` (
    `id` VARCHAR(36) NOT NULL,
    `project_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `due_date` DATE NULL,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Pending',
    `progress` INT NOT NULL DEFAULT 0,
    `amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `order_index` INT NOT NULL DEFAULT 0,
    `invoice_id` VARCHAR(36) NULL,
    `is_invoiced` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_milestones_project` (`project_id`),
    KEY `idx_milestones_invoice` (`invoice_id`),
    CONSTRAINT `fk_milestones_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_milestones_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Tasks Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NULL,
    `lead_name` VARCHAR(255) NULL,
    `assigned_to` VARCHAR(255) NULL,
    `priority` VARCHAR(32) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(64) NOT NULL DEFAULT 'TO DO',
    `start_date` DATE NULL,
    `due_date` DATE NULL,
    `estimated_hours` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `actual_hours` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_tasks_project` (`project_id`),
    KEY `idx_tasks_client` (`client_id`),
    KEY `idx_tasks_assigned` (`assigned_to`),
    KEY `idx_tasks_status` (`status`),
    KEY `idx_tasks_deleted` (`deleted_at`),
    CONSTRAINT `fk_tasks_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_tasks_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Payments Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_id` VARCHAR(36) NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `payment_date` DATE NOT NULL,
    `payment_method` VARCHAR(64) NOT NULL DEFAULT 'Bank Transfer',
    `transaction_id` VARCHAR(128) NULL,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Paid',
    `notes` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_payments_invoice` (`invoice_id`),
    KEY `idx_payments_client` (`client_id`),
    KEY `idx_payments_project` (`project_id`),
    KEY `idx_payments_deleted` (`deleted_at`),
    CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_payments_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_payments_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Expenses Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
    `id` VARCHAR(36) NOT NULL,
    `category` VARCHAR(64) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `expense_date` DATE NOT NULL,
    `vendor` VARCHAR(255) NULL,
    `description` TEXT NOT NULL,
    `payment_method` VARCHAR(64) NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `approved_by` VARCHAR(255) NULL,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Approved',
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_expenses_category` (`category`),
    KEY `idx_expenses_date` (`expense_date`),
    KEY `idx_expenses_deleted` (`deleted_at`),
    CONSTRAINT `fk_expenses_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_expenses_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Agreements & Contracts Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `agreements`;
CREATE TABLE `agreements` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `agreement_type` VARCHAR(64) NOT NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NULL,
    `lead_name` VARCHAR(255) NULL,
    `start_date` DATE NULL,
    `expiry_date` DATE NULL,
    `commercial_value` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Draft',
    `signed_date` DATE NULL,
    `file_url` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_agreements_client` (`client_id`),
    KEY `idx_agreements_project` (`project_id`),
    KEY `idx_agreements_deleted` (`deleted_at`),
    CONSTRAINT `fk_agreements_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_agreements_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_agreements_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Documents Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `doc_type` VARCHAR(64) NOT NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `lead_id` VARCHAR(36) NULL,
    `lead_name` VARCHAR(255) NULL,
    `file_url` TEXT NOT NULL,
    `file_size` VARCHAR(64) NULL,
    `uploaded_by` VARCHAR(255) NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_documents_client` (`client_id`),
    KEY `idx_documents_project` (`project_id`),
    KEY `idx_documents_deleted` (`deleted_at`),
    CONSTRAINT `fk_documents_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_documents_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_documents_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Secure Credentials Vault Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `credentials_vault`;
CREATE TABLE `credentials_vault` (
    `id` VARCHAR(36) NOT NULL,
    `platform_name` VARCHAR(255) NOT NULL,
    `service_url` TEXT NULL,
    `username` VARCHAR(255) NULL,
    `password_encrypted` TEXT NULL,
    `api_key_encrypted` TEXT NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `notes` TEXT NULL,
    `access_roles` JSON NULL,
    `environment` VARCHAR(64) NOT NULL DEFAULT 'Production',
    `status` VARCHAR(64) NOT NULL DEFAULT 'Active',
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_credentials_client` (`client_id`),
    KEY `idx_credentials_project` (`project_id`),
    KEY `idx_credentials_deleted` (`deleted_at`),
    CONSTRAINT `fk_credentials_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_credentials_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. Calendar Events Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `event_type` VARCHAR(64) NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NULL,
    `location` VARCHAR(255) NULL,
    `participants` JSON NULL,
    `related_client_id` VARCHAR(36) NULL,
    `related_project_id` VARCHAR(36) NULL,
    `related_lead_id` VARCHAR(36) NULL,
    `related_lead_name` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_calendar_start` (`start_time`),
    KEY `idx_calendar_deleted` (`deleted_at`),
    CONSTRAINT `fk_calendar_client` FOREIGN KEY (`related_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_calendar_project` FOREIGN KEY (`related_project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_calendar_lead` FOREIGN KEY (`related_lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. Notifications Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `notification_type` VARCHAR(32) NOT NULL DEFAULT 'info',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `link` VARCHAR(255) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user` (`user_id`),
    KEY `idx_notifications_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. Audit Logs Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_role` VARCHAR(64) NOT NULL,
    `action_type` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` VARCHAR(128) NULL,
    `description` TEXT NOT NULL,
    `before_state` JSON NULL,
    `after_state` JSON NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_entity` (`entity_type`, `entity_id`),
    KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. Project Client Issues & QA Tickets Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `project_issues`;
CREATE TABLE `project_issues` (
    `id` VARCHAR(36) NOT NULL,
    `project_id` VARCHAR(36) NOT NULL,
    `project_name` VARCHAR(255) NULL,
    `client_id` VARCHAR(36) NULL,
    `client_name` VARCHAR(255) NULL,
    `ticket_number` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `issue_type` VARCHAR(64) NOT NULL DEFAULT 'Bug',
    `priority` VARCHAR(32) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(64) NOT NULL DEFAULT 'REPORTED',
    `reporter_name` VARCHAR(255) NOT NULL,
    `reporter_email` VARCHAR(255) NOT NULL,
    `reporter_phone` VARCHAR(64) NULL,
    `attachments` JSON NULL,
    `admin_notes` TEXT NULL,
    `resolution_notes` TEXT NULL,
    `assigned_to` VARCHAR(255) NULL,
    `resolved_at` DATETIME NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_issues_project` (`project_id`),
    KEY `idx_issues_status` (`status`),
    KEY `idx_issues_ticket` (`ticket_number`),
    KEY `idx_issues_deleted` (`deleted_at`),
    CONSTRAINT `fk_issues_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_issues_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. Partners Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NULL,
    `phone` VARCHAR(64) NULL,
    `password_hash` TEXT NULL,
    `referral_code` VARCHAR(64) NOT NULL,
    `commission_rate` DECIMAL(5, 4) NOT NULL DEFAULT 0.1000,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Active',
    `payout_method` VARCHAR(64) NOT NULL DEFAULT 'UPI',
    `payout_details` JSON NULL,
    `total_earnings` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `paid_earnings` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `pending_earnings` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `last_login_at` DATETIME NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_partners_email` (`email`),
    UNIQUE KEY `uk_partners_code` (`referral_code`),
    KEY `idx_partners_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. Partner Client Referrals Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `partner_referrals`;
CREATE TABLE `partner_referrals` (
    `id` VARCHAR(36) NOT NULL,
    `partner_id` VARCHAR(36) NOT NULL,
    `lead_id` VARCHAR(36) NULL,
    `client_id` VARCHAR(36) NULL,
    `project_id` VARCHAR(36) NULL,
    `client_name` VARCHAR(255) NOT NULL,
    `client_email` VARCHAR(255) NULL,
    `client_phone` VARCHAR(64) NULL,
    `company` VARCHAR(255) NULL,
    `project_type` VARCHAR(128) NOT NULL DEFAULT 'AI Automation',
    `deal_value` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `total_paid` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `pending_payment` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `deal_status` VARCHAR(64) NOT NULL DEFAULT 'NEW',
    `payment_status` VARCHAR(64) NOT NULL DEFAULT 'Pending',
    `commission_rate` DECIMAL(5, 4) NOT NULL DEFAULT 0.1000,
    `commission_earned` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `commission_paid` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_referrals_partner` (`partner_id`),
    KEY `idx_referrals_deleted` (`deleted_at`),
    CONSTRAINT `fk_referrals_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_referrals_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_referrals_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_referrals_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 20. Partner Payouts Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `partner_payouts`;
CREATE TABLE `partner_payouts` (
    `id` VARCHAR(36) NOT NULL,
    `partner_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `payout_date` DATE NOT NULL,
    `payment_method` VARCHAR(64) NOT NULL DEFAULT 'UPI',
    `transaction_ref` VARCHAR(128) NULL,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Completed',
    `notes` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_payouts_partner` (`partner_id`),
    KEY `idx_payouts_deleted` (`deleted_at`),
    CONSTRAINT `fk_payouts_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 21. Quotations & Commercial Proposals Table
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `quotations`;
CREATE TABLE `quotations` (
    `id` VARCHAR(36) NOT NULL,
    `quotation_number` VARCHAR(64) NOT NULL,
    `lead_id` VARCHAR(36) NULL,
    `lead_name` VARCHAR(255) NULL,
    `client_id` VARCHAR(36) NULL,
    `client_name` VARCHAR(255) NOT NULL,
    `project_id` VARCHAR(36) NULL,
    `project_name` VARCHAR(255) NULL,
    `issue_date` DATE NOT NULL,
    `valid_until` DATE NOT NULL,
    `items` JSON NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `is_gst` TINYINT(1) NOT NULL DEFAULT 1,
    `gst_type` VARCHAR(32) NOT NULL DEFAULT 'IGST',
    `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    `tax` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `cgst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `sgst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `igst` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(64) NOT NULL DEFAULT 'Draft',
    `currency` VARCHAR(16) NOT NULL DEFAULT 'INR',
    `converted_invoice_id` VARCHAR(36) NULL,
    `converted_at` DATETIME NULL,
    `client_gstin` VARCHAR(64) NULL,
    `hsn_sac_code` VARCHAR(64) NULL DEFAULT '998313',
    `notes` TEXT NULL,
    `terms_conditions` TEXT NULL,
    `deleted_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_quotations_number` (`quotation_number`),
    KEY `idx_quotations_lead` (`lead_id`),
    KEY `idx_quotations_client` (`client_id`),
    KEY `idx_quotations_project` (`project_id`),
    KEY `idx_quotations_status` (`status`),
    KEY `idx_quotations_deleted` (`deleted_at`),
    CONSTRAINT `fk_quotations_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_quotations_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_quotations_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of AGX CRM MySQL Schema
-- ============================================================================
