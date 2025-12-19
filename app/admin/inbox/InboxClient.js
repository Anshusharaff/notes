'use client';

import { useState, useEffect } from 'react';
import ShowInbox from "./ShowInbox";
import { RefreshButton } from "@/components/RefreshButton";
import { PageTransition, SlideIn } from "@/components/PageTransition";
import { setCache, getCache } from "@/lib/cache";

export default function InboxClient({ initialResult, initialFilter }) {
    const [result, setResult] = useState(initialResult);
    const [filter, setFilter] = useState(initialFilter);

    // Cache initial data on mount
    useEffect(() => {
        setCache('inboxResult', initialResult, 20);
        setCache('inboxFilter', initialFilter, 20);
    }, [initialResult, initialFilter]);

    const handleRefresh = async () => {
        try {
            const response = await fetch('/api/notifications?filter=*', { cache: 'no-store' });
            const freshData = await response.json();
            setResult(freshData[0]);
            setFilter(freshData[1]);

            // Update cache
            setCache('inboxResult', freshData[0], 20);
            setCache('inboxFilter', freshData[1], 20);
        } catch (error) {
            console.error('Error refreshing inbox:', error);
        }
    };

    return (
        <PageTransition>
            <div className="p-2 space-y-6">
                <SlideIn direction="down">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Inbox</h1>
                        <RefreshButton onRefresh={handleRefresh} />
                    </div>
                </SlideIn>
                <SlideIn delay={0.1}>
                    <ShowInbox result={result} filter={filter} />
                </SlideIn>
            </div>
        </PageTransition>
    );
}
