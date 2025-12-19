"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { SquarePen, Italic, Bold, List, Underline, Plus } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function AddNote({ icon, noteid, title, body, onRefresh }) {
    const router = useRouter();
    const titleRef = useRef(null)
    const bodyRef = useRef(null)

    const applyFormat = (formatType) => {
        const textarea = bodyRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);
        let newText = "";
        let newStart = start;
        let newEnd = end;

        switch (formatType) {
            case "bold":
                newText = `${beforeText}**${selectedText}**${afterText}`;
                newStart = start + 2;
                newEnd = end + 2;
                if (selectedText === "") newStart = newEnd = start + 2; // Place cursor in middle if no selection
                break;
            case "italic":
                newText = `${beforeText}*${selectedText}*${afterText}`;
                newStart = start + 1;
                newEnd = end + 1;
                if (selectedText === "") newStart = newEnd = start + 1;
                break;
            case "underline":
                newText = `${beforeText}__${selectedText}__${afterText}`;
                newStart = start + 2;
                newEnd = end + 2;
                if (selectedText === "") newStart = newEnd = start + 2;
                break;
            case "list": {
                const currentFullText = textarea.value;
                let newSelectionStart = start;
                let newSelectionEnd = end;

                // Determine the range of lines affected by the selection
                let lineStartIndex = start;
                while (lineStartIndex > 0 && currentFullText[lineStartIndex - 1] !== '\n') {
                    lineStartIndex--;
                }
                let lineEndIndex = end;
                // If selection ends at a newline, we don't want to extend to the next line
                if (currentFullText[lineEndIndex] === '\n' && end > start) {
                    // no-op, lineEndIndex is fine
                } else {
                    while (lineEndIndex < currentFullText.length && currentFullText[lineEndIndex] !== '\n') {
                        lineEndIndex++;
                    }
                }

                const affectedText = currentFullText.substring(lineStartIndex, lineEndIndex);
                const lines = affectedText.split('\n');

                const allLinesAreListItems = lines.every(line => line.startsWith("* ") || line.trim() === "");

                let processedLines = [];
                let textWasChanged = false;
                let charsAdded = 0; // Track net change in characters for selection adjustment

                if (allLinesAreListItems) {
                    // Remove "* " from all lines
                    processedLines = lines.map(line => {
                        if (line.startsWith("* ")) {
                            charsAdded -= 2;
                            textWasChanged = true;
                            return line.substring(2);
                        }
                        return line;
                    });
                } else {
                    // Add "* " to lines that don't have it
                    processedLines = lines.map(line => {
                        if (line.trim() !== "" && !line.startsWith("* ")) {
                            charsAdded += 2;
                            textWasChanged = true;
                            return "* " + line;
                        }
                        return line;
                    });
                }

                const newAffectedText = processedLines.join('\n');
                newText = currentFullText.substring(0, lineStartIndex) + newAffectedText + currentFullText.substring(lineEndIndex);

                if (textWasChanged) {
                    if (start === end) { // No selection, cursor on a line
                        // Adjust cursor based on whether we added or removed "* "
                        if (allLinesAreListItems) { // Removed
                            newSelectionStart = Math.max(lineStartIndex, start - 2);
                        } else { // Added
                            newSelectionStart = start + 2;
                        }
                        newSelectionEnd = newSelectionStart;
                    } else { // Selection
                        newSelectionStart = start; // Keep start of selection the same
                        // The end of selection needs to be adjusted by the total change in length of the processed lines.
                        // This is a simplified adjustment.
                        newSelectionEnd = end + charsAdded;
                    }
                } else {
                    newSelectionStart = start;
                    newSelectionEnd = end;
                }

                // Ensure selection doesn't go out of bounds
                newSelectionStart = Math.max(0, Math.min(newText.length, newSelectionStart));
                newSelectionEnd = Math.max(0, Math.min(newText.length, newSelectionEnd));

                // Update newStart and newEnd for the final assignment
                newStart = newSelectionStart;
                newEnd = newSelectionEnd;
                break;
            }
            default:
                newText = textarea.value; // No change
                newStart = start;
                newEnd = end;
        }

        textarea.value = newText;
        textarea.focus();
        // A slight delay might be needed for the selection to apply correctly after value change
        setTimeout(() => {
            textarea.selectionStart = newStart;
            textarea.selectionEnd = newEnd;
        }, 0);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: titleRef.current.value, body: bodyRef.current.value })
            });
            const data = await response.json();
            if (data.success) {
                toast({ title: "Note saved successfully!" });
            } else {
                toast({ title: "Failed to save note!" });
            }
        } catch (error) {
            toast({ title: "Failed to save note!" });
        }
        if (onRefresh) await onRefresh();
        router.refresh();
    }
    const handleUpdatee = async () => {
        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: noteid, title: titleRef.current.value, body: bodyRef.current.value })
            });
            const data = await response.json();
            if (data.success) {
                toast({ title: "Note updated successfully!" });
            } else {
                toast({ title: "Failed to update note!" });
            }
        } catch (error) {
            toast({ title: "Failed to update note!" });
        }
        if (onRefresh) await onRefresh();
        router.refresh();
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                {
                    icon && icon === "SquarePen" ? <Button className={"bg-transparent text-white hover:text-black"}><SquarePen /></Button> :
                        <Button variant="outline"><Plus /></Button>
                }
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{icon === "SquarePen" ? "Update" : "New Note"}</DialogTitle>
                    <DialogDescription>
                        {icon === "SquarePen" ? "Update your note." : "Your thoughts here. Click save when you're done."}

                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 items-end">
                    <ToggleGroup type="multiple" aria-label="Text formatting">
                        <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => applyFormat("bold")}><Bold /></ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => applyFormat("italic")}><Italic /></ToggleGroupItem>
                        <ToggleGroupItem value="underline" aria-label="Toggle underline" onClick={() => applyFormat("underline")}><Underline /></ToggleGroupItem>
                        <ToggleGroupItem value="bullet" aria-label="Toggle list" onClick={() => applyFormat("list")}><List /></ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex flex-col gap-4 py-4">
                    <Input id="title" defaultValue={title || ""} placeholder="Note title here." className="col-span-3" ref={titleRef} />
                    <Textarea rows="10" defaultValue={body || ""} placeholder="Your thoughts here." className="col-span-3" ref={bodyRef} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        {
                            icon && icon === "SquarePen" ? <Button type="submit" onClick={handleUpdatee}>Update</Button> :
                                <Button type="submit" onClick={handleSave}>Save</Button>
                        }
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}