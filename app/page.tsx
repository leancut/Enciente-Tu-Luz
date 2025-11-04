'use client'

import { useState, useRef } from 'react'

export default function HomePage() {
  const [isOn, setIsOn] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const torchTrackRef = useRef<MediaStreamTrack | null>(null)

  // 🔥 Encender llama, nota y linterna
  const handleStart = async () => {
    if (isOn) return
    setIsOn(true)

    // --- sonido ---
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const notes = ['do', 'mi', 'sol']
      const note = notes[Math.floor(Math.random() * notes.length)]
      const freqs: Record<string, number> = { do: 261.63, mi: 329.63, sol: 392.0 }

      osc.frequency.setValueAtTime(freqs[note], ctx.currentTime)
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.08, ctx.currentTime) // Volumen más bajo

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()

      audioCtxRef.current = ctx
      oscillatorRef.current = osc
    } catch (e) {
      console.warn('Audio no disponible', e)
    }

    // --- linterna ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          advanced: [{ torch: true }] as any
        }
      })
      const track = stream.getVideoTracks()[0]
      const capabilities = (track as any).getCapabilities?.() ?? {}
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: true }] as any
        })
        torchTrackRef.current = track
      } else {
        // fallback: mantén el stream (no torch) si quieres mostrar preview u otra cosa
        stream.getTracks().forEach(t => t.stop())
      }
    } catch (e) {
      console.warn('Torch no disponible', e)
    }
  }

  // 💧 Apagar todo
  const handleStop = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
    }
    if (torchTrackRef.current) {
      torchTrackRef.current.stop()
      torchTrackRef.current = null
    }
    setIsOn(false)
  }

  return (
    // usa fixed para cubrir TODO el viewport (incluye safe-area)
    <main
      className={`fixed inset-0 z-0 transition-colors duration-700 ${isOn ? 'bg-black' : 'bg-gray-100'}`}
      onClick={!isOn ? handleStart : undefined}
      // evitamos scroll accidental en móviles
      style={{ touchAction: 'manipulation', overscrollBehavior: 'none' }}
    >
      {/* Contenedor de la llama (fijo, tras la UI) */}
      {isOn && (
        <div className="flame-root" aria-hidden="true">
          <div className="flame-base" />
          <div className="flame-middle" />
          <div className="flame-outer" />
          <div className="flame-flicker-1" />
          <div className="flame-flicker-2" />
          <div className="flame-flicker-3" />
        </div>
      )}

      {/* UI encima de la llama */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
        {/* Texto inicial (solo cuando está apagado) */}
        {!isOn && (
          <div className="pointer-events-auto z-50 text-center px-6">
            <div className="text-white text-2xl font-semibold drop-shadow-lg">
              🔥 Toca la pantalla para encender la llama 🔥
            </div>
          </div>
        )}
      </div>

      {/* Botones y controles (siempre por encima y reciben eventos) */}
      <div className="absolute inset-0 z-60 pointer-events-none">
        {/* Botón apagar abajo (solo cuando está encendido). pointer-events-auto para que pueda clickease */}
        {isOn && (
          <div
            className="absolute left-0 right-0 flex items-end justify-center pointer-events-auto"
            style={{ bottom: 'env(safe-area-inset-bottom, 20px)' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleStop()
              }}
              className="mb-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-lg font-semibold shadow-2xl z-50"
            >
              🔘 Apagar
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
