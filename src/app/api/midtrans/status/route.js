import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId wajib diisi" }, { status: 400 });
  }

  try {
    const coreApi = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await coreApi.transaction.status(orderId);
    return NextResponse.json(statusResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Gagal mengecek status pembayaran" },
      { status: 500 }
    );
  }
}