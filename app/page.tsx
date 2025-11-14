'use client'

import { useState, useRef } from 'react'

export default function HomePage() {
  const [isOn, setIsOn] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const torchTrackRef = useRef<MediaStreamTrack | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // 🔥 Encender llama, nota y linterna
  const handleStart = async () => {
    if (isOn) return
    setIsOn(true)

    // --- audio desde archivos en public/coro ---
    try {
      const audioFiles = [
        "/coro/CORO.cm.wav",
        "/coro/CORO.cm_1.wav",
        "/coro/CORO.cm_2.wav",
        "/coro/CORO.cm_3.wav",
        "/coro/CORO.cm_4.wav",
        "/coro/CORO.cm_5.wav",
      ]

      // Elegir uno aleatorio
      const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)]
      const audio = new Audio(randomFile)

      audio.volume = 1.0 // volumen máximo  
      audio.loop = true
      audio.play().catch(err => console.warn("No se pudo reproducir el audio", err))

      audioElementRef.current = audio
    } catch (e) {
      console.warn("Audio no disponible", e)
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
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
      audioElementRef.current = null
    }

    if (torchTrackRef.current) {
      torchTrackRef.current.stop()
      torchTrackRef.current = null
    }
    setIsOn(false)
  }

  return (
    <main
      className="fixed inset-0 z-0 bg-black"
      onClick={!isOn ? handleStart : undefined}
      style={{ 
        touchAction: 'manipulation', 
        overscrollBehavior: 'none',
        backgroundColor: '#000000'
      }}
    >
      {/* Contenedor de la llama - CON Z-INDEX BAJO */}
      {isOn && (
        <div className="flame-container" aria-hidden="true">
          <div className="flame-base" />
          <div className="flame-middle" />
          <div className="flame-outer" />
          <div className="flame-flicker-1" />
          <div className="flame-flicker-2" />
          <div className="flame-flicker-3" />
          <div className="flame-spark-1" />
          <div className="flame-spark-2" />
          <div className="flame-spark-3" />
        </div>
      )}

      {/* UI encima de la llama */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        {/* Texto inicial (solo cuando está apagado) */}
        {!isOn && (
          <div className="pointer-events-auto z-50 text-center px-6">
            <div className="text-white text-2xl font-semibold drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-2xl py-4 px-6 border border-white/20">
              🔥 Toca la pantalla para encender la llama 🔥
            </div>
          </div>
        )}
      </div>

      {/* Botón apagar - CONTAINER SEPARADO Y Z-INDEX MUY ALTO */}
      {isOn && (
        <div className="button-container">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleStop()
            }}
            className="apagar-btn"
          >
            🔘 APAGAR
          </button>
        </div>
      )}
    </main>
  )
}