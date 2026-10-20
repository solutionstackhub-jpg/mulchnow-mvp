import { NextRequest, NextResponse } from "next/server";
import { getLeads, addLead } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const leads = getLeads(status, search);

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, city, state, zip, source, notes } = body;

    if (!firstName || !lastName || !email || !address) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, address" },
        { status: 400 }
      );
    }

    const lead = addLead({
      firstName,
      lastName,
      email,
      phone: phone || null,
      address,
      city: city || null,
      state: state || null,
      zip: zip || null,
      source: source || "admin",
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
