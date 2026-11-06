function Cartoon({ isSpeaking = false }) {
  return (
    <svg
      className={`cartoon${isSpeaking ? ' cartoon--speaking' : ''}`}
      viewBox="0 0 220 250"
      role="img"
      aria-label="A happy cartoon girl wearing a red party hat"
    >
      <ellipse cx="110" cy="235" rx="66" ry="9" fill="#f3cfd5" opacity=".7" />
      <path
        d="M47 229c4-42 24-66 63-66s59 24 63 66H47Z"
        fill="#e63946"
      />
      <path
        d="M84 174c8 11 17 17 26 17s18-6 26-17l13 55H71l13-55Z"
        fill="#fff"
      />
      <path
        d="M76 134c-9-13-13-28-13-45 0-35 21-58 47-58 27 0 47 23 47 58 0 17-4 32-13 45l-20 23h-28l-20-23Z"
        fill="#70483f"
      />
      <path
        d="M70 97c0-34 17-53 40-53s40 19 40 53c0 34-18 59-40 59S70 131 70 97Z"
        fill="#ffd7b8"
      />
      <path
        d="M62 88c2-42 20-67 49-67 27 0 46 23 48 65-10-5-17-15-20-28-12 15-37 25-77 30Z"
        fill="#70483f"
      />
      <path
        d="m73 71-8-43c19 8 34 8 45-3 15 13 29 15 44 8l-8 43c-12-10-24-17-36-17-13 0-25 5-37 12Z"
        fill="#e63946"
      />
      <path
        d="M106 27c4-8 8-11 13-16 5 5 9 10 11 19"
        fill="none"
        stroke="#c1121f"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path d="m121 8 5-7 5 7-5 5-5-5Z" fill="#ffd166" />
      <circle cx="87" cy="103" r="13" fill="#fff" />
      <circle cx="133" cy="103" r="13" fill="#fff" />
      <g className="cartoon-eyes">
        <ellipse cx="89" cy="105" rx="5.5" ry="8" fill="#49332f" />
        <ellipse cx="131" cy="105" rx="5.5" ry="8" fill="#49332f" />
        <circle cx="91" cy="102" r="2" fill="#fff" />
        <circle cx="133" cy="102" r="2" fill="#fff" />
      </g>
      <ellipse cx="76" cy="124" rx="11" ry="6" fill="#f28e9b" opacity=".7" />
      <ellipse cx="144" cy="124" rx="11" ry="6" fill="#f28e9b" opacity=".7" />
      <path
        className="cartoon-mouth-closed"
        d="M101 130c5 7 13 7 18 0"
        fill="none"
        stroke="#a64751"
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <ellipse
        className="cartoon-mouth-open"
        cx="110"
        cy="132"
        rx="7"
        ry="9"
        fill="#a64751"
      />
      <path d="M106 137c2 2 6 2 8 0" fill="none" stroke="#f8a5a8" strokeWidth="2" />
      <path
        d="M179 129c-8-8-21-2-21 8 0 11 21 24 21 24s21-13 21-24c0-10-13-16-21-8Z"
        fill="#e63946"
        stroke="#fff"
        strokeWidth="3"
      />
      <path d="M170 137c2-3 6-4 9-2" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

export default Cartoon
