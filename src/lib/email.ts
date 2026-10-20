import { prisma } from "./db";

export async function sendQuoteEmail(leadId: string, quoteData: {
  firstName: string;
  email: string;
  address: string;
  mulchType: string;
  yards: number;
  priceLow: number;
  priceHigh: number;
}) {
  const subject = `Your Mulch Quote for ${quoteData.address}`;
  const body = `Hi ${quoteData.firstName},

Thanks for getting a quote from Mulch Now! Here's what we put together for your property at ${quoteData.address}:

Material: ${quoteData.mulchType}
Estimated Volume: ${quoteData.yards} cubic yards
Price Range: $${quoteData.priceLow} – $${quoteData.priceHigh}

This includes professional blown-in installation — no wheelbarrows, no raking, no mess. Our blower trucks get mulch into beds faster and more evenly than hand-spreading ever could.

Want to lock in your spot? Reply to this email or call us at (772) 555-MULCH. We book up fast once the season starts.

— The Mulch Now Team
DiCillo Services | mulchnow.com`;

  await prisma.emailLog.create({
    data: {
      leadId,
      type: "quote_confirmation",
      subject,
      body,
    },
  });

  console.log(`[EMAIL] Quote confirmation sent to ${quoteData.email}`);
  return { success: true, subject, body };
}

export async function sendStatusEmail(leadId: string, status: string, leadData: {
  firstName: string;
  email: string;
  address: string;
}) {
  const templates: Record<string, { subject: string; body: string }> = {
    scheduled: {
      subject: `Your mulch job is scheduled — ${leadData.address}`,
      body: `Hi ${leadData.firstName},\n\nGreat news — your mulch installation at ${leadData.address} is on the schedule. We'll reach out a day before with your time window.\n\nIf anything changes on your end, just let us know.\n\n— The Mulch Now Team`,
    },
    completed: {
      subject: `Job complete at ${leadData.address} — how does it look?`,
      body: `Hi ${leadData.firstName},\n\nOur crew just wrapped up at ${leadData.address}. Your beds are looking sharp.\n\nIf you notice anything that needs a touch-up, let us know within 48 hours and we'll send the truck back out — no charge.\n\nThanks for choosing Mulch Now.\n\n— The Mulch Now Team`,
    },
    "follow-up": {
      subject: `Time for a mulch refresh? — ${leadData.address}`,
      body: `Hi ${leadData.firstName},\n\nIt's been a while since we mulched ${leadData.address}. Your beds might be due for a refresh — most properties look best with a new layer every 12–18 months.\n\nWant a quick re-quote? Just reply and we'll pull up your property.\n\n— The Mulch Now Team`,
    },
  };

  const template = templates[status];
  if (!template) return { success: false };

  await prisma.emailLog.create({
    data: {
      leadId,
      type: `status_${status}`,
      subject: template.subject,
      body: template.body,
    },
  });

  console.log(`[EMAIL] Status update (${status}) sent to ${leadData.email}`);
  return { success: true, ...template };
}
