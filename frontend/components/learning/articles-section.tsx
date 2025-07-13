// components/learning/official-docs-section.tsx
"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DocItem {
  id: string;
  title: string;
  description: string;
  readTime: string; // Assuming readTime is still relevant for docs
  url: string;
  completed: boolean; // This property will come from the backend
}

// **THIS IS THE CRUCIAL PART: Ensure 'isCompleted' is defined here.**
interface OfficialDocsSectionProps {
  docs: DocItem[];
  onComplete: () => void;
  isCompleted: boolean; // <-- Add this line if it's missing or incorrect
  onMarkAsReadBackend: (resourceId: string) => Promise<void>;
}

export default function OfficialDocsSection({
  docs,
  onComplete,
  isCompleted, // Make sure it's destructured from props
  onMarkAsReadBackend,
}: OfficialDocsSectionProps) {
  // Use local state to track which docs have been marked as read by the user in this session.
  const [readDocs, setReadDocs] = useState<Set<string>>(() => {
    const initialRead = new Set<string>();
    docs.forEach((doc) => {
      if (doc.completed) {
        initialRead.add(doc.id);
      }
    });
    return initialRead;
  });

  // Effect to re-initialize readDocs if the 'docs' prop changes (e.g., after a full data refresh)
  useEffect(() => {
    const updatedRead = new Set<string>();
    docs.forEach((doc) => {
      if (doc.completed) {
        updatedRead.add(doc.id);
      }
    });
    setReadDocs(updatedRead);
  }, [docs]);

  const markAsRead = async (docId: string) => {
    if (!readDocs.has(docId)) {
      const newReadDocs = new Set(readDocs);
      newReadDocs.add(docId);
      setReadDocs(newReadDocs);

      await onMarkAsReadBackend(docId);
    }
  };

  const allDocsCompletedLocally = readDocs.size === docs.length;

  // Trigger onComplete when all docs are completed locally and the section isn't already marked complete by parent
  useEffect(() => {
    if (allDocsCompletedLocally && !isCompleted) {
      onComplete();
    }
  }, [allDocsCompletedLocally, isCompleted, onComplete]);

  if (!docs || docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 text-center text-gray-700">
        <h2 className="text-2xl font-bold mb-4">No Official Documentation Available</h2>
        <p>It looks like there are no official docs for this section yet. Please check back later!</p>
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
        <h2 className="text-3xl font-black mb-2">Official Documentation</h2>
        <p className="text-gray-600">Essential reading materials and references</p>
      </div>

      {allDocsCompletedLocally && isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">Official Docs Completed! 🎉</h3>
          <p className="text-green-600">You've finished all the official documentation for this section.</p>
        </motion.div>
      )}

      <div className="space-y-6">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all
            ${readDocs.has(doc.id) ? "border-green-500 bg-green-50" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold">{doc.title}</h3>
                  {readDocs.has(doc.id) && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
                <p className="text-gray-600 mb-4">{doc.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📖 {doc.readTime} read</span>
                  <span>•</span>
                  <span>Official documentation</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 ml-6">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-pink-600 hover:bg-black text-white font-bold">
                    <ExternalLink size={16} className="mr-2" />
                    Read Document
                  </Button>
                </a>
                {!readDocs.has(doc.id) ? (
                  <Button
                    variant="outline"
                    className="border-2 border-black hover:bg-gray-100"
                    onClick={() => markAsRead(doc.id)}
                  >
                    Mark as Read
                  </Button>
                ) : (
                  <div
                    className="flex items-center justify-center h-10 px-4 py-2 rounded-lg text-sm
                               bg-green-100 text-green-700 font-bold border border-green-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed!
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}