import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateYardsNeeded, calculatePriceRange } from "@/lib/pricing";
import { sendQuoteEmail } from "@/lib/email";

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
    const pricingRule = await prisma.pricingRule.findFirst({
      where: {
        mulchType,
        market: market || "default",
        isActive: true,
      },
    });

    if (!pricingRule) {
      return NextResponse.json(
        { error: `No pricing rule found for mulchType "${mulchType}" in market "${market || "default"}"` },
        { status: 404 }
      );
    }

    // Calculate price range
    const priceRange = calculatePriceRange(yardsNeeded, pricingRule.pricePerYard);

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address,
        city: city || null,
        state: state || null,
        zip: zip || null,
        status: "new",
        source: "website",
      },
    });

    // Create quote
    const quote = await prisma.quote.create({
      data: {
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
      },
    });

    // Send quote confirmation email
    await sendQuoteEmail(lead.id, {
      firstName,
      email,
      address,
      mulchType,
      yards: yardsNeeded,
      priceLow: priceRange.low,
      priceHigh: priceRange.high,
    });

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
    const quotes = await prisma.quote.findMany({
      include: { lead: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
