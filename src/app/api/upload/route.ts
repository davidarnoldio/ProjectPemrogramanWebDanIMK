import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    let fileName = "";
    let fileBuffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "File tidak ditemukan dalam form data." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const randomId = crypto.randomUUID().slice(0, 8);
      fileName = `surat_${Date.now()}_${randomId}${ext}`;
    } else {
      // JSON body with base64
      const body = await req.json();
      const { base64, name } = body;

      if (!base64) {
        return NextResponse.json(
          { error: "Data base64 file wajib disertakan." },
          { status: 400 }
        );
      }

      // Strip data:image/...;base64, header if present
      const base64Data = base64.replace(/^data:[^;]+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");

      const ext = name ? path.extname(name) : ".jpg";
      const randomId = crypto.randomUUID().slice(0, 8);
      fileName = `surat_${Date.now()}_${randomId}${ext || ".jpg"}`;
    }

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, fileBuffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: fileBuffer.length,
      message: "File berhasil diunggah.",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}

