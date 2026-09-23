import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';

/**
 * Get high-level business financial metrics
 */
export async function getFinancialSummary(): Promise<ToolResult> {
  try {
    const [invoicesRes, clientsRes, expensesRes, leadsRes] = await Promise.all([
      supabase.from('invoices').select('id, total, paid_amount, status'),
      supabase.from('clients').select('id, total_value, total_paid, outstanding_amount'),
      supabase.from('expenses').select('id, amount, status'),
      supabase.from('leads').select('id, estimated_deal_value, status'),
    ]);

    const invoices = invoicesRes.data || [];
    const clients = clientsRes.data || [];
    const expenses = expensesRes.data || [];
    const leads = leadsRes.data || [];

    const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);
    const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);
    const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

    const totalExpenses = expenses
      .filter((exp) => exp.status === 'Approved')
      .reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);

    const pipelineValue = leads
      .filter((l) => ['QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION'].includes(l.status))
      .reduce((acc, l) => acc + (Number(l.estimated_deal_value) || 0), 0);

    const summary = {
      total_invoiced: totalInvoiced,
      total_collected: totalCollected,
      total_outstanding: totalOutstanding,
      overdue_invoices_count: overdueCount,
      total_expenses: totalExpenses,
      net_margin: totalCollected - totalExpenses,
      active_pipeline_value: pipelineValue,
      active_clients_count: clients.length,
    };

    return formatSuccess('Financial summary calculated', summary);
  } catch (err) {
    return formatError('Unexpected error calculating financial summary', err);
  }
}

/**
 * List invoices with filters
 */
export async function listInvoices(params: {
  status?: string;
  client_name?: string;
  limit?: number;
}): Promise<ToolResult> {
  try {
    let query = supabase.from('invoices').select('*').order('due_date', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.client_name) {
      query = query.ilike('client_name', `%${params.client_name}%`);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;
    if (error) return formatError('Failed to list invoices', error);

    return formatSuccess(`Found ${data?.length || 0} invoices`, data);
  } catch (err) {
    return formatError('Unexpected error listing invoices', err);
  }
}

/**
 * Record a payment received from a client for an invoice
 */
export async function recordPayment(params: {
  invoice_number?: string;
  invoice_id?: string;
  amount: number;
  payment_method?: 'Bank Transfer' | 'UPI' | 'Stripe' | 'PayPal' | 'Wire';
  transaction_id?: string;
  notes?: string;
}): Promise<ToolResult> {
  try {
    let invoiceId = params.invoice_id;

    if (!invoiceId && params.invoice_number) {
      const { data: inv } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_number', params.invoice_number)
        .limit(1)
        .single();
      if (inv) invoiceId = inv.id;
    }

    if (!invoiceId) {
      return formatError('Invoice not found. Please provide invoice_number or invoice_id.');
    }

    const { data: currentInv } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
    if (!currentInv) return formatError('Invoice record not found.');

    const newPaidAmount = (Number(currentInv.paid_amount) || 0) + Number(params.amount);
    const newStatus = newPaidAmount >= Number(currentInv.total) ? 'Paid' : 'Partially Paid';

    // Insert payment record
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert([
        {
          invoice_id: invoiceId,
          client_id: currentInv.client_id,
          project_id: currentInv.project_id,
          amount: params.amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: params.payment_method || 'Bank Transfer',
          transaction_id: params.transaction_id || null,
          status: 'Paid',
          notes: params.notes || 'Recorded via AI Assistant',
        },
      ])
      .select()
      .single();

    if (payErr) return formatError('Failed to insert payment record', payErr);

    // Update invoice status
    await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq('id', invoiceId);

    // If linked to client, update client total_paid
    if (currentInv.client_id) {
      const { data: client } = await supabase.from('clients').select('*').eq('id', currentInv.client_id).single();
      if (client) {
        const clientPaid = (Number(client.total_paid) || 0) + Number(params.amount);
        const outstanding = Math.max(0, (Number(client.total_value) || 0) - clientPaid);
        await supabase
          .from('clients')
          .update({
            total_paid: clientPaid,
            outstanding_amount: outstanding,
          })
          .eq('id', currentInv.client_id);
      }
    }

    return formatSuccess(
      `Payment of ₹${params.amount} recorded for Invoice ${currentInv.invoice_number}. New status: ${newStatus}`,
      payment
    );
  } catch (err) {
    return formatError('Unexpected error recording payment', err);
  }
}
