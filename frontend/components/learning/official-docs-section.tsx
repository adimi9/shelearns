"use client"
import { ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Doc {
  id: string
  title: string
  description: string
  url: string
}

interface OfficialDocsProps {
  docs: Doc[]
  onComplete: (docId: string) => void
  completedDocs: Set<string>
  onAllComplete: () => void
}

export default function OfficialDocsSection({ docs, onComplete, completedDocs, onAllComplete }: OfficialDocsProps) {
  const allCompleted = docs.every((doc) => completedDocs.has(doc.id))

  const handleMarkAsRead = (docId: string) => {
    onComplete(docId)

    // Check if all docs are now completed
    if (docs.every((doc) => doc.id === docId || completedDocs.has(doc.id))) {
      onAllComplete()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Official Documentation</h2>
        <p className="text-gray-600">Reference materials from the official sources</p>
      </div>

      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">All Documentation Reviewed! 🎉</h3>
          <p className="text-green-600">You've completed all the official documentation for this section.</p>
        </motion.div>
      )}

      <div className="space-y-6">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">{doc.title}</h3>
                <p className="text-gray-600 mb-6 text-lg">{doc.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span>📚 Official Documentation</span>
                  <span>•</span>
                  <span>Comprehensive Reference</span>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="bg-pink-600 hover:bg-black text-white font-bold px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119)] transition-all hover:translate-y-[-2px]"
                    onClick={() => window.open(doc.url, "_blank")}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open Documentation
                  </Button>

                  {!completedDocs.has(doc.id) && (
                    <Button
                      variant="outline"
                      className="border-2 border-black hover:bg-gray-100 px-6 py-3 rounded-xl"
                      onClick={() => handleMarkAsRead(doc.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>

              {completedDocs.has(doc.id) && (
                <div className="ml-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              )}
            </div>

            {completedDocs.has(doc.id) && (
              <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="font-bold text-green-700">Documentation reviewed!</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
