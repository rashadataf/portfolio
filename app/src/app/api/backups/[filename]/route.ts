import { type NextRequest, NextResponse } from "next/server";
import { getBackupFile } from "@/modules/backup/backup.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const result = await getBackupFile(decodeURIComponent(filename));

    if (!result.success) {
      return new NextResponse(result.error, { status: 404 });
    }

    return new NextResponse(new Uint8Array(result.data), {
      status: 200,
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Invalid request", { status: 400 });
  }
}
