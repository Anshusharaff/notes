'use client';

import { useState, useEffect } from 'react';
import SetNewLeftDays from './setNew';
import ShowTargetDates from './ShowTargetDates';
import { RefreshButton } from "@/components/RefreshButton";
import { PageTransition, SlideIn } from "@/components/PageTransition";
import { setCache, getCache } from "@/lib/cache";

export default function TargetClient({ initialTargets }) {
    const [targets, setTargets] = useState(initialTargets);

    // Cache initial data on mount
    useEffect(() => {
        setCache('targets', initialTargets, 20);
    }, [initialTargets]);

    const handleRefresh = async () => {
        try {
            const response = await fetch('/api/targets', { cache: 'no-store' });
            const freshTargets = await response.json();
            setTargets(freshTargets);

            // Update cache
            setCache('targets', freshTargets, 20);
        } catch (error) {
            console.error('Error refreshing targets:', error);
        }
    };

    return (
        <PageTransition>
            <div className='space-y-6 p-4'>
                <SlideIn direction="down">
                    <div className='w-full flex flex-wrap gap-4 items-center justify-between'>
                        <h1 className="text-2xl font-bold">Target Dates</h1>
                        <div className="flex items-center gap-3">
                            <SetNewLeftDays />
                            <RefreshButton onRefresh={handleRefresh} />
                        </div>
                    </div>
                </SlideIn>
                <SlideIn delay={0.1}>
                    <div className='mx-auto py-6 w-full md:w-2/3'>
                        <ShowTargetDates targetdates={targets} />
                    </div>
                </SlideIn>
            </div>
        </PageTransition>
    );
}
