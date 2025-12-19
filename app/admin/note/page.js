import NotesClient from "./NotesClient";
import { getNotes, getFavNotes, getTrashedNotes } from "@/lib/api/notes";

export const dynamic = 'force-dynamic';

const Note = async () => {
  const [notes, favNotes, trashedNotes] = await Promise.all([
    getNotes(),
    getFavNotes(),
    getTrashedNotes()
  ]);

  return <NotesClient initialNotes={notes} initialFavNotes={favNotes} initialTrashedNotes={trashedNotes} />
}

export default Note
