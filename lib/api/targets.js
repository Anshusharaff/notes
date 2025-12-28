import { sql } from "@/lib/db";

export async function getTargetDays() {
    try {
        const res = await sql.query(`SELECT * FROM targetdate`);

        let data = res.map((row) => {
            const today = new Date();
            const targetDate = new Date(row.date);
            const startDate = new Date(row.created_at);

            const totalDuration = targetDate - startDate;
            const elapsedTime = today - startDate;
            const remainingTime = targetDate - today;

            row.months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30));
            row.days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            row.hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            row.minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

            row.progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)) : 0;
            row.progressPercentage = Math.floor(row.progressPercentage);

            return row;
        });

        return data;
    } catch (error) {
        console.error("Error fetching targets:", error);
        return [];
    }
}

export async function getSharedTarget(shareid) {
    try {
        const res = await sql.query(`SELECT * FROM targetdate WHERE shareid='${shareid}'`);

        if (res.length === 0) {
            return null;
        }

        const row = res[0];
        const today = new Date();
        const targetDate = new Date(row.date);
        const startDate = new Date(row.created_at);

        const totalDuration = targetDate - startDate;
        const elapsedTime = today - startDate;
        const remainingTime = targetDate - today;

        row.months = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30));
        row.days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        row.hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        row.minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

        row.progressPercentage = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100)) : 0;
        row.progressPercentage = Math.floor(row.progressPercentage);

        return row;
    } catch (error) {
        console.error("Error fetching shared target:", error);
        return null;
    }
}

