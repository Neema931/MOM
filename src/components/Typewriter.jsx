import { useEffect, useRef, useState } from 'react'

const sentencePattern = /[^.!?]+[.!?]+(?:["'’”)]*)|[^.!?]+$/g
const estimatedCharactersPerSecond = 13
const utteranceSettings = {
  volume: 1,
  rate: 0.9,
  pitch: 1.2,
}

function splitIntoSentences(paragraph) {
  const sentences = []
  for (const match of paragraph.matchAll(sentencePattern)) {
    const text = match[0]
    const spokenText = text.trim()
    if (spokenText) {
      sentences.push({
        text: spokenText,
        start: match.index + text.indexOf(spokenText),
        end: match.index + text.indexOf(spokenText) + spokenText.length,
      })
    }
  }
  return sentences
}

function chooseEnglishVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const femaleVoicePattern = /female|woman|samantha|victoria|karen|zira|susan|moira|tessa|serena/i

  return (
    englishVoices.find(
      (voice) =>
        voice.gender?.toLowerCase() === 'female' ||
        femaleVoicePattern.test(voice.name),
    ) ??
    englishVoices[0] ??
    null
  )
}

function Typewriter({
  paragraphs,
  paragraphPause = 800,
  onSpeaking,
  onComplete,
}) {
  const [progress, setProgress] = useState({
    paragraphIndex: 0,
    characterIndex: 0,
    complete: paragraphs.length === 0,
  })
  const cursorRef = useRef(null)
  const activeUtteranceRef = useRef(null)
  const resolveUtteranceRef = useRef(null)
  const generationRef = useRef(0)
  const revealIntervalRef = useRef(null)
  const pauseTimeoutRef = useRef(null)
  const callbacksRef = useRef({ onSpeaking, onComplete })

  callbacksRef.current = { onSpeaking, onComplete }

  useEffect(() => {
    const generation = ++generationRef.current
    let cancelled = false
    let currentParagraphIndex = 0

    function finish() {
      if (cancelled || generation !== generationRef.current) {
        return
      }

      callbacksRef.current.onSpeaking?.(false)
      setProgress({
        paragraphIndex: paragraphs.length - 1,
        characterIndex: paragraphs.at(-1)?.length ?? 0,
        complete: true,
      })
      callbacksRef.current.onComplete?.()
    }

    function speakSentence(sentence, paragraphIndex) {
      return new Promise((resolve) => {
        if (cancelled || generation !== generationRef.current) {
          resolve()
          return
        }

        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
          callbacksRef.current.onSpeaking?.(false)
          const duration = Math.max(
            300,
            (sentence.text.length / estimatedCharactersPerSecond) * 1000,
          )
          let elapsed = 0
          revealIntervalRef.current = window.setInterval(() => {
            elapsed += 40
            const progressAmount = Math.min(elapsed / duration, 1)
            setProgress({
              paragraphIndex,
              characterIndex: Math.max(
                sentence.start,
                Math.round(sentence.start + (sentence.end - sentence.start) * progressAmount),
              ),
              complete: false,
            })
            if (progressAmount === 1) {
              window.clearInterval(revealIntervalRef.current)
              revealIntervalRef.current = null
              callbacksRef.current.onSpeaking?.(false)
              resolve()
            }
          }, 40)
          return
        }

        const utterance = new window.SpeechSynthesisUtterance(sentence.text)
        const duration = Math.max(
          300,
          (sentence.text.length / estimatedCharactersPerSecond) * 1000,
        )
        const startedAt = Date.now()
        let lastCharacterIndex = 0
        let settled = false
        activeUtteranceRef.current = utterance
        Object.assign(utterance, utteranceSettings)

        const voice = chooseEnglishVoice()
        if (voice) {
          utterance.voice = voice
        }

        function settle() {
          if (settled) return
          settled = true
          window.clearInterval(revealIntervalRef.current)
          revealIntervalRef.current = null
          if (activeUtteranceRef.current === utterance) {
            activeUtteranceRef.current = null
          }
          callbacksRef.current.onSpeaking?.(false)
          resolveUtteranceRef.current = null
          resolve()
        }
        resolveUtteranceRef.current = settle

        revealIntervalRef.current = window.setInterval(() => {
          const estimatedCharacters = Math.floor(
            ((Date.now() - startedAt) / duration) * sentence.text.length,
          )
          lastCharacterIndex = Math.max(lastCharacterIndex, estimatedCharacters)
          setProgress({
            paragraphIndex,
            characterIndex: Math.min(
              sentence.end,
              sentence.start + lastCharacterIndex,
            ),
            complete: false,
          })
        }, 40)

        utterance.onstart = () => callbacksRef.current.onSpeaking?.(true)
        utterance.onboundary = (event) => {
          const boundaryIndex = Math.min(
            sentence.text.length,
            event.charIndex + Math.max(event.charLength ?? 1, 1),
          )
          lastCharacterIndex = Math.max(lastCharacterIndex, boundaryIndex)
          setProgress({
            paragraphIndex,
            characterIndex: Math.min(
              sentence.end,
              sentence.start + lastCharacterIndex,
            ),
            complete: false,
          })
        }
        utterance.onend = () => {
          setProgress({
            paragraphIndex,
            characterIndex: sentence.end,
            complete: false,
          })
          settle()
        }
        utterance.onerror = (event) => {
          if (event.error !== 'canceled' && event.error !== 'interrupted') {
            console.error('Unable to speak a message sentence.', event.error)
          }
          settle()
        }

        window.speechSynthesis.speak(utterance)
      })
    }

    async function readMessage() {
      if (paragraphs.length === 0) {
        finish()
        return
      }

      for (currentParagraphIndex = 0; currentParagraphIndex < paragraphs.length; currentParagraphIndex += 1) {
        if (cancelled || generation !== generationRef.current) return
        const paragraph = paragraphs[currentParagraphIndex]
        setProgress({
          paragraphIndex: currentParagraphIndex,
          characterIndex: 0,
          complete: false,
        })

        const sentences = splitIntoSentences(paragraph)
        if (sentences.length === 0) {
          setProgress({
            paragraphIndex: currentParagraphIndex,
            characterIndex: paragraph.length,
            complete: false,
          })
        }

        for (const sentence of sentences) {
          if (cancelled || generation !== generationRef.current) return
          await speakSentence(sentence, currentParagraphIndex)
        }

        setProgress({
          paragraphIndex: currentParagraphIndex,
          characterIndex: paragraph.length,
          complete: false,
        })

        if (currentParagraphIndex < paragraphs.length - 1) {
          callbacksRef.current.onSpeaking?.(false)
          await new Promise((resolve) => {
            pauseTimeoutRef.current = window.setTimeout(() => {
              pauseTimeoutRef.current = null
              resolve()
            }, paragraphPause)
          })
        }
      }

      finish()
    }

    window.speechSynthesis?.cancel()
    readMessage()

    return () => {
      cancelled = true
      generationRef.current += 1
      window.clearTimeout(pauseTimeoutRef.current)
      window.clearInterval(revealIntervalRef.current)
      pauseTimeoutRef.current = null
      revealIntervalRef.current = null
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null
        activeUtteranceRef.current.onerror = null
        activeUtteranceRef.current.onboundary = null
        activeUtteranceRef.current = null
        window.speechSynthesis?.cancel()
      }
    }
  }, [paragraphPause, paragraphs])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const bounds = cursor.getBoundingClientRect()
    if (bounds.bottom > window.innerHeight - 24 || bounds.top < 0) {
      cursor.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [progress.characterIndex, progress.paragraphIndex])

  function skip() {
    generationRef.current += 1
    window.clearTimeout(pauseTimeoutRef.current)
    window.clearInterval(revealIntervalRef.current)
    pauseTimeoutRef.current = null
    revealIntervalRef.current = null
    if (activeUtteranceRef.current) {
      activeUtteranceRef.current.onend = null
      activeUtteranceRef.current.onerror = null
      activeUtteranceRef.current.onboundary = null
      activeUtteranceRef.current = null
    } 
    resolveUtteranceRef.current?.()
    window.speechSynthesis?.cancel()
    onSpeaking?.(false)
    setProgress({
      paragraphIndex: paragraphs.length - 1,
      characterIndex: paragraphs.at(-1)?.length ?? 0,
      complete: true,
    })
    onComplete?.()
  }

  const visibleParagraphCount = progress.complete
    ? paragraphs.length
    : Math.min(progress.paragraphIndex + 1, paragraphs.length)

  return (
    <div className="typewriter-content">
      <div aria-live="polite" className="typewriter-text">
        {paragraphs.slice(0, visibleParagraphCount).map((paragraph, index) => {
          const visibleText =
            progress.complete || index < progress.paragraphIndex
              ? paragraph
              : paragraph.slice(
                  0,
                  index === progress.paragraphIndex ? progress.characterIndex : 0,
                )

          return (
            <p className="typewriter-paragraph" key={`${index}-${paragraph}`}>
              {visibleText}
              {!progress.complete && index === progress.paragraphIndex && (
                <span
                  aria-hidden="true"
                  className="typewriter-cursor"
                  ref={cursorRef}
                  style={{ scrollMarginBlock: '96px' }}
                >
                  ♥
                </span>
              )}
            </p>
          )
        })}
      </div>
      {!progress.complete && (
        <button className="speech-button typewriter-skip" onClick={skip} type="button">
          Skip
        </button>
      )}
    </div>
  )
}

export default Typewriter
