import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      grossAmount,
      paymentType, // "bank_transfer", "echannel", "gopay", atau "qris"
      bank,        // "bca", "bni", "bri"
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    const coreApi = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const buildParameter = (type) => {
      const param = {
        payment_type: type,
        transaction_details: {
          order_id: orderId,
          gross_amount: Math.round(Number(grossAmount)),
        },
        customer_details: {
          first_name: customerName || "Buyer ENCORE",
          email: customerEmail,
          phone: customerPhone || "",
        },
      };

      if (type === "bank_transfer") {
        param.bank_transfer = { bank: bank.toLowerCase() };
      } else if (type === "echannel") {
        param.echannel = {
          bill_info1: "Tiket Konser ENCORE",
          bill_info2: orderId,
        };
      } else if (type === "gopay") {
        param.gopay = {
          enable_callback: true,
        };
      }

      return param;
    };

    try {
      const chargeResponse = await coreApi.charge(buildParameter(paymentType));
      return NextResponse.json(chargeResponse);
    } catch (primaryErr) {
      // Jika channel e-wallet tertentu (misal shopeepay/dana) belum aktif di Sandbox, fallback otomatis ke QRIS
      if (["shopeepay", "dana", "ovo"].includes(paymentType)) {
        const fallbackResponse = await coreApi.charge(buildParameter("qris"));
        return NextResponse.json(fallbackResponse);
      }
      throw primaryErr;
    }
  } catch (error) {
    console.error("Midtrans Charge Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat transaksi ke Midtrans" },
      { status: 500 }
    );
  }
}