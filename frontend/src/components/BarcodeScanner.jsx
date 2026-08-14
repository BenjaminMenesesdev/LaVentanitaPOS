import { useEffect, useRef } from 'react'

// Los lectores de codigo de barras USB/Bluetooth funcionan como teclado:
// escriben el codigo rapidamente y terminan con Enter. Este input lo captura
// sin necesidad de hardware/driver especial.
export default function BarcodeScanner({ onScan, autoFocus = true }) {
  const inputRef = useRef(null)
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  function handleKeyDown(e) {
    const now = Date.now()
    // Si paso mas de 80ms entre teclas, es tipeo humano, no lector fisico
    if (now - lastKeyTimeRef.current > 80) {
      bufferRef.current = ''
    }
    lastKeyTimeRef.current = now

    if (e.key === 'Enter') {
      const code = bufferRef.current.trim()
      if (code) {
        onScan(code)
      }
      bufferRef.current = ''
      e.preventDefault()
    } else if (e.key.length === 1) {
      bufferRef.current += e.key
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      onKeyDown={handleKeyDown}
      placeholder="Escanea o escribe el codigo de barras..."
      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      autoComplete="off"
    />
  )
}
