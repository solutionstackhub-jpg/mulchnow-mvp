import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Run counts in parallel
    const [
      totalLeads,
      newLeads,
      quotedLeads,
      scheduledLeads,
      completedLeads,
      allQuotes,
      completedQuotes,
      recentLeads,
      leadsByStatus,
      emailsSent,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count({ where: { status: "quoted" } }),
      prisma.lead.count({ where: { status: "scheduled" } }),
      prisma.lead.count({ where: { status: "completed" } }),
      prisma.quote.findMany({
        select: { totalPriceLow: true, totalPriceHigh: true },
      }),
      prisma.quote.findMany({
        where: {
          lead: { status: "completed" },
        },
        select: { totalPriceHigh: true },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { quotes: true },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.emailLog.count(),
    ]);

    // Calculate total revenue from completed quotes
    const totalRevenue = completedQuotes.reduce(
      (sum, q) => sum + q.totalPriceHigh,
      0
    );

    // Calculate average quote value
    const avgQuoteValue =
      allQuotes.length > 0
        ? allQuotes.reduce(
            (sum, q) => sum + (q.totalPriceLow + q.totalPriceHigh) / 2,
            0
          ) / allQuotes.length
        : 0;

    // Format leadsByStatus for chart data
    const leadsByStatusFormatted = leadsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    return NextResponse.json({
      totalLeads,
      newLeads,
      quotedLeads,
      scheduledLeads,
      completedLeads,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgQuoteValue: Math.round(avgQuoteValue * 100) / 100,
      recentLeads,
      leadsByStatus: leadsByStatusFormatted,
      emailsSent,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
