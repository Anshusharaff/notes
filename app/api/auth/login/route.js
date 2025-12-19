import { sql } from "@/lib/db";
import { createSession } from "@/lib/session";
import { AES, enc } from "crypto-js";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { password } = await request.json();
        let encryptedPassword = await sql.query("SELECT pass FROM password");
        const realPassword = AES.decrypt(encryptedPassword[0].pass, process.env.SESSION_SECRET).toString(enc.Utf8);

        if (password !== realPassword) {
            const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
            await sql.query(`INSERT INTO notifications (title, created_at, category, label) VALUES ('Login Failed', '${date}','loginfailed','Login Failed')`);
            return NextResponse.json({
                success: false,
                message: "Invalid Password",
            }, { status: 401 });
        } else {
            const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
            await sql.query(`INSERT INTO notifications (title, created_at, category, label) VALUES ('Login Successful', '${date}','loginsuccess','Login Successful')`);
            await createSession(encryptedPassword);
            return NextResponse.json({
                success: true,
                message: "Login successful",
            });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({
            success: false,
            message: "An error occurred",
        }, { status: 500 });
    }
}
