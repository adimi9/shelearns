"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Option {
  id: string
  label: string
}

interface QuestionCardProps {
  question: string
  options: Option[]
  allowMultiple?: boolean
  specificTech?: boolean
  onNext: (selectedOptions: string[]) => void
  isLastQuestion?: boolean
}


export default function QuestionCard({
  // inputs to QuestionCard from parent component QuestionFlow are as follows:
  question, // name of question
  options,  // possible options available for that particular input that the user can select from
  allowMultiple = false, // whether multiple options are allowed
  specificTech = false,
  onNext, // what happens when the user clicks 'Next'
  isLastQuestion = false, // is this qn rendered, the last question?
}: QuestionCardProps) {

  // define states in accordance to what data will be changed on the particular page
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]) // particular option selected by user for that particular question

  // same component is used repeatedly (for diff questions), so every time page is reloaded (to display a new qn), option and tech selections need to be reset
  useEffect(() => {
    setSelectedOptions([])
  }, [question])

  // define a function which saves the options that a user clicks for this particular qn (to be passed to parent component)
  // input: the particular optionId being clicked
  const handleOptionClick = (optionId: string) => {

    // for multi-select questions
    if (allowMultiple) {
      // current option selected needs to be appended to a list of options previously selected
      setSelectedOptions((prev) =>
        // check if current option selected has previously been selected:
        prev.includes(optionId)
            // if yes, it now needs to be desselected (removed from list of selectedOptions)
            // done by filtering optionId out of prev (which is a list of ids)
            ? prev.filter((id) => id !== optionId)
            // if no, it needs to be appended to the previously selected list of options
            : [...prev, optionId],
      )

    // for single-select questions
    } else {
      // list of selected options will always consist of a single answer
      // hence override the variable with every selection
      setSelectedOptions([optionId])
    }
  }

  const handleNext = () => {
    onNext(selectedOptions)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border-4 border-black p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">{question}</h2>

      <div className={specificTech
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          : "space-y-3"
      }>
      {options.map((option) => (
            <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`border-2 border-black rounded-lg transition-all ${
                    specificTech
                        ? 'p-3 text-center' // Style for grid items
                        : 'w-full text-left p-4' // Style for list items
                } ${
                    selectedOptions.includes(option.id)
                        ? "bg-pink-500 text-white" // Style for selected items
                        : "bg-white hover:bg-pink-100" // Style for non-selected items
                }`}
            >
              {option.label}
            </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={selectedOptions.length === 0}
          className={`bg-black text-white hover:bg-pink-600 font-bold py-3 px-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119,1)] transition-all ${
            selectedOptions.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:translate-y-[-2px]"
          }`}
        >
          {isLastQuestion ? "Complete" : "Next"}
        </Button>
      </div>
    </motion.div>
  )
}

