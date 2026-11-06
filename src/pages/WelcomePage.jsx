import GiftBox from '../components/GiftBox.jsx'
import Hearts from '../components/Hearts.jsx'

function WelcomePage({ onTap, onOpen }) {
  return (
    <main className="page-shell welcome-screen">
      <Hearts />
      <section className="welcome-content" aria-labelledby="welcome-title">
        <h1 className="welcome-message" id="welcome-title" font size = "10px">
          Hello Veronica!! 💖 I heard a rumor that today is someone&apos;s special
          day. Tap this box to see the rumours
        </h1>
        <svg
          className="welcome-arrow"
          viewBox="0 0 32 42"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M16 3v29m-11-11 11 12 11-12"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />
        </svg>
      </section>
      <div className="welcome-gift">
        <GiftBox onTap={onTap} onOpen={onOpen} />
      </div>
    </main>
  )
}

export default WelcomePage
