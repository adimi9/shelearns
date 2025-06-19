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

interface ArticleCardProps {
  articles: Article[]
  onComplete: () => void
  isCompleted: boolean
}

export default function ArticleCard({ articles, onComplete, isCompleted }: ArticleCardProps) {
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

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white border-2 border-black rounded-lg p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-pink-600" />
                <h4 className="font-bold">{article.title}</h4>
                {readArticles.has(article.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <p className="text-sm text-gray-600 mb-3">{article.description}</p>
              <p className="text-xs text-gray-500">{article.readTime} read</p>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Button
                size="sm"
                className="bg-pink-600 hover:bg-black text-white"
                onClick={() => window.open(article.url, "_blank")}
              >
                <ExternalLink size={14} className="mr-1" />
                Read
              </Button>
              {!readArticles.has(article.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 border-black"
                  onClick={() => markAsRead(article.id)}
                >
                  Mark Read
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {isCompleted && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-700">All articles completed!</p>
        </div>
      )}
    </div>
  )
}
