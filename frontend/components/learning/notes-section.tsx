"use client"

import { useState, useEffect } from "react"
import { FileText, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface NoteItem {
  id: string
  title: string
  description: string
  readTime: string
  url: string
  completed: boolean // This property will come from the backend
}

interface NotesSectionProps {
  notes: NoteItem[]
  onComplete: () => void // This is for marking the entire section complete
  isCompleted: boolean // This indicates if the entire section is considered complete
  onMarkAsReadBackend: (resourceId: string) => Promise<void>; // Prop to call backend API for individual note completion
}

export default function NotesSection({ notes, onComplete, isCompleted, onMarkAsReadBackend }: NotesSectionProps) {
  // Use local state to track which notes have been marked as read by the user in this session.
  // Initialize this set based on the 'completed' status from the notes prop received from backend.
  const [readNotes, setReadNotes] = useState<Set<string>>(() => {
    const initialRead = new Set<string>();
    notes.forEach(note => {
      if (note.completed) {
        initialRead.add(note.id);
      }
    });
    return initialRead;
  });

  // Effect to re-initialize readNotes if the 'notes' prop changes (e.g., after a full data refresh)
  useEffect(() => {
    const updatedRead = new Set<string>();
    notes.forEach(note => {
      if (note.completed) {
        updatedRead.add(note.id);
      }
    });
    setReadNotes(updatedRead);
  }, [notes]);


  const markAsRead = async (noteId: string) => {
    // Only mark as read if it's not already in the set
    if (!readNotes.has(noteId)) {
      const newReadNotes = new Set(readNotes);
      newReadNotes.add(noteId);
      setReadNotes(newReadNotes);

      // Call the backend API to mark this specific note as complete
      await onMarkAsReadBackend(noteId);
    }
  };

  // Determine if all notes are read based on the local state
  const allNotesCompletedLocally = readNotes.size === notes.length;

  // Trigger onComplete when all notes are completed locally and the section isn't already marked complete by parent
  useEffect(() => {
    if (allNotesCompletedLocally && !isCompleted) {
      onComplete();
    }
  }, [allNotesCompletedLocally, isCompleted, onComplete]);


  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 text-center text-gray-700">
        <h2 className="text-2xl font-bold mb-4">No Notes Available</h2>
        <p>It looks like there are no notes for this section yet. Please check back later!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Course Notes</h2>
        <p className="text-gray-600">Essential reading materials and references</p>
      </div>

      {allNotesCompletedLocally && isCompleted && ( // Use local state for conditional rendering
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">All Notes Completed! 🎉</h3>
          <p className="text-green-600">You've finished all the reading materials for this section.</p>
        </motion.div>
      )}

      <div className="space-y-6">
        {notes.map((note) => (
          <div
            key={note.id}
            // Apply green border and light green background when the note is read
            className={`bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all
            ${readNotes.has(note.id) ? "border-green-500 bg-green-50" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold">{note.title}</h3>
                  {readNotes.has(note.id) && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
                <p className="text-gray-600 mb-4">{note.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📖 {note.readTime} read</span>
                  <span>•</span>
                  <span>Course material</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 ml-6">
                <Button
                  className="bg-pink-600 hover:bg-black text-white font-bold"
                  onClick={() => window.open(note.url, "_blank")}
                >
                  <ExternalLink size={16} className="mr-2" />
                  Read Note
                </Button>
                {/* Conditional rendering for "Mark as Read" button or "Completed!" rectangle */}
                {!readNotes.has(note.id) ? (
                  <Button
                    variant="outline"
                    className="border-2 border-black hover:bg-gray-100"
                    onClick={() => markAsRead(note.id)}
                  >
                    Mark as Read
                  </Button>
                ) : (
                  // Replaced Button with a styled div for "Completed!"
                  <div
                    className="flex items-center justify-center h-10 px-4 py-2 rounded-lg text-sm
                               bg-green-500 text-white font-bold" // Removed cursor-default and disabled
                  >
                    Completed!
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
