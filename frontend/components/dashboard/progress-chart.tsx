"use client"

import { TrendingUp } from "lucide-react"

export default function ProgressChart() {
  const data = [
    { name: "HTML & CSS Fundamentals", progress: 85, color: "#10b981", status: "In Progress" },
    { name: "JavaScript Essentials", progress: 45, color: "#f59e0b", status: "In Progress" },
    { name: "React Development", progress: 20, color: "#ef4444", status: "In Progress" },
    { name: "Node.js Backend", progress: 0, color: "#6b7280", status: "Locked" },
    { name: "Database Design", progress: 0, color: "#6b7280", status: "Locked" },
    { name: "Full Stack Projects", progress: 0, color: "#6b7280", status: "Locked" },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border-2 border-black rounded-lg p-3 shadow-lg">
          <p className="font-bold">{data.name}</p>
          <p style={{ color: data.color }}>
            <span className="font-medium">Progress: </span>
            {`${data.progress}%`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-500" />
        <h3 className="text-xl font-bold">Learning Path Progress</h3>
        <span className="text-sm text-gray-500 ml-auto">Frontend Development Track</span>
      </div>

      <div className="space-y-6">
        {data.map((course, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-black font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <span className="font-bold text-gray-800">{course.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        course.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : course.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {course.status}
                    </span>
                    {course.progress > 0 && (
                      <span className="text-xs text-gray-500">
                        {course.progress === 100 ? "Completed!" : `${course.progress}% complete`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg" style={{ color: course.progress > 0 ? course.color : "#6b7280" }}>
                  {course.progress}%
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${course.progress}%`,
                  backgroundColor: course.progress > 0 ? course.color : "#e5e7eb",
                }}
              >
                {course.progress > 15 && <span className="text-xs font-bold text-white">{course.progress}%</span>}
              </div>
            </div>

            {course.progress === 0 && course.status === "Locked" && (
              <p className="text-xs text-gray-500 ml-11">🔒 Complete previous courses to unlock</p>
            )}
          </div>
        ))}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-gray-700">Overall Track Progress</span>
          <span className="font-bold text-pink-600">
            {Math.round(data.reduce((acc, course) => acc + course.progress, 0) / data.length)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(data.reduce((acc, course) => acc + course.progress, 0) / data.length)}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
