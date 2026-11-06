import { useEffect, useState } from 'react'

function GiftBox({ onTap, onOpen }) {
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    if (!isOpening) {
      return undefined
    }

    const timeoutId = window.setTimeout(onOpen, 2000)
    return () => window.clearTimeout(timeoutId)
  }, [isOpening, onOpen])

  function handleOpen() {
    if (!isOpening) {
      setIsOpening(true)
      onTap()
    }
  }

  return (
    <button
      className={`gift-button${isOpening ? ' gift-button--opening' : ''}`}
      onClick={handleOpen}
      type="button"
      disabled={isOpening}
      aria-label="Open the gift and see the rumours"
    >
      <span className="gift-box" aria-hidden="true">
        <span className="gift-ribbon" />
        <span className="gift-lid">
          <span className="gift-bow" />
        </span>
        <span className="gift-hearts">
          <span className="gift-heart">♥</span>
          <span className="gift-heart">♡</span>
          <span className="gift-heart">♥</span>
        </span>
      </span>
      <span className="gift-label">Tap to open!</span>
    </button>
  )
}

export default GiftBox
