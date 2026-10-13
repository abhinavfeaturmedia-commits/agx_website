-- ============================================================================
-- AGX CRM & Business Operating System Database Seed Data
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+ (Hostinger Compatible)
-- Currency: Indian Rupees (₹)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Profiles (Team Members & Administrators)
INSERT INTO `profiles` (`id`, `email`, `full_name`, `role`, `avatar_url`, `department`, `is_active`, `permissions`) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@agxperience.com', 'Abhinav (Founder & Super Admin)', 'Super Admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Leadership', 1, '{"leads":{"view":true,"create":true,"edit":true,"delete":true,"export":true},"clients":{"view":true,"create":true,"edit":true,"delete":true,"export":true},"projects":{"view":true,"create":true,"edit":true,"delete":true,"export":true},"finances":{"view":true,"create":true,"edit":true,"delete":true,"export":true},"vault":{"view":true,"create":true,"edit":true,"delete":true,"reveal":true},"team":{"view":true,"manage":true},"settings":{"view":true,"manage":true}}'),
('00000000-0000-0000-0000-000000000002', 'taylor@agxperience.com', 'Taylor Vance', 'Sales Manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Sales & Growth', 1, '{"leads":{"view":true,"create":true,"edit":true,"delete":false,"export":true},"clients":{"view":true,"create":true,"edit":true,"delete":false,"export":false},"projects":{"view":true,"create":false,"edit":false,"delete":false,"export":false}}'),
('00000000-0000-0000-0000-000000000003', 'michael@agxperience.com', 'Michael Andrew', 'Project Manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Engineering', 1, '{"projects":{"view":true,"create":true,"edit":true,"delete":false,"export":true},"tasks":{"view":true,"create":true,"edit":true,"delete":true,"export":true}}'),
('00000000-0000-0000-0000-000000000004', 'natalia@agxperience.com', 'Natalia Varnan', 'Developer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'AI Architecture', 1, '{"projects":{"view":true,"create":false,"edit":false,"delete":false,"export":false},"tasks":{"view":true,"create":true,"edit":true,"delete":false,"export":false}}'),
('00000000-0000-0000-0000-000000000005', 'robert@agxperience.com', 'Robert Sterling', 'Accountant', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Finance', 1, '{"finances":{"view":true,"create":true,"edit":true,"delete":false,"export":true}}')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 2. Initial Sample Leads
INSERT INTO `leads` (`id`, `name`, `company`, `phone`, `email`, `whatsapp`, `location`, `interested_service`, `estimated_deal_value`, `probability`, `source`, `assigned_to`, `priority`, `status`, `notes`) VALUES
('10000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'Apex Logistics Inc.', '+1 (555) 382-9012', 'sjenkins@apexlogistics.io', '+15553829012', 'Chicago, USA', 'AI Customer Support & Dispatch Automation', 12500.00, 80, 'Website', 'Taylor Vance', 'High', 'NEGOTIATION', 'Needs webhook integration with TMS and WhatsApp alert triggers for fleet drivers.'),
('10000000-0000-0000-0000-000000000002', 'Marcus Sterling', 'Vanguard FinTech Group', '+44 20 7946 0912', 'm.sterling@vanguardft.co.uk', '+442079460912', 'London, UK', 'Automated Loan Underwriting Agent', 24000.00, 60, 'LinkedIn', 'Taylor Vance', 'Urgent', 'PROPOSAL SENT', 'Sent enterprise SLA draft and security architecture diagram.'),
('10000000-0000-0000-0000-000000000003', 'Vikram Patel', 'Zenith Retail Chains', '+91 98201 44521', 'vpatel@zenithretail.in', '+919820144521', 'Mumbai, India', 'Multi-Store Inventory AI Copilot', 15000.00, 20, 'Direct Outreach', 'Taylor Vance', 'Medium', 'NEW', 'Initial discovery call requested via Calendly.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Initial Sample Clients
INSERT INTO `clients` (`id`, `name`, `company`, `phone`, `email`, `website`, `address`, `industry`, `gst_tax_id`, `account_manager`, `total_value`, `total_paid`, `outstanding_amount`, `source`, `notes`, `status`) VALUES
('20000000-0000-0000-0000-000000000001', 'Karan Mehta', 'Shrawello Systems', '+91 98450 12345', 'karan@shrawello.com', 'https://shrawello.com', 'Bengaluru, Karnataka, India', 'Enterprise E-Commerce', '29ABCDE1234F1Z5', 'Abhinav', 250000.00, 150000.00, 100000.00, 'Direct Referral', 'Long-term enterprise partner for AI automated search and voice agents.', 'Active'),
('20000000-0000-0000-0000-000000000002', 'Liam O''Connor', 'Aether Capital', '+1 (212) 555-0199', 'liam@aethercap.com', 'https://aethercap.com', 'New York, NY, USA', 'Venture Capital & Private Equity', 'US-EIN-9923841', 'Taylor Vance', 180000.00, 110000.00, 70000.00, 'LinkedIn Inbound', 'Monthly retainer for automated deal screening AI pipeline.', 'Active'),
('20000000-0000-0000-0000-000000000003', 'Rohan Deshmukh', 'Zomira Retail Hub', '+91 98201 44882', 'rohan@zomiraretail.com', 'https://zomiraretail.com', 'Mumbai, Maharashtra, India', 'Omnichannel Retail & E-Commerce', '27AABCZ1234F1Z8', 'Michael Andrew', 750000.00, 350000.00, 400000.00, 'Referral', 'Retail brand scaling automated WhatsApp support & multi-lingual product advisory voice agent.', 'Active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Initial Sample Projects
INSERT INTO `projects` (`id`, `name`, `client_id`, `client_name`, `service_type`, `project_manager`, `assigned_team`, `start_date`, `due_date`, `project_value`, `received_amount`, `pending_amount`, `status`, `priority`, `progress`, `description`, `portal_token`, `portal_enabled`) VALUES
('30000000-0000-0000-0000-000000000001', 'AI Voice Agent & Support Pipeline', '20000000-0000-0000-0000-000000000001', 'Shrawello Systems', 'Custom AI Agent', 'Michael Andrew', '["Natalia Varnan", "Abhinav"]', '2026-08-01', '2026-09-15', 250000.00, 150000.00, 100000.00, 'IN PROGRESS', 'High', 65, 'Deploying ultra-low latency voicebot using LiveKit WebRTC and ElevenLabs with LangChain tool calling.', 'prj_sec_shrawello_8f9a2b', 1),
('30000000-0000-0000-0000-000000000002', 'OmniChannel WhatsApp & Voice AI Bot', '20000000-0000-0000-0000-000000000003', 'Zomira Retail Hub', 'Custom AI Agent', 'Michael Andrew', '["Natalia Varnan", "Abhinav"]', '2026-08-01', '2026-10-15', 750000.00, 350000.00, 400000.00, 'IN PROGRESS', 'Urgent', 55, 'High-concurrency WhatsApp bot with automated catalog lookup, order tracking, and voice note transcription.', 'prj_sec_zomira_9a4f1c', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- End of Seed Data
-- ============================================================================
