"use server"
import { sql } from "@/lib/db";
import { AES } from "crypto-js";

export const handleChangePassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 4) {
        throw new Error('Password must be at least 4 characters');
    }

    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });

    await sql`
        INSERT INTO notifications (title, created_at, category, label) 
        VALUES ('Admin Password Changed', ${date}, 'passwordchange', 'Password Change')
    `;

    const encryptedPass = AES.encrypt(newPassword, process.env.SESSION_SECRET).toString();

    const res = await sql`
        UPDATE password 
        SET pass = ${encryptedPass}, last_updated = ${date} 
        WHERE id = 1 
        RETURNING id
    `;

    console.log(res);
    return res[0].id;
}

