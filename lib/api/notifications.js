import { sql } from "@/lib/db";

export async function getNotifications(filter) {
    let result = []
    if (filter === "*") {
        result = await sql.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 40");
    } else {
        result = await sql.query(`SELECT * FROM notifications where category='${filter}' ORDER BY created_at DESC LIMIT 40`);
    }
    let obj = [];
    let categorySet = new Set();
    let labelSet = new Set();
    result.forEach(row => {
        categorySet.add(row.category);
        labelSet.add(row.label);
    })
    obj.push({ category: "*" })
    for (let category of categorySet) {
        obj.push({ category: category })
    }
    let c = 1;
    obj[0].label = "All"
    for (let label of labelSet) {
        obj[c].label = label;
        c++;
    }
    return [result, obj];
}
