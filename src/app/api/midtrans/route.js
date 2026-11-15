import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, customerName, customerEmail, customerPhone, itemDetails } = body;

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(grossAmount)),
      },
      customer_details: {
        first_name: customerName || "Buyer ENCORE",
        email: customerEmail,
        phone: customerPhone || "",
      },
      item_details: itemDetails,
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans API Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat transaksi Midtrans" },
      { status: 500 }
    );
  }
}