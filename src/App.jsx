import { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function TypingDots() {
  return (
    <div className="flex gap-1 items-center text-blue-600 px-2 py-1">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
    </div>
  )
}

function QuickChips({ onPick }) {
  const chips = [
    { k: 'uses', label: 'Uses' },
    { k: 'side_effects', label: 'Side Effects' },
    { k: 'interactions', label: 'Interactions' },
    { k: 'precautions', label: 'Precautions' },
    { k: 'how_to_take', label: 'How to Take' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(c => (
        <button key={c.k} onClick={() => onPick(c.k)} className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          {c.label}
        </button>
      ))}
    </div>
  )
}

function Message({ role, content }) {
  const isBot = role === 'assistant'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`${isBot ? 'bg-white text-gray-800' : 'bg-blue-600 text-white'} shadow-sm rounded-2xl px-4 py-3 max-w-[85%] whitespace-pre-wrap`}>{content}</div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m 💊 MediBot. Ask about a medicine or symptom. Quick chips below can guide the topic.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollerRef = useRef(null)

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (msg) => {
    const text = (msg ?? input).trim()
    if (!text) return
    const newMsgs = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json()
      const reply = data.reply || 'Sorry, something went wrong.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const onChip = (key) => {
    if (!input.trim()) return
    send(`${input} (${key.replace('_',' ')})`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="relative h-[280px] md:h-[360px] overflow-hidden">
        <Spline scene="https://prod.spline.design/5EwoDiC2tChvmy4K/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/40 via-blue-700/20 to-white/0 pointer-events-none"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="text-2xl md:text-4xl font-bold drop-shadow-sm">💊 MediBot — AI Medicine Chat</div>
          <div className="mt-2 text-white/90">Safety-first answers. No external APIs. Improves with your feedback.</div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-6">
        <div ref={scrollerRef} className="h-[52vh] md:h-[58vh] overflow-y-auto space-y-3 p-3 bg-white/70 backdrop-blur rounded-xl border border-blue-100 shadow-sm">
          {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
          {loading && (
            <div className="flex justify-start"><div className="bg-white rounded-2xl px-4 py-3 shadow-sm"><TypingDots /></div></div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <QuickChips onPick={onChip} />
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about a medicine or symptom" className="flex-1 border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
            <button onClick={() => send()} disabled={loading} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow disabled:opacity-50">Send</button>
          </div>
          <div className="text-xs text-gray-500">This is general information only. Please consult a doctor before taking or stopping any medicine.</div>
        </div>
      </main>
    </div>
  )
}
