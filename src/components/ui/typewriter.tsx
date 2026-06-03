"use client"

import React, { useEffect, useState } from "react"

interface TypewriterProps {
  words: string[]
  speed?: number
  delayBetweenWords?: number
  cursor?: boolean
  cursorChar?: string
}

export function Typewriter({
  words,
  speed = 100,
  delayBetweenWords = 2000,
  cursor = true,
  cursorChar = "|",
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const currentWord = words[wordIndex]

  useEffect(() => {
    // Se a palavra já terminou, nós simplesmente não fazemos nada e paramos o timer
    if (charIndex === currentWord.length) {
      return;
    }

    const timeout = setTimeout(
      () => {
        // Typing logic
        if (charIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }
      },
      speed,
    )

    return () => clearTimeout(timeout)
  }, [charIndex, currentWord, speed])

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor) return

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [cursor])

  return (
    <div className="inline-block">
      <span>
        {displayText}
        {cursor && (
          <span className="ml-1 transition-opacity duration-75" style={{ opacity: showCursor ? 1 : 0 }}>
            {cursorChar}
          </span>
        )}
      </span>
    </div>
  )
}
