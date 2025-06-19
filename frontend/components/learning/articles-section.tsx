"use client"

import { useState } from "react"
import { FileText, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Article {
  id: string
  title: string
  description: string
  readTime: string
  url: string
}

interface ArticlesSectionProps {
  articles: Article[]
  onComplete: () => void
  isCompleted: boolean
}

export default function ArticlesSection({ articles, onComplete, isCompleted }: ArticlesSectionProps) {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set())

  const markAsRead = (articleId: string) => {
    const newReadArticles = new Set(readArticles)
    newReadArticles.add(articleId)
    setReadArticles(newReadArticles)

    // Mark section as complete when all articles are read
    if (newReadArticles.size === articles.length && !isCompleted) {
      onComplete()
    }
  }

  const allRead = readArticles.size === articles.length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Reading Materials</h2>
        <p className="text-gray-600">Essential articles to deepen your understanding</p>
      </div>

      {allRead && isCompleted && (
        <div className="mb-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">Articles Completed! 🎉</h3>
          <p className="text-green-600">You've finished all the reading materials for this section.</p>
        </div>
      )}

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold">{article.title}</h3>
                  {readArticles.has(article.id) && <CheckCircle className="w-6 h-6 text-green-500" />}
                </div>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📖 {article.readTime} read</span>
                  <span>•</span>
                  <span>Essential reading</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 ml-6">
                <Button
                  className="bg-pink-600 hover:bg-black text-white font-bold"
                  onClick={() => window.open(article.url, "_blank")}
                >
                  <ExternalLink size={16} className="mr-2" />
                  Read Article
                </Button>
                {!readArticles.has(article.id) && (
                  <Button
                    variant="outline"
                    className="border-2 border-black hover:bg-gray-100"
                    onClick={() => markAsRead(article.id)}
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
