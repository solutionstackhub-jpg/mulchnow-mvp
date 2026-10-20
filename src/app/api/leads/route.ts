import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: { quotes: true },
      orderBy: { createdAt: "desc" },
    });

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
    const { firstName, lastName, email, phone, address, city, state, zip, status, source, notes } = body;

    if (!firstName || !lastName || !email || !address) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, address" },
        { status: 400 }
      );
    }

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
        status: status || "new",
        source: source || "admin",
        notes: notes || null,
      },
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
