import { NextRequest, NextResponse } from "next/server";
import { getPricingRules, addPricingRule, updatePricingRule, deletePricingRule } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get("market") || undefined;

    const rules = getPricingRules(market);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mulchType, pricePerYard, minDepth, maxDepth, market, isActive, sortOrder } = body;

    if (!name || !mulchType || pricePerYard === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, mulchType, pricePerYard" },
        { status: 400 }
      );
    }

    const rule = addPricingRule({
      name,
      mulchType,
      pricePerYard: parseFloat(String(pricePerYard)),
      minDepth: minDepth !== undefined ? parseFloat(String(minDepth)) : 2.0,
      maxDepth: maxDepth !== undefined ? parseFloat(String(maxDepth)) : 4.0,
      market: market || "default",
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder)) : 0,
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.mulchType !== undefined) updateData.mulchType = data.mulchType;
    if (data.pricePerYard !== undefined) updateData.pricePerYard = parseFloat(String(data.pricePerYard));
    if (data.minDepth !== undefined) updateData.minDepth = parseFloat(String(data.minDepth));
    if (data.maxDepth !== undefined) updateData.maxDepth = parseFloat(String(data.maxDepth));
    if (data.market !== undefined) updateData.market = data.market;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(String(data.sortOrder));

    const rule = updatePricingRule(id, updateData);

    if (!rule) {
      return NextResponse.json(
        { error: "Pricing rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to update pricing rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const success = deletePricingRule(id);

    if (!success) {
      return NextResponse.json(
        { error: "Pricing rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing rule" },
      { status: 500 }
    );
  }
}
