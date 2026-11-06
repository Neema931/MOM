let audioContext
const gainNodes = new WeakMap()

function getAudioContext() {
  if (!audioContext) {
    const AudioContextConstructor =
      window.AudioContext ?? window.webkitAudioContext
    if (!AudioContextConstructor) return null
    audioContext = new AudioContextConstructor()
  }

  return audioContext
}

export function resumeAudioContext() {
  const context = getAudioContext()
  if (context?.state === 'suspended') {
    context.resume().catch((error) => {
      console.error('Unable to resume audio playback.', error)
    })
  }
}

export function setMediaVolume(audio, volume) {
  const context = getAudioContext()
  if (!context) {
    audio.volume = volume
    return
  }

  try {
    let gain = gainNodes.get(audio)
    if (!gain) {
      const source = context.createMediaElementSource(audio)
      gain = context.createGain()
      source.connect(gain)
      gain.connect(context.destination)
      gainNodes.set(audio, gain)
    }

    audio.volume = 1
    gain.gain.value = volume
  } catch (error) {
    console.error('Unable to apply audio volume through Web Audio.', error)
    audio.volume = volume
  }
}
