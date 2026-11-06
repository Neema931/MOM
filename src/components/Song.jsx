import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const audioAssets = import.meta.glob('../assets/audio/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
})
const musicUrl = audioAssets['../assets/audio/happy-birthday-instrumental.mp3']
const ululationUrl =
  audioAssets['../assets/audio/ululation.mp3'] ??
  audioAssets['../assets/audio/ululation.mp3.mp3']
const musicVolume = 0.5
const reportedMissingAssets = new Set()

function reportMissingAsset(name, path) {
  if (reportedMissingAssets.has(name)) {
    return
  }
  reportedMissingAssets.add(name)
  console.error(`Missing ${name} audio asset: ${path}`)
}

const Song = forwardRef(function Song(_props, ref) {
  const [isMuted, setIsMuted] = useState(false)
  const [audioStatus, setAudioStatus] = useState(
    musicUrl ? 'loading' : 'missing',
  )
  const musicRef = useRef(null)
  const ululationRef = useRef(null)
  const mutedRef = useRef(false)
  const startedRef = useRef(false)
  const activeRef = useRef(false)
  const finishingRef = useRef(false)
  const expectedPauseRef = useRef(false)
  const fadeTimerRef = useRef(null)

  const clearFade = useCallback(() => {
    window.clearInterval(fadeTimerRef.current)
    fadeTimerRef.current = null
  }, [])

  const playMusic = useCallback((audio) => {
    if (!audio || mutedRef.current) {
      return
    }

    audio.muted = false
    audio.play().catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Unable to play the birthday instrumental.', error)
      }
    })
  }, [])

  const start = useCallback(() => {
    if (!musicUrl) {
      reportMissingAsset(
        'birthday music',
        'src/assets/audio/happy-birthday-instrumental.mp3',
      )
      return
    }

    const audio = musicRef.current
    if (!audio) {
      console.error('Birthday music has not finished initializing.')
      return
    }

    clearFade()
    startedRef.current = true
    activeRef.current = true
    finishingRef.current = false
    audio.loop = true
    audio.volume = musicVolume
    audio.muted = mutedRef.current
    playMusic(audio)
  }, [clearFade, playMusic])

  const playUlulation = useCallback(() => {
    if (!ululationUrl) {
      reportMissingAsset('ululation', 'src/assets/audio/ululation.mp3')
      return
    }

    const audio = ululationRef.current
    if (!audio) {
      console.error('Ululation audio has not finished initializing.')
      return
    }

    audio.currentTime = 0
    audio.play().catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Unable to play ululation audio.', error)
      }
    })
  }, [])

  const setActive = useCallback(
    (isActive) => {
      activeRef.current = isActive
      if (isActive && startedRef.current && !finishingRef.current) {
        playMusic(musicRef.current)
      }
    },
    [playMusic],
  )

  const fadeOut = useCallback(() => {
    const audio = musicRef.current
    activeRef.current = false
    if (!audio || mutedRef.current || audio.paused) {
      finishingRef.current = true
      return
    }

    clearFade()
    finishingRef.current = true
    const startingVolume = audio.volume
    const fadeDuration = 3000
    const fadeStartedAt = Date.now()

    fadeTimerRef.current = window.setInterval(() => {
      const progress = Math.min((Date.now() - fadeStartedAt) / fadeDuration, 1)
      audio.volume = startingVolume * (1 - progress)

      if (progress === 1) {
        clearFade()
        expectedPauseRef.current = true
        audio.pause()
        audio.currentTime = 0
        audio.volume = musicVolume
      }
    }, 60)
  }, [clearFade])

  const cancelFade = useCallback(() => {
    clearFade()
    finishingRef.current = false
    activeRef.current = false
    if (!startedRef.current || mutedRef.current) {
      return
    }

    const audio = musicRef.current
    if (audio) {
      audio.volume = musicVolume
      playMusic(audio)
    }
  }, [clearFade, playMusic])

  useImperativeHandle(
    ref,
    () => ({ start, playUlulation, setActive, fadeOut, cancelFade }),
    [cancelFade, fadeOut, playUlulation, setActive, start],
  )

  useEffect(() => {
    const music = musicUrl ? new Audio(musicUrl) : null
    const ululation = ululationUrl ? new Audio(ululationUrl) : null
    const cleanupHandlers = []
    musicRef.current = music
    ululationRef.current = ululation

    if (!music) {
      reportMissingAsset(
        'birthday music',
        'src/assets/audio/happy-birthday-instrumental.mp3',
      )
    } else {
      music.preload = 'auto'
      music.loop = true
      music.volume = musicVolume
      const markReady = () => setAudioStatus('ready')
      const markError = () => {
        setAudioStatus('error')
        console.error('Unable to preload the birthday instrumental.')
      }
      music.addEventListener('canplaythrough', markReady, { once: true })
      music.addEventListener('error', markError, { once: true })
      cleanupHandlers.push(() => {
        music.removeEventListener('canplaythrough', markReady)
        music.removeEventListener('error', markError)
      })

      const restartIfNeeded = () => {
        if (expectedPauseRef.current) {
          expectedPauseRef.current = false
          return
        }

        if (
          !startedRef.current ||
          !activeRef.current ||
          mutedRef.current ||
          finishingRef.current
        ) {
          return
        }

        music.currentTime = 0
        playMusic(music)
      }
      music.addEventListener('ended', restartIfNeeded)
      music.addEventListener('pause', restartIfNeeded)
      cleanupHandlers.push(() => {
        music.removeEventListener('ended', restartIfNeeded)
        music.removeEventListener('pause', restartIfNeeded)
      })
      music.load()

      if (music.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        setAudioStatus('ready')
      }
    }

    if (ululation) {
      ululation.preload = 'auto'
      ululation.load()
    } else {
      reportMissingAsset('ululation', 'src/assets/audio/ululation.mp3')
    }

    return () => {
      clearFade()
      cleanupHandlers.forEach((cleanup) => cleanup())
      music?.pause()
      ululation?.pause()
      musicRef.current = null
      ululationRef.current = null
    }
  }, [clearFade, playMusic])

  useEffect(() => {
    mutedRef.current = isMuted
    const music = musicRef.current
    if (music) {
      music.muted = isMuted
      if (!isMuted && startedRef.current && activeRef.current) {
        playMusic(music)
      }
    }
  }, [isMuted, playMusic])

  function toggleMute() {
    const nextMuted = !mutedRef.current
    mutedRef.current = nextMuted
    setIsMuted(nextMuted)
    if (musicRef.current) {
      musicRef.current.muted = nextMuted
    }
  }

  return (
    <>
      <button
        aria-label={isMuted ? 'Unmute birthday music' : 'Mute birthday music'}
        aria-pressed={isMuted}
        className="audio-toggle"
        onClick={toggleMute}
        type="button"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path
            d="M16 27S4 20 4 11.5C4 7 9.5 4.5 13 8l3 3 3-3c3.5-3.5 9-1 9 3.5C28 20 16 27 16 27Z"
            fill="currentColor"
          />
          {isMuted && (
            <path
              d="m8 8 16 16"
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="3"
            />
          )}
        </svg>
      </button>
      <span aria-live="polite" className="audio-status">
        {audioStatus === 'loading' && 'Getting the music ready…'}
        {audioStatus === 'ready' && 'Music ready'}
        {audioStatus === 'missing' && 'Birthday music unavailable'}
        {audioStatus === 'error' && 'Audio could not be loaded'}
      </span>
    </>
  )
})

export default Song
