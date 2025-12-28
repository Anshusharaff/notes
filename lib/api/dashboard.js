import { sql } from "@/lib/db";

export async function getDashboardStats() {
    try {
        // Fetch data with error handling for optional tables
        const [notes, trashedNotes, favNotes, notifications] = await Promise.all([
            sql`SELECT * FROM notes WHERE trash=FALSE ORDER BY id DESC`,
            sql`SELECT * FROM notes WHERE trash=TRUE`,
            sql`SELECT * FROM notes WHERE fav=TRUE AND trash=FALSE`,
            sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10`
        ]);

        // Try to fetch targets, but handle gracefully if table doesn't exist
        let targets = [];
        try {
            const targetData = await sql`SELECT * FROM targetdate ORDER BY date ASC LIMIT 5`;

            // Process targets to calculate remaining days
            targets = targetData.map(t => {
                const today = new Date();
                const targetDate = new Date(t.date);
                const remainingTime = targetDate - today;
                const daysLeft = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

                return {
                    id: t.id,
                    name: t.message || 'Unnamed Target',
                    targetdate: new Date(t.date).toLocaleDateString(),
                    leftdays: daysLeft
                };
            }).filter(t => t.leftdays >= 0);
        } catch (error) {
            console.log('Targets table not found, skipping...');
        }

        // Calculate stats
        const totalNotes = notes.length;
        const totalTrashed = trashedNotes.length;
        const totalFavorites = favNotes.length;
        const totalNotifications = notifications.length;

        // Get recent notes (last 5)
        const recentNotes = notes.slice(0, 5).map(note => ({
            id: note.id,
            title: note.title.replaceAll("&apos;", "'"),
            created_at: note.created_at,
            lastupdated: note.lastupdated,
            fav: note.fav
        }));

        // Calculate notes created today
        const today = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" });
        const notesToday = notes.filter(note => {
            // Parse the created_at string which is already in Asia/Kathmandu timezone
            const noteDate = note.created_at.split(',')[0]; // Get just the date part (MM/DD/YYYY)
            return noteDate === today;
        }).length;

        // Calculate notes this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const notesThisWeek = notes.filter(note => {
            const noteDate = new Date(note.created_at);
            return noteDate >= weekAgo;
        }).length;

        // Get category distribution
        const categoryStats = {};
        notes.forEach(note => {
            const category = note.category || 'Uncategorized';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });

        return {
            totalNotes,
            totalTrashed,
            totalFavorites,
            totalNotifications,
            notesToday,
            notesThisWeek,
            recentNotes,
            recentNotifications: notifications.map(n => ({
                id: n.id,
                title: n.title,
                created_at: n.created_at,
                category: n.category,
                label: n.label
            })),
            categoryStats,
            upcomingTargets: targets
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

export async function getActivityTimeline() {
    try {
        const activities = await sql`
            SELECT 'note' as type, id, title, created_at as timestamp 
            FROM notes WHERE trash=FALSE 
            ORDER BY created_at DESC LIMIT 10
        `;

        return activities.map(a => ({
            type: a.type,
            id: a.id,
            title: a.title?.replaceAll("&apos;", "'") || 'Untitled',
            timestamp: a.timestamp
        }));
    } catch (error) {
        console.error('Error fetching activity timeline:', error);
        return [];
    }
}

export async function getProductivityStats() {
    try {
        const notes = await sql`SELECT * FROM notes WHERE trash=FALSE`;

        const now = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu" });

            const count = notes.filter(note => {
                // Parse the created_at string which is already in Asia/Kathmandu timezone
                const noteDate = note.created_at.split(',')[0]; // Get just the date part (MM/DD/YYYY)
                return noteDate === dateStr;
            }).length;

            last7Days.push({
                date: date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', timeZone: "Asia/Kathmandu" }),
                count
            });
        }

        return last7Days;
    } catch (error) {
        console.error('Error fetching productivity stats:', error);
        return [];
    }
}
