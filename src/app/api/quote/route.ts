import { NextRequest, NextResponse } from "next/server";
import { addLead, getPricingRules, leads } from "@/lib/data";
import { calculateYardsNeeded, calculatePriceRange } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      market,
      totalSqFt,
      mulchType,
      depth,
    } = body;

    if (!firstName || !lastName || !email || !address || !totalSqFt || !mulchType || !depth) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, address, totalSqFt, mulchType, depth" },
        { status: 400 }
      );
    }

    // Calculate yards needed
    const yardsNeeded = calculateYardsNeeded(totalSqFt, depth);

    // Look up pricing rule for this mulch type and market
    const rules = getPricingRules(market || "default");
    const pricingRule = rules.find(
      (r) => r.mulchType === mulchType && r.isActive
    );

    if (!pricingRule) {
      return NextResponse.json(
        { error: `No pricing rule found for mulchType "${mulchType}" in market "${market || "default"}"` },
        { status: 404 }
      );
    }

    // Calculate price range
    const priceRange = calculatePriceRange(yardsNeeded, pricingRule.pricePerYard);

    // Create lead
    const lead = addLead({
      firstName,
      lastName,
      email,
      phone: phone || null,
      address,
      city: city || null,
      state: state || null,
      zip: zip || null,
      source: "website",
    });

    // Create quote and attach to lead
    const quote = {
      id: `q_${Date.now()}`,
      leadId: lead.id,
      address,
      totalSqFt: parseFloat(String(totalSqFt)),
      mulchType,
      depth: parseFloat(String(depth)),
      yardsNeeded,
      pricePerYard: pricingRule.pricePerYard,
      totalPriceLow: priceRange.low,
      totalPriceHigh: priceRange.high,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    lead.quotes.push(quote);

    return NextResponse.json({
      quote: {
        ...quote,
        lead,
      },
      priceRange,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Gather all quotes from all leads, with lead data attached
    const quotes = leads
      .flatMap((lead) =>
        lead.quotes.map((quote) => ({
          ...quote,
          lead,
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
