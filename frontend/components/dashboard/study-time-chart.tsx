"use client"

import { Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function StudyTimeChart() {
  // Sample data for the last 7 days
  const data = [
    { day: "Mon", hours: 2.5, date: "Jan 20" },
    { day: "Tue", hours: 1.8, date: "Jan 21" },
    { day: "Wed", hours: 3.2, date: "Jan 22" },
    { day: "Thu", hours: 0.5, date: "Jan 23" },
    { day: "Fri", hours: 2.1, date: "Jan 24" },
    { day: "Sat", hours: 4.0, date: "Jan 25" },
    { day: "Sun", hours: 1.9, date: "Jan 26" },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border-2 border-black rounded-lg p-3 shadow-lg">
          <p className="font-bold">{`${label} (${data.date})`}</p>
          <p className="text-blue-600">
            <span className="font-medium">Study Time: </span>
            {`${payload[0].value} hours`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold">Daily Study Time</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">Last 7 Days</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#374151" fontSize={12} fontWeight="bold" />
            <YAxis stroke="#374151" fontSize={12} fontWeight="bold" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="text-lg font-bold text-blue-600">16.0h</div>
          <div className="text-sm text-blue-500">This Week</div>
        </div>
        <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="text-lg font-bold text-green-600">2.3h</div>
          <div className="text-sm text-green-500">Daily Avg</div>
        </div>
        <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="text-lg font-bold text-purple-600">4.0h</div>
          <div className="text-sm text-purple-500">Best Day</div>
        </div>
      </div>
    </div>
  )
}
