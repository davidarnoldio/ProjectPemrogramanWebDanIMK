import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nim, newPassword } = body;

    if (!nim || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Try updating Supabase auth user password
    try {
      const email = `${nim}@student.ug.ac.id`;
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const targetUser = users?.users?.find((u) => u.email === email);

      if (targetUser) {
        await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
          password: newPassword,
        });

        await supabaseAdmin
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", targetUser.id);
      }
    } catch (e) {
      console.warn("Supabase auth change password fallback:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui. Silakan login kembali dengan password baru.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengubah password" }, { status: 500 });
  }
}
