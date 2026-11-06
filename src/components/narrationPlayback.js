const narrationAssets = import.meta.glob('../assets/audio/background.mp3.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
})
const narrationUrl = narrationAssets['../assets/audio/background.mp3.mp3']

let narrationAudio
let stopSilentPlayback

export function getNarrationAudio() {
  if (!narrationUrl) return null

  if (!narrationAudio) {
    narrationAudio = new Audio(narrationUrl)
    narrationAudio.preload = 'auto'
    narrationAudio.volume = 1
  }

  return narrationAudio
}

export function hasNarrationAudio() {
  return Boolean(narrationUrl)
}

export function playNarrationAudio() {
  const audio = getNarrationAudio()
  if (!audio) return Promise.reject(new Error('Narration audio is missing.'))

  if (stopSilentPlayback) {
    audio.removeEventListener('playing', stopSilentPlayback)
    stopSilentPlayback = undefined
  }
  audio.muted = false
  return audio.play()
}

export function prepareNarrationFromGesture() {
  const audio = getNarrationAudio()
  if (!audio) {
    console.error('Narration audio is missing: background.mp3.mp3')
    return
  }

  audio.pause()
  audio.currentTime = 0
  audio.volume = 1
  audio.muted = true

  stopSilentPlayback = () => {
    audio.pause()
    audio.currentTime = 0
    audio.muted = false
    audio.removeEventListener('playing', stopSilentPlayback)
    stopSilentPlayback = undefined
  }

  audio.addEventListener('playing', stopSilentPlayback)
  audio.play().catch((error) => {
    audio.removeEventListener('playing', stopSilentPlayback)
    stopSilentPlayback = undefined
    audio.muted = false
    if (error.name !== 'AbortError') {
      console.warn('Narration playback will require a tap to start.', error)
    }
  })
}
