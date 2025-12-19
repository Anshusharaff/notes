import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const activities = await sql`
            SELECT 'note' as type, id, title, created_at as timestamp 
            FROM notes WHERE trash=FALSE 
            ORDER BY created_at DESC LIMIT 10
        `;

        const result = activities.map(a => ({
            type: a.type,
            id: a.id,
            title: a.title?.replaceAll("&apos;", "'") || 'Untitled',
            timestamp: a.timestamp
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching activity timeline:', error);
        return NextResponse.json([], { status: 500 });
    }
}
