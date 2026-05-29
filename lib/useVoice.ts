'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Thin wrapper around the browser SpeechRecognition + SpeechSynthesis APIs.
// Gracefully degrades: if the browser has no support, `supported` is false
// and the UI simply hides the mic button.

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

export function useVoice(lang = 'zh-CN') {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (Ctor) {
      const recognition: SpeechRecognitionLike = new Ctor()
      recognition.lang = lang
      recognition.interimResults = false
      recognition.continuous = false
      recognitionRef.current = recognition
      setSupported(true)
    }
  }, [lang])

  const listen = useCallback((onResult: (transcript: string) => void) => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript ?? ''
      if (transcript) onResult(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    try {
      setListening(true)
      recognition.start()
    } catch {
      setListening(false)
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      } catch {
        /* ignore */
      }
    },
    [lang],
  )

  return { supported, listening, listen, stop, speak }
}
