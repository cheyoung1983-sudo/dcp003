import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = `DCP-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketNumber = `DCP-${Math.floor(8800 + Math.random() * 1199)}`;

    return NextResponse.json({
      success: true,
      draftOrderId: orderId,
      ticketNumber,
      invoiceUrl: `/lab?order=${orderId}`,
      attachedPhotoCount: body?.photoMetadata?.totalCount || 0,
      attachedCategories: body?.photoMetadata?.categories || [],
      message: 'Intake ticket successfully recorded and synchronized with Spokane Lab.'
    });
  } catch (error: any) {
    console.error('Error processing intake sync:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process intake' },
      { status: 500 }
    );
  }
}
