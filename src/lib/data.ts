import bcrypt from "bcryptjs";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  quotes: Quote[];
  emails: EmailLog[];
}

export interface Quote {
  id: string;
  leadId: string;
  address: string;
  totalSqFt: number;
  mulchType: string;
  depth: number;
  yardsNeeded: number;
  pricePerYard: number;
  totalPriceLow: number;
  totalPriceHigh: number;
  status: string;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  mulchType: string;
  pricePerYard: number;
  minDepth: number;
  maxDepth: number;
  market: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  leadId: string;
  type: string;
  subject: string;
  body: string;
  sentAt: string;
}

let nextId = 100;
function genId() {
  return `demo_${Date.now()}_${nextId++}`;
}

const ADMIN_HASH = bcrypt.hashSync("mulchnow2024", 10);

export const adminUser = {
  email: "admin@mulchnow.com",
  password: ADMIN_HASH,
  name: "DiCillo Services",
  role: "owner",
};

export const pricingRules: PricingRule[] = [
  { id: "pr1", name: "Premium Hardwood Mulch", mulchType: "hardwood", pricePerYard: 65, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 1, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr2", name: "Premium Hardwood Mulch", mulchType: "hardwood", pricePerYard: 55, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 2, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr3", name: "Pine Bark Mulch", mulchType: "pine-bark", pricePerYard: 58, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 3, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr4", name: "Pine Bark Mulch", mulchType: "pine-bark", pricePerYard: 48, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 4, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr5", name: "Red-Dyed Mulch", mulchType: "red-dyed", pricePerYard: 60, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 5, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr6", name: "Red-Dyed Mulch", mulchType: "red-dyed", pricePerYard: 50, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 6, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr7", name: "Black-Dyed Mulch", mulchType: "black-dyed", pricePerYard: 62, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 7, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr8", name: "Black-Dyed Mulch", mulchType: "black-dyed", pricePerYard: 52, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 8, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr9", name: "Playground Mulch", mulchType: "playground", pricePerYard: 70, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 9, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr10", name: "Playground Mulch", mulchType: "playground", pricePerYard: 60, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 10, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr11", name: "Premium Soil Blend", mulchType: "soil", pricePerYard: 55, minDepth: 2, maxDepth: 4, market: "south-florida", isActive: true, sortOrder: 11, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
  { id: "pr12", name: "Premium Soil Blend", mulchType: "soil", pricePerYard: 45, minDepth: 2, maxDepth: 4, market: "ohio", isActive: true, sortOrder: 12, createdAt: "2024-10-01T00:00:00Z", updatedAt: "2024-10-01T00:00:00Z" },
];

export const leads: Lead[] = [
  {
    id: "lead1", firstName: "Sarah", lastName: "Mitchell", email: "sarah.m@example.com", phone: "(772) 555-0142",
    address: "1420 Royal Palm Blvd", city: "Vero Beach", state: "FL", zip: "32960", status: "quoted", source: "website", notes: null,
    createdAt: "2024-10-15T10:30:00Z", updatedAt: "2024-10-15T10:30:00Z",
    quotes: [{ id: "q1", leadId: "lead1", address: "1420 Royal Palm Blvd", totalSqFt: 1800, mulchType: "hardwood", depth: 3, yardsNeeded: 16.7, pricePerYard: 65, totalPriceLow: 1086, totalPriceHigh: 1248, status: "pending", createdAt: "2024-10-15T10:30:00Z" }],
    emails: [{ id: "e1", leadId: "lead1", type: "quote_confirmation", subject: "Your Mulch Quote for 1420 Royal Palm Blvd", body: "Hi Sarah, thanks for getting a quote...", sentAt: "2024-10-15T10:31:00Z" }],
  },
  {
    id: "lead2", firstName: "James", lastName: "Rodriguez", email: "jrod@example.com", phone: "(561) 555-0198",
    address: "880 Ocean Drive", city: "Jupiter", state: "FL", zip: "33458", status: "scheduled", source: "website", notes: "Prefers morning install",
    createdAt: "2024-10-12T14:20:00Z", updatedAt: "2024-10-13T09:00:00Z",
    quotes: [{ id: "q2", leadId: "lead2", address: "880 Ocean Drive", totalSqFt: 2400, mulchType: "black-dyed", depth: 3, yardsNeeded: 22.3, pricePerYard: 62, totalPriceLow: 1383, totalPriceHigh: 1590, status: "accepted", createdAt: "2024-10-12T14:20:00Z" }],
    emails: [
      { id: "e2", leadId: "lead2", type: "quote_confirmation", subject: "Your Mulch Quote for 880 Ocean Drive", body: "Hi James, thanks for getting a quote...", sentAt: "2024-10-12T14:21:00Z" },
      { id: "e3", leadId: "lead2", type: "status_scheduled", subject: "Your mulch job is scheduled", body: "Hi James, great news — your mulch installation is on the schedule...", sentAt: "2024-10-13T09:00:00Z" },
    ],
  },
  {
    id: "lead3", firstName: "Linda", lastName: "Chen", email: "linda.chen@example.com", phone: "(772) 555-0267",
    address: "2250 Indian River Blvd", city: "Vero Beach", state: "FL", zip: "32963", status: "new", source: "website", notes: null,
    createdAt: "2024-10-18T16:45:00Z", updatedAt: "2024-10-18T16:45:00Z",
    quotes: [{ id: "q3", leadId: "lead3", address: "2250 Indian River Blvd", totalSqFt: 3200, mulchType: "hardwood", depth: 3, yardsNeeded: 29.7, pricePerYard: 65, totalPriceLow: 1931, totalPriceHigh: 2220, status: "pending", createdAt: "2024-10-18T16:45:00Z" }],
    emails: [],
  },
  {
    id: "lead4", firstName: "Robert", lastName: "Thompson", email: "rthompson@example.com", phone: "(216) 555-0334",
    address: "14500 Detroit Ave", city: "Lakewood", state: "OH", zip: "44107", status: "completed", source: "referral", notes: "Repeat customer, did spring and fall",
    createdAt: "2024-09-20T08:00:00Z", updatedAt: "2024-10-01T15:30:00Z",
    quotes: [{ id: "q4", leadId: "lead4", address: "14500 Detroit Ave", totalSqFt: 1200, mulchType: "hardwood", depth: 3, yardsNeeded: 11.2, pricePerYard: 55, totalPriceLow: 616, totalPriceHigh: 708, status: "accepted", createdAt: "2024-09-20T08:00:00Z" }],
    emails: [
      { id: "e4", leadId: "lead4", type: "quote_confirmation", subject: "Your Mulch Quote for 14500 Detroit Ave", body: "Hi Robert, thanks for getting a quote...", sentAt: "2024-09-20T08:01:00Z" },
      { id: "e5", leadId: "lead4", type: "status_completed", subject: "Job complete at 14500 Detroit Ave", body: "Hi Robert, our crew just wrapped up...", sentAt: "2024-10-01T15:30:00Z" },
    ],
  },
  {
    id: "lead5", firstName: "Maria", lastName: "Gonzalez", email: "mgonzalez@example.com", phone: "(954) 555-0411",
    address: "3300 SW 2nd Ave", city: "Fort Lauderdale", state: "FL", zip: "33315", status: "new", source: "website", notes: null,
    createdAt: "2024-10-19T11:15:00Z", updatedAt: "2024-10-19T11:15:00Z",
    quotes: [{ id: "q5", leadId: "lead5", address: "3300 SW 2nd Ave", totalSqFt: 950, mulchType: "red-dyed", depth: 2, yardsNeeded: 5.9, pricePerYard: 60, totalPriceLow: 404, totalPriceHigh: 457, status: "pending", createdAt: "2024-10-19T11:15:00Z" }],
    emails: [],
  },
];

export function getLeads(status?: string, search?: string) {
  let result = [...leads];
  if (status) result = result.filter((l) => l.status === status);
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (l) =>
        l.firstName.toLowerCase().includes(s) ||
        l.lastName.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.address.toLowerCase().includes(s)
    );
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLead(id: string) {
  return leads.find((l) => l.id === id) || null;
}

export function addLead(data: Partial<Lead> & { firstName: string; lastName: string; email: string; address: string }) {
  const lead: Lead = {
    id: genId(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    address: data.address,
    city: data.city || null,
    state: data.state || null,
    zip: data.zip || null,
    status: "new",
    source: data.source || "website",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quotes: [],
    emails: [],
  };
  leads.push(lead);
  return lead;
}

export function updateLead(id: string, data: Partial<Lead>) {
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;
  Object.assign(lead, data, { updatedAt: new Date().toISOString() });
  return lead;
}

export function deleteLead(id: string) {
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  leads.splice(idx, 1);
  return true;
}

export function getPricingRules(market?: string) {
  let result = [...pricingRules];
  if (market) result = result.filter((r) => r.market === market);
  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addPricingRule(data: Partial<PricingRule>) {
  const rule: PricingRule = {
    id: genId(),
    name: data.name || "",
    mulchType: data.mulchType || "",
    pricePerYard: data.pricePerYard || 0,
    minDepth: data.minDepth || 2,
    maxDepth: data.maxDepth || 4,
    market: data.market || "default",
    isActive: data.isActive !== false,
    sortOrder: data.sortOrder || pricingRules.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  pricingRules.push(rule);
  return rule;
}

export function updatePricingRule(id: string, data: Partial<PricingRule>) {
  const rule = pricingRules.find((r) => r.id === id);
  if (!rule) return null;
  Object.assign(rule, data, { updatedAt: new Date().toISOString() });
  return rule;
}

export function deletePricingRule(id: string) {
  const idx = pricingRules.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  pricingRules.splice(idx, 1);
  return true;
}

export function getStats() {
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const quotedLeads = leads.filter((l) => l.status === "quoted").length;
  const scheduledLeads = leads.filter((l) => l.status === "scheduled").length;
  const completedLeads = leads.filter((l) => l.status === "completed").length;
  const allQuotes = leads.flatMap((l) => l.quotes);
  const completedQuotes = leads.filter((l) => l.status === "completed").flatMap((l) => l.quotes);
  const totalRevenue = completedQuotes.reduce((sum, q) => sum + q.totalPriceHigh, 0);
  const avgQuoteValue = allQuotes.length > 0 ? allQuotes.reduce((sum, q) => sum + (q.totalPriceLow + q.totalPriceHigh) / 2, 0) / allQuotes.length : 0;
  const emailsSent = leads.reduce((sum, l) => sum + l.emails.length, 0);

  return {
    totalLeads,
    newLeads,
    quotedLeads,
    scheduledLeads,
    completedLeads,
    totalRevenue,
    avgQuoteValue: Math.round(avgQuoteValue * 100) / 100,
    recentLeads: leads
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((l) => ({ ...l, quotes: l.quotes })),
    leadsByStatus: [
      { status: "new", count: newLeads },
      { status: "quoted", count: quotedLeads },
      { status: "scheduled", count: scheduledLeads },
      { status: "completed", count: completedLeads },
    ],
    emailsSent,
  };
}
