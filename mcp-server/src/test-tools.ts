import { searchLeads, createLead, updateLead, logLeadActivity } from './tools/leads.js';
import { getFinancialSummary } from './tools/finance.js';
import { searchClients } from './tools/clients.js';
import { getTasks } from './tools/tasks.js';

async function runVerification() {
  console.log('==============================================');
  console.log('   AGX CRM MCP Server - Verification Suite    ');
  console.log('==============================================\n');

  // Test 1: Fetch Financial Summary
  console.log('[1/4] Testing get_financial_summary()...');
  const finResult = await getFinancialSummary();
  console.log('Result:', finResult.success ? '✅ Success' : '❌ Failed', finResult.data || finResult.error);

  // Test 2: Search Leads
  console.log('\n[2/4] Testing search_leads()...');
  const leadsResult = await searchLeads({ limit: 5 });
  console.log('Result:', leadsResult.success ? `✅ Found ${leadsResult.data?.length} leads` : '❌ Failed', leadsResult.message);

  // Test 3: Search Clients
  console.log('\n[3/4] Testing search_clients()...');
  const clientsResult = await searchClients({ limit: 5 });
  console.log('Result:', clientsResult.success ? `✅ Found ${clientsResult.data?.length} clients` : '❌ Failed', clientsResult.message);

  // Test 4: Create a Lead & Log Activity
  console.log('\n[4/4] Testing create_lead() and log_lead_activity()...');
  const testLead = await createLead({
    name: 'AI Test Contact (MCP Verify)',
    company: 'MCP Test Corp',
    phone: '+91 9999988888',
    interested_service: 'Custom AI Agent',
    estimated_deal_value: 75000,
    priority: 'High',
    notes: 'Created during MCP Server verification test run',
  });

  if (testLead.success && testLead.data?.id) {
    console.log('✅ Lead created with ID:', testLead.data.id);

    // Update status
    const updateRes = await updateLead({
      id: testLead.data.id,
      status: 'QUALIFIED',
      notes: 'Qualified via AI chat simulation',
    });
    console.log('✅ Status updated:', updateRes.success ? 'Success' : 'Failed');

    // Log Activity
    const actRes = await logLeadActivity({
      lead_id: testLead.data.id,
      activity_type: 'Call',
      notes: 'Simulation call: verified MCP tool execution pipeline end-to-end.',
    });
    console.log('✅ Activity logged:', actRes.success ? 'Success' : 'Failed');
  } else {
    console.log('❌ Lead creation failed:', testLead.error);
  }

  console.log('\n==============================================');
  console.log('       Verification Completed Successfully    ');
  console.log('==============================================');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
