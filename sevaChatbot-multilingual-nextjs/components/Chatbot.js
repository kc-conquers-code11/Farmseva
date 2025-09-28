import React, { useEffect, useRef, useState } from 'react'

const LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'mr-IN', label: 'Marathi' }
]

export default function Chatbot() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [selectedLang, setSelectedLang] = useState('en-IN')
  const messagesEndRef = useRef(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => { scrollToBottom() }, [chat])

  function scrollToBottom() {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleSend() {
    const text = message.trim()
    if (!text && !imageFile) return

    if (text) setChat(prev => [...prev, { sender: 'user', text }])
    if (imageFile) setChat(prev => [...prev, { sender: 'user', text: `📎 Sent image: ${imageFile.name}` }])

    setMessage('')

    try {
      const form = new FormData()
      if (text) form.append('message', text)
      if (imageFile) form.append('image', imageFile)
      form.append('lang', selectedLang)

      const res = await fetch('/api/chat', { method: 'POST', body: form })

      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      const reply = data.reply || data.answer || 'No reply'
      setChat(prev => [...prev, { sender: 'bot', text: reply }])
      speakText(reply)
    } catch (err) {
      console.error(err)
      setChat(prev => [...prev, { sender: 'bot', text: 'Error: could not reach server.' }])
    } finally {
      setImageFile(null)
    }
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = selectedLang || 'en-IN'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported')
      return
    }
    if (recognitionRef.current) {
      if (listening) {
        recognitionRef.current.stop()
        setListening(false)
        return
      }
    } else {
      const rec = new SpeechRecognition()
      rec.lang = selectedLang || 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = (evt) => {
        const t = evt.results[0][0].transcript
        setMessage(prev => prev ? prev + ' ' + t : t)
      }
      rec.onerror = (e) => console.error('rec error', e)
      rec.onend = () => setListening(false)
      recognitionRef.current = rec
    }
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ height: 420, overflowY: 'auto', border: '1px solid #ddd', padding: 12, borderRadius: 8, background: '#fafafa' }}>
        {chat.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{m.sender === 'user' ? 'You' : 'SevaBot'}</div>
            <div style={{ background: m.sender === 'user' ? '#e6f7ff' : '#fff', padding: 10, borderRadius: 6, display: 'inline-block', maxWidth: '90%' }}>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd' }} onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }} />
        <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)} style={{ padding: 8 }}>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
        <button onClick={handleSend} style={{ padding: '8px 12px' }}>Send</button>
        <button onClick={startListening} style={{ padding: '8px 12px' }}>{listening ? 'Stop' : '🎤'}</button>
      </div>
      {imageFile && (<div style={{ marginTop: 8, fontSize: 13 }}>Selected: {imageFile.name}</div>)}
    </div>
  )
}