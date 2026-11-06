import { useEffect, useRef, useState } from 'react'

const narrationAssets = import.meta.glob('../assets/audio/background.mp3.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
})
const narrationUrl = narrationAssets['../assets/audio/background.mp3.mp3']

function Typewriter({ paragraphs, onSpeaking, onComplete }) {
  const [progress, setProgress] = useState({
    paragraphIndex: 0,
    characterIndex: 0,
    complete: paragraphs.length === 0,
  })
  const [audioError, setAudioError] = useState('')
  const cursorRef = useRef(null)
  const audioRef = useRef(null)
  const syncIntervalRef = useRef(null)
  const completedRef = useRef(false)
  const callbacksRef = useRef({ onSpeaking, onComplete })

  useEffect(() => {
    callbacksRef.current = { onSpeaking, onComplete }
  }, [onSpeaking, onComplete])

  useEffect(() => {
    if (!narrationUrl) {
      console.error('Narration audio is missing: background.mp3.mp3')
      callbacksRef.current.onSpeaking?.(false)
      return undefined
    }

    const audio = new Audio(narrationUrl)
    audioRef.current = audio
    completedRef.current = false

    function finish() {
      if (completedRef.current) return
      completedRef.current = true
      window.clearInterval(syncIntervalRef.current)
      callbacksRef.current.onSpeaking?.(false)
      setProgress({
        paragraphIndex: paragraphs.length - 1,
        characterIndex: paragraphs.at(-1)?.length ?? 0,
        complete: true,
      })
      callbacksRef.current.onComplete?.()
    }

    function syncTextToAudio() {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return

      const progressRatio = Math.min(audio.currentTime / audio.duration, 1)
      const totalCharacters = paragraphs.reduce(
        (total, paragraph) => total + paragraph.length,
        0,
      )
      let charactersToReveal = Math.floor(totalCharacters * progressRatio)
      let paragraphIndex = 0

      while (
        paragraphIndex < paragraphs.length - 1 &&
        charactersToReveal >= paragraphs[paragraphIndex].length
      ) {
        charactersToReveal -= paragraphs[paragraphIndex].length
        paragraphIndex += 1
      }

      setProgress({
        paragraphIndex,
        characterIndex: Math.min(
          charactersToReveal,
          paragraphs[paragraphIndex].length,
        ),
        complete: false,
      })
    }

    syncIntervalRef.current = window.setInterval(syncTextToAudio, 40)
    audio.preload = 'auto'
    audio.volume = 1
    audio.addEventListener('playing', () => {
      callbacksRef.current.onSpeaking?.(true)
      setAudioError('')
    })
    audio.addEventListener('pause', () => {
      callbacksRef.current.onSpeaking?.(false)
    })
    audio.addEventListener('ended', finish)
    audio.addEventListener('error', () => {
      const error = 'Unable to play the narration audio.'
      console.error(error)
      setAudioError(error)
      callbacksRef.current.onSpeaking?.(false)
    })

    audio.play().catch((error) => {
      if (error.name === 'AbortError') return
      console.error('Unable to start the narration audio.', error)
      setAudioError(
        'Narration audio could not be played. Tap Skip to read the message without audio.',
      )
      callbacksRef.current.onSpeaking?.(false)
    })

    return () => {
      window.clearInterval(syncIntervalRef.current)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [paragraphs])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const bounds = cursor.getBoundingClientRect()
    if (bounds.bottom > window.innerHeight - 24 || bounds.top < 0) {
      cursor.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [progress.characterIndex, progress.paragraphIndex])

  function skip() {
    if (completedRef.current) return
    completedRef.current = true
    window.clearInterval(syncIntervalRef.current)
    audioRef.current?.pause()
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    setProgress({
      paragraphIndex: paragraphs.length - 1,
      characterIndex: paragraphs.at(-1)?.length ?? 0,
      complete: true,
    })
    callbacksRef.current.onSpeaking?.(false)
    callbacksRef.current.onComplete?.()
  }

  const visibleParagraphCount = progress.complete
    ? paragraphs.length
    : Math.min(progress.paragraphIndex + 1, paragraphs.length)
  const displayedAudioError =
    audioError ||
    (!narrationUrl ? 'Narration audio is missing: background.mp3.mp3' : '')

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
      {displayedAudioError && (
        <p className="typewriter-audio-error">{displayedAudioError}</p>
      )}
      {!progress.complete && (
        <button
          className="speech-button typewriter-skip"
          onClick={skip}
          type="button"
        >
          Skip
        </button>
      )}
    </div>
  )
}

export default Typewriter
