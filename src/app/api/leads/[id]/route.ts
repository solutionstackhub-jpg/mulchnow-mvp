import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendStatusEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        quotes: true,
        emails: { orderBy: { sentAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes, firstName, lastName, email, phone, address, city, state, zip } = body;

    // Get current lead to check for status change
    const currentLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!currentLead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
      include: { quotes: true },
    });

    // Send status email if status changed
    if (status && status !== currentLead.status) {
      await sendStatusEmail(lead.id, status, {
        firstName: lead.firstName,
        email: lead.email,
        address: lead.address,
      });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related records first (emails, quotes), then the lead
    await prisma.emailLog.deleteMany({ where: { leadId: params.id } });
    await prisma.quote.deleteMany({ where: { leadId: params.id } });
    await prisma.lead.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
