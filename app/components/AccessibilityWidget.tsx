'use client'

import React, { useState, useEffect } from 'react'
import { 
  Accessibility, X, Type, Minus, Plus, 
  Sun, Moon, Eye, MousePointer2, RefreshCcw, 
  Image as ImageIcon, Underline
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: 100, // Percentage
    contrast: 'normal', // normal, high, invert
    saturation: 100, // Percentage
    cursor: false,
    highlightLinks: false,
    hideImages: false,
    dyslexiaFriendly: false
  })

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.style.fontSize = `${settings.fontSize}%`

    let filterString = ''
    if (settings.contrast === 'invert') {
      filterString += 'invert(100%) '
    } else if (settings.contrast === 'high') {
      filterString += 'contrast(125%) '
    }
    if (settings.saturation !== 100) {
      filterString += `saturate(${settings.saturation}%) `
    }
    html.style.filter = filterString

    if (settings.cursor) {
      body.classList.add('accessibility-cursor')
    } else {
      body.classList.remove('accessibility-cursor')
    }

    if (settings.highlightLinks) {
      body.classList.add('accessibility-links')
    } else {
      body.classList.remove('accessibility-links')
    }

    if (settings.hideImages) {
      body.classList.add('accessibility-hide-images')
    } else {
      body.classList.remove('accessibility-hide-images')
    }

    if (settings.dyslexiaFriendly) {
      body.classList.add('accessibility-dyslexia')
    } else {
      body.classList.remove('accessibility-dyslexia')
    }
  }, [settings])

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      contrast: 'normal',
      saturation: 100,
      cursor: false,
      highlightLinks: false,
      hideImages: false,
      dyslexiaFriendly: false
    })
  }

  return (
    <>
      <style jsx global>{`
        .accessibility-cursor, .accessibility-cursor * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 0 0, auto !important;
        }
        .accessibility-links a {
          text-decoration: underline !important;
          text-decoration-color: yellow !important;
          text-decoration-thickness: 3px !important;
          color: black !important;
          background-color: yellow !important;
        }
        .accessibility-hide-images img, 
        .accessibility-hide-images video,
        .accessibility-hide-images [style*="background-image"] {
          opacity: 0 !important;
          visibility: hidden !important;
        }
        .accessibility-dyslexia {
          font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif !important;
          line-height: 1.5 !important;
          letter-spacing: 0.05em !important;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] font-sans">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="bg-[#003c71] text-white p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Accessibility size={20} /> Accessibility
                </h3>
                <button 
                  onClick={resetSettings}
                  className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition flex items-center gap-1"
                >
                  <RefreshCcw size={12} /> Reset
                </button>
              </div>

              <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Text Size
                  </label>
                  <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-1">
                    <button 
                      onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(80, s.fontSize - 10) }))}
                      className="p-3 hover:bg-white rounded-lg transition shadow-sm"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-neutral-800">
                      {settings.fontSize}%
                    </span>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(150, s.fontSize + 10) }))}
                      className="p-3 hover:bg-white rounded-lg transition shadow-sm"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Display
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSettings(s => ({ ...s, contrast: s.contrast === 'invert' ? 'normal' : 'invert' }))}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                        settings.contrast === 'invert'
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Moon size={20} /> 
                      <span className="text-xs font-medium">Invert Colors</span>
                    </button>
                    <button 
                      onClick={() => setSettings(s => ({ ...s, saturation: s.saturation === 0 ? 100 : 0 }))}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                        settings.saturation === 0
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Eye size={20} /> 
                      <span className="text-xs font-medium">Grayscale</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Tools
                  </label>
                  <div className="space-y-2">
                    <ToggleButton 
                      active={settings.highlightLinks} 
                      onClick={() => setSettings(s => ({ ...s, highlightLinks: !s.highlightLinks }))}
                      icon={<Underline size={18} />}
                      label="Highlight Links"
                    />
                    <ToggleButton 
                      active={settings.cursor} 
                      onClick={() => setSettings(s => ({ ...s, cursor: !s.cursor }))}
                      icon={<MousePointer2 size={18} />}
                      label="Big Cursor"
                    />
                    <ToggleButton 
                      active={settings.dyslexiaFriendly} 
                      onClick={() => setSettings(s => ({ ...s, dyslexiaFriendly: !s.dyslexiaFriendly }))}
                      icon={<Type size={18} />}
                      label="Dyslexia Friendly"
                    />
                    <ToggleButton 
                      active={settings.hideImages} 
                      onClick={() => setSettings(s => ({ ...s, hideImages: !s.hideImages }))}
                      icon={<ImageIcon size={18} />}
                      label="Hide Images"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors border-2 border-white ${
            isOpen ? 'bg-neutral-900 text-white rotate-90' : 'bg-[#003c71] text-white'
          }`}
          title="Accessibility Options"
        >
          {isOpen ? <X size={24} /> : <Accessibility size={28} />}
        </motion.button>
      </div>
    </>
  )
}

function ToggleButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
        active 
          ? 'bg-blue-50 border-blue-200 text-blue-700' 
          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${active ? 'bg-blue-100' : 'bg-neutral-100'}`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      <div className={`ml-auto w-3 h-3 rounded-full ${active ? 'bg-blue-500' : 'bg-neutral-300'}`} />
    </button>
  )
}







