"use client"

interface SubCourse {
  id: string
  title: string
  description: string
}

interface SubCourseNavbarProps {
  subCourses: SubCourse[]
  activeSubCourse: string
  onSubCourseChange: (id: string) => void
}

export default function SubCourseNavbar({ subCourses, activeSubCourse, onSubCourseChange }: SubCourseNavbarProps) {
  return (
    <div className="bg-white border-b-4 border-black overflow-x-auto">
      <div className="flex min-w-max">
        {subCourses.map((subCourse) => (
          <button
            key={subCourse.id}
            onClick={() => onSubCourseChange(subCourse.id)}
            className={`px-6 py-4 font-bold transition-all border-r-2 border-black last:border-r-0 whitespace-nowrap ${
              activeSubCourse === subCourse.id ? "bg-pink-500 text-white" : "bg-white text-black hover:bg-pink-100"
            }`}
          >
            {subCourse.title}
          </button>
        ))}
      </div>
    </div>
  )
}
