"use server"
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL, {
    fetchConnectionCache: true,
    fetchOptions: {
        timeout: 30000, // 30 seconds timeout
    }
});

// Retry wrapper for database queries
async function retryQuery(queryFn, maxRetries = 2) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await queryFn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries && (error.message.includes('ETIMEDOUT') || error.message.includes('fetch failed'))) {
                // Wait before retry (exponential backoff: 1s, 2s, 4s...)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}

// Create a proxy to add retry logic to sql queries
const sqlWithRetry = new Proxy(sql, {
    apply(target, thisArg, args) {
        return retryQuery(() => target.apply(thisArg, args));
    },
    get(target, prop) {
        const original = target[prop];
        if (prop === 'query' && typeof original === 'function') {
            return (...args) => retryQuery(() => original.apply(target, args));
        }
        return original;
    }
});

export { sqlWithRetry as sql };