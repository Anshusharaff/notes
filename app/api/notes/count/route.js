import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await sql.query("select * from notes where trash=FALSE");
        return NextResponse.json({ count: data.length });
    } catch (error) {
        console.error('Error fetching notes count:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
