'use client'

import { useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyCodeBlocks() {
  useEffect(() => {
    const pres = document.querySelectorAll('article pre')
    const cleanups: (() => void)[] = []

    pres.forEach(pre => {
      if (pre.querySelector('.copy-btn')) return

      const btn = document.createElement('button')
      btn.className = 'copy-btn absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white text-xs transition-colors backdrop-blur-sm border border-white/10'
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> העתק'

      const style = document.createElement('style')
      style.textContent = `
        article pre { position: relative; }
        article pre .copy-btn.copied {
          background: rgba(34, 197, 94, 0.2) !important;
          color: #4ade80 !important;
          border-color: rgba(34, 197, 94, 0.3) !important;
        }
      `
      if (!document.head.querySelector('[data-copy-style]')) {
        style.setAttribute('data-copy-style', '1')
        document.head.appendChild(style)
      }

      const copyHandler = async () => {
        const code = pre.querySelector('code')
        const text = code ? (code as HTMLElement).innerText : (pre as HTMLElement).innerText
        try {
          await navigator.clipboard.writeText(text)
          btn.classList.add('copied')
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> הועתק!'
          setTimeout(() => {
            btn.classList.remove('copied')
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> העתק'
          }, 2000)
        } catch {
          btn.innerText = 'שגיאה'
        }
      }

      btn.addEventListener('click', copyHandler)
      pre.appendChild(btn)

      cleanups.push(() => {
        btn.removeEventListener('click', copyHandler)
        if (btn.parentNode) btn.parentNode.removeChild(btn)
      })
    })

    return () => {
      cleanups.forEach(c => c())
    }
  }, [])

  return null
}
