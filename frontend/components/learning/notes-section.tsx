"use client"

import { useState } from "react"
import { FileText, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Note {
  id: string
  title: string
  description: string
  readTime: string
  url: string
}

interface NotesSectionProps {
  notes: Note[]
  onComplete: () => void
  isCompleted: boolean
}

export default function NotesSection({ notes, onComplete, isCompleted }: NotesSectionProps) {
  const [readNotes, setReadNotes] = useState<Set<string>>(new Set())

  const markAsRead = (noteId: string) => {
    const newReadNotes = new Set(readNotes)
    newReadNotes.add(noteId)
    setReadNotes(newReadNotes)

    // Mark section as complete when all notes are read
    if (newReadNotes.size === notes.length && !isCompleted) {
      onComplete()
    }
  }

  const allRead = readNotes.size === notes.length

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Course Notes</h2>
        <p className="text-gray-600">Essential reading materials and references</p>
      </div>

      {allRead && isCompleted && (
        <div className="mb-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">All Notes Completed! 🎉</h3>
          <p className="text-green-600">You've finished all the reading materials for this section.</p>
        </div>
      )}

      <div className="space-y-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
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
                {!readNotes.has(note.id) && (
                  <Button
                    variant="outline"
                    className="border-2 border-black hover:bg-gray-100"
                    onClick={() => markAsRead(note.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
