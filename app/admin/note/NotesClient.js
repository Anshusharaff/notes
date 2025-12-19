'use client';

import { useState, useEffect } from 'react';
import { AddNote } from "./addNote";
import { ShowTrashedNotes } from "./ShowTrashedNotes";
import { ShowFavNotes } from "./ShowFav";
import SearchComponent from "./InputPage";
import Download from "./Download";
import { RefreshButton } from "@/components/RefreshButton";
import { PageTransition, SlideIn } from "@/components/PageTransition";
import { setCache, getCache } from "@/lib/cache";

export default function NotesClient({ initialNotes, initialFavNotes, initialTrashedNotes }) {
    const [notes, setNotes] = useState(initialNotes);
    const [favNotes, setFavNotes] = useState(initialFavNotes);
    const [trashedNotes, setTrashedNotes] = useState(initialTrashedNotes);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Cache initial data on mount
    useEffect(() => {
        setCache('notes', initialNotes, 30);
        setCache('favNotes', initialFavNotes, 30);
        setCache('trashedNotes', initialTrashedNotes, 30);
    }, [initialNotes, initialFavNotes, initialTrashedNotes]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const [notesRes, favNotesRes, trashedNotesRes] = await Promise.all([
                fetch('/api/notes', { cache: 'no-store' }),
                fetch('/api/notes?type=favorites', { cache: 'no-store' }),
                fetch('/api/notes?type=trashed', { cache: 'no-store' })
            ]);

            const [freshNotes, freshFavNotes, freshTrashedNotes] = await Promise.all([
                notesRes.json(),
                favNotesRes.json(),
                trashedNotesRes.json()
            ]);

            // Update state
            setNotes(freshNotes);
            setFavNotes(freshFavNotes);
            setTrashedNotes(freshTrashedNotes);

            // Update cache
            setCache('notes', freshNotes, 30);
            setCache('favNotes', freshFavNotes, 30);
            setCache('trashedNotes', freshTrashedNotes, 30);
        } catch (error) {
            console.error('Error refreshing notes:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <PageTransition>
            <div className="space-y-6 p-4">
                <SlideIn direction="down">
                    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold">Notes</h1>
                        <div className="flex items-center gap-3">
                            <ShowTrashedNotes notes={trashedNotes} onRefresh={handleRefresh} />
                            <ShowFavNotes notes={favNotes} onRefresh={handleRefresh} />
                            <AddNote icon={""} onRefresh={handleRefresh} />
                            <Download notes={notes} />
                            <RefreshButton onRefresh={handleRefresh} />
                        </div>
                    </div>
                </SlideIn>
                <SlideIn delay={0.1}>
                    <SearchComponent notes={notes} onRefresh={handleRefresh} key={notes.length} />
                </SlideIn>
            </div>
        </PageTransition>
    );
}
