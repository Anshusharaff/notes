import { sql } from "@/lib/db";
import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
        await sql.query(`INSERT INTO notifications (title, created_at, category, label) VALUES ('Logout', '${date}','logout','Logout')`);
        await deleteSession();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error during logout:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
