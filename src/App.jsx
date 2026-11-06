import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import CelebrationPage from './pages/CelebrationPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import Song from './components/Song.jsx'

const confettiColors = ['#E63946', '#FFFFFF', '#FFE5E9', '#FFD166']

function App() {
  const [stage, setStage] = useState('welcome')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const songRef = useRef(null)
  const confettiTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const enterTimerRef = useRef(null)

  useEffect(
    () => () => {
      window.clearTimeout(confettiTimerRef.current)
      window.clearTimeout(transitionTimerRef.current)
      window.clearTimeout(enterTimerRef.current)
    },
    [],
  )

  function handleGiftTap() {
    window.clearTimeout(confettiTimerRef.current)
    songRef.current?.playUlulation()
    songRef.current?.start()

    const startedAt = Date.now()
    const fireBurst = () => {
      const timeRemaining = 4000 - (Date.now() - startedAt)
      if (timeRemaining < 0) {
        return
      }

      const particleCount = Math.max(2, Math.ceil(8 * (timeRemaining / 4000)))
      const origins = [
        { x: 0.04, y: 1 },
        { x: 0.5, y: 0.88 },
        { x: 0.96, y: 1 },
      ]

      origins.forEach((origin, index) => {
        confetti({
          particleCount,
          angle: index === 0 ? 60 : index === 2 ? 120 : 90,
          spread: index === 1 ? 80 : 55,
          startVelocity: index === 1 ? 36 : 48,
          origin,
          colors: confettiColors,
          ticks: 180,
          disableForReducedMotion: true,
        })
      })

      confettiTimerRef.current = window.setTimeout(fireBurst, 220)
    }

    fireBurst()
  }

  const transitionTo = useCallback((nextStage) => {
    window.clearTimeout(transitionTimerRef.current)
    window.clearTimeout(enterTimerRef.current)
    setIsTransitioning(true)
    transitionTimerRef.current = window.setTimeout(() => {
      setStage(nextStage)
      setIsTransitioning(false)
      setIsEntering(true)
      enterTimerRef.current = window.setTimeout(() => {
        setIsEntering(false)
      }, 520)
    }, 420)
  }, [])

  const handleReadingChange = useCallback((isActive) => {
    songRef.current?.setActive(isActive)
  }, [])

  const handleMessageComplete = useCallback(() => {
    songRef.current?.fadeOut()
  }, [])

  const handleReplay = useCallback(() => {
    songRef.current?.cancelFade()
    transitionTo('welcome')
  }, [transitionTo])

  return (
    <>
      <Song ref={songRef} />
      {stage === 'celebration' ? (
        <div
          className={`app-stage${isTransitioning ? ' app-stage--leaving' : ''}${isEntering ? ' app-stage--entering' : ''}`}
        >
          <CelebrationPage
            onReadingChange={handleReadingChange}
            onReplay={handleReplay}
            onComplete={handleMessageComplete}
          />
        </div>
      ) : (
        <div
          className={`app-stage${isTransitioning ? ' app-stage--leaving' : ''}${isEntering ? ' app-stage--entering' : ''}`}
        >
          <WelcomePage
            onTap={handleGiftTap}
            onOpen={() => transitionTo('celebration')}
          />
        </div>
      )}
    </>
  )
}

export default App
