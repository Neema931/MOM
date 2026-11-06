import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import Cartoon from '../components/Cartoon.jsx'
import Hearts from '../components/Hearts.jsx'
import Typewriter from '../components/Typewriter.jsx'

const message = [
  'Happy 55th Birthday to the most precious woman in my life.',
  "I honestly don't think words will ever be enough to express how much you mean to me. As I grow older, I realise more and more just how blessed I am to have you as my mother. Behind the person I am today are countless sacrifices, silent prayers, sleepless nights and unconditional love that I may never fully understand.",
  "Thank you for everything, Mum. Thank you for being strong even on the days you were tired, and for giving so much of yourself to make my life better. I hope you know that none of it goes unnoticed.",
  'As you celebrate 55 years today, my prayer is that the Almighty God continues to order your steps, cover you under His grace and surround you with His unfailing love. May He bless you with divine health, strength, peace and many more fruitful years. May every silent prayer you have whispered find an answer, every tear you have shed be replaced with joy, and every sacrifice you have made return to you as blessings beyond measure. May you never lack, may His favour follow you wherever you go, and may you live to witness generations of blessings. May this new chapter be filled with testimonies that only God can take the glory for.',
  'I hope I make you proud, Mum. I hope one day I can give you even a fraction of the love, comfort and happiness you have given me. No matter how old I get or where life takes me.',
  "Happy 55th Birthday, Mum. May God's goodness and mercy follow you all the days of your life. I love you more than words could ever explain. ❤️",
]

function CelebrationPage({ onReplay }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messageFinished, setMessageFinished] = useState(false)
  const finaleConfettiFiredRef = useRef(false)

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel()
    },
    [],
  )

  useEffect(() => {
    if (!messageFinished || finaleConfettiFiredRef.current) {
      return
    }

    finaleConfettiFiredRef.current = true
    confetti({
      particleCount: 150,
      spread: 115,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.65 },
      colors: ['#E63946', '#FFFFFF', '#FFE5E9', '#FFD166'],
      disableForReducedMotion: true,
    })
  }, [messageFinished])

  function celebrateAgain() {
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#E63946', '#FFFFFF', '#FFE5E9', '#FFD166'],
      disableForReducedMotion: true,
    })
  }

  return (
    <main className="page-shell celebration-page">
      <Hearts />
      <section
        className="content-card celebration-card"
        aria-labelledby="celebration-title"
      >
        <h1 className="page-title" id="celebration-title">
          Happy Birthday Mum{' '}
          <span aria-label="love" className="title-heart">
            ❤️
          </span>
        </h1>
        <div className="cartoon-message-layout">
          <div className="cartoon-portrait">
            <Cartoon isSpeaking={isSpeaking} />
          </div>
          <div className="message-card">
            <div className="celebration-message">
              <Typewriter
                onSpeaking={setIsSpeaking}
                onComplete={() => setMessageFinished(true)}
                paragraphs={message}
              />
            </div>
          </div>
        </div>
        {messageFinished && (
          <p className="final-love-message">
            I love you, Mum <span aria-hidden="true">❤️</span>
          </p>
        )}
        <div className="button-row">
          <button className="primary-button" onClick={celebrateAgain} type="button">
            More confetti, please!
          </button>
          {messageFinished && (
            <button className="secondary-button" onClick={onReplay} type="button">
              Replay 🎁
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default CelebrationPage
