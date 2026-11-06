import { useEffect, useRef, useState } from 'react'

const hearts = [
  { left: '7%', delay: '0s', duration: '24s', size: '9px' },
  { left: '18%', delay: '7s', duration: '28s', size: '7px' },
  { left: '31%', delay: '3s', duration: '25s', size: '10px' },
  { left: '47%', delay: '11s', duration: '29s', size: '7px' },
  { left: '61%', delay: '5s', duration: '26s', size: '9px' },
  { left: '73%', delay: '14s', duration: '30s', size: '7px' },
  { left: '88%', delay: '2s', duration: '27s', size: '10px' },
  { left: '95%', delay: '17s', duration: '29s', size: '8px' },
]

function Hearts() {
  const [tapBursts, setTapBursts] = useState([])
  const burstIdRef = useRef(0)
  const timersRef = useRef(new Set())

  useEffect(() => {
    const timers = timersRef.current

    function handlePointerDown(event) {
      if (event.target.closest('button, a, input, textarea, select')) {
        return
      }

      const page = event.target.closest('.page-shell')
      if (!page) {
        return
      }

      const bounds = page.getBoundingClientRect()
      const burstId = burstIdRef.current++
      const burstHearts = Array.from({ length: 7 }, (_, index) => ({
        id: `${burstId}-${index}`,
        offsetX: (Math.random() - 0.5) * 90,
        offsetY: (Math.random() - 0.5) * 32,
        delay: index * 55,
      }))

      setTapBursts((current) => [
        ...current.slice(-4),
        {
          id: burstId,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          hearts: burstHearts,
        },
      ])

      const timeoutId = window.setTimeout(() => {
        timersRef.current.delete(timeoutId)
        setTapBursts((current) =>
          current.filter((burst) => burst.id !== burstId),
        )
      }, 1900)
      timersRef.current.add(timeoutId)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      timers.forEach(window.clearTimeout)
      timers.clear()
    }
  }, [])

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((heart, index) => (
        <span
          className="floating-heart"
          key={heart.left}
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.size,
          }}
        >
          {index % 2 === 0 ? '♥' : '♡'}
        </span>
      ))}
      {tapBursts.flatMap((burst) =>
        burst.hearts.map((heart) => (
          <span
            className="tap-heart"
            key={heart.id}
            style={{
              left: `${burst.x + heart.offsetX}px`,
              top: `${burst.y + heart.offsetY}px`,
              animationDelay: `${heart.delay}ms`,
            }}
          >
            ♥
          </span>
        )),
      )}
    </div>
  )
}

export default Hearts
