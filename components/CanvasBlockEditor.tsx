'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Type,
  Heading,
  Image as ImageIcon,
  Quote,
  Table,
  Minus,
  List,
  ListOrdered,
  Trash2,
  GripVertical,
  Plus,
  Eye,
  Edit3,
  Code2,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  Undo,
  AlertTriangle,
} from 'lucide-react'
import CanvasBlockRenderer from './CanvasBlockRenderer'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type BlockType =
  | 'heading'
  | 'paragraph'
  | 'code'
  | 'image'
  | 'quote'
  | 'divider'
  | 'list'

interface Block {
  id: string
  type: BlockType
  content: string
  meta?: Record<string, unknown>
}

interface CanvasBlockEditorProps {
  initialHtml?: string
  onChange?: (html: string) => void
  isDark?: boolean
}

/* -------------------------------------------------------------------------- */
/*                                 PARSER                                     */
/* -------------------------------------------------------------------------- */

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function detectLang(className: string): string {
  const m = className.match(/language-(\w+)/)
  if (m) return m[1]
  const m2 = className.match(/lang-(\w+)/)
  if (m2) return m2[1]
  return ''
}

function parseHtmlToBlocks(html: string): Block[] {
  if (typeof window === 'undefined') return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks: Block[] = []

  Array.from(doc.body.children).forEach((el) => {
    const tag = el.tagName.toLowerCase()
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        blocks.push({
          id: uid(),
          type: 'heading',
          content: el.innerHTML,
          meta: { level: parseInt(tag[1], 10) },
        })
        break
      case 'pre': {
        const code = el.querySelector('code')
        blocks.push({
          id: uid(),
          type: 'code',
          content: code ? code.innerHTML : el.innerHTML,
          meta: { language: code ? detectLang(code.className) : '' },
        })
        break
      }
      case 'blockquote':
        blocks.push({ id: uid(), type: 'quote', content: el.innerHTML })
        break
      case 'table':
        blocks.push({ id: uid(), type: 'paragraph', content: el.outerHTML })
        break
      case 'ul':
      case 'ol':
        blocks.push({
          id: uid(),
          type: 'list',
          content: el.outerHTML,
          meta: { ordered: tag === 'ol' },
        })
        break
      case 'hr':
        blocks.push({ id: uid(), type: 'divider', content: '' })
        break
      case 'p': {
        const img = el.querySelector('img')
        if (img) {
          blocks.push({
            id: uid(),
            type: 'image',
            content: '',
            meta: { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' },
          })
        } else {
          blocks.push({ id: uid(), type: 'paragraph', content: el.innerHTML })
        }
        break
      }
      case 'img':
        blocks.push({
          id: uid(),
          type: 'image',
          content: '',
          meta: { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '' },
        })
        break
      case 'figure': {
        const figImg = el.querySelector('img')
        const caption = el.querySelector('figcaption')
        blocks.push({
          id: uid(),
          type: 'image',
          content: '',
          meta: {
            src: figImg?.getAttribute('src') || '',
            alt: figImg?.getAttribute('alt') || '',
            caption: caption?.innerHTML || '',
          },
        })
        break
      }
      default:
        blocks.push({ id: uid(), type: 'paragraph', content: el.innerHTML || el.outerHTML })
    }
  })

  if (blocks.length === 0) {
    blocks.push({ id: uid(), type: 'paragraph', content: '' })
  }

  return blocks
}

/* -------------------------------------------------------------------------- */
/*                                SERIALIZER                                  */
/* -------------------------------------------------------------------------- */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading': {
          const level = (b.meta?.level as number) || 2
          const tag = `h${Math.min(Math.max(level, 1), 6)}`
          return `<${tag}>${b.content}</${tag}>`
        }
        case 'paragraph':
          return `<p>${b.content}</p>`
        case 'code': {
          const lang = (b.meta?.language as string) || ''
          const cls = lang ? ` class="language-${escapeHtml(lang)}"` : ''
          return `<pre><code${cls}>${b.content}</code></pre>`
        }
        case 'image': {
          const src = escapeHtml((b.meta?.src as string) || '')
          const alt = escapeHtml((b.meta?.alt as string) || '')
          const caption = (b.meta?.caption as string) || ''
          if (caption) {
            return `<figure><img src="${src}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>`
          }
          return `<p><img src="${src}" alt="${alt}" /></p>`
        }
        case 'quote':
          return `<blockquote>${b.content}</blockquote>`
        case 'divider':
          return `<hr />`
        case 'list':
          return b.content
        default:
          return `<p>${b.content}</p>`
      }
    })
    .join('\n')
}

/* -------------------------------------------------------------------------- */
/*                              THEME HELPERS                                 */
/* -------------------------------------------------------------------------- */

function useTheme(isDark: boolean) {
  return useMemo(
    () => ({
      bg: isDark ? 'bg-black' : 'bg-white',
      bgCard: isDark ? 'bg-white/5' : 'bg-gray-50',
      bgInput: isDark ? 'bg-gray-900' : 'bg-white',
      border: isDark ? 'border-white/10' : 'border-gray-200',
      text: isDark ? 'text-gray-300' : 'text-gray-700',
      textHeading: isDark ? 'text-white' : 'text-gray-900',
      textMuted: isDark ? 'text-gray-500' : 'text-gray-500',
      hover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
      focus: 'focus:ring-2 focus:ring-purple-500 focus:outline-none',
    }),
    [isDark]
  )
}

/* -------------------------------------------------------------------------- */
/*                           SLASH COMMAND MENU                               */
/* -------------------------------------------------------------------------- */

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'heading', label: 'כותרת', icon: Heading },
  { type: 'paragraph', label: 'פסקה', icon: Type },
  { type: 'code', label: 'קוד', icon: Code2 },
  { type: 'image', label: 'תמונה', icon: ImageIcon },
  { type: 'quote', label: 'ציטוט', icon: Quote },
  { type: 'list', label: 'רשימה', icon: List },
  { type: 'divider', label: 'קו הפרדה', icon: Minus },
]

function SlashMenu({
  onSelect,
  onClose,
  isDark,
}: {
  onSelect: (type: BlockType) => void
  onClose: () => void
  isDark: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const t = useTheme(isDark)

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 w-56 rounded-xl border shadow-2xl overflow-hidden ${t.bgCard} ${t.border}`}
      dir="rtl"
    >
      <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${t.textMuted} border-b ${t.border}`}>
        הוסף בלוק
      </div>
      {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${t.text} ${t.hover}`}
        >
          <Icon className="w-4 h-4 text-purple-400" />
          {label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              BLOCK EDITORS                                 */
/* -------------------------------------------------------------------------- */

function HeadingEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const level = (block.meta?.level as number) || 2
  const sizes: Record<number, string> = {
    1: 'text-2xl font-black',
    2: 'text-xl font-bold',
    3: 'text-lg font-bold',
    4: 'text-base font-semibold',
    5: 'text-sm font-semibold',
    6: 'text-sm font-medium',
  }
  return (
    <div className="flex items-start gap-2">
      <select
        value={level}
        onChange={(e) => onChange({ ...block, meta: { ...block.meta, level: parseInt(e.target.value) } })}
        className={`shrink-0 w-14 rounded-lg px-2 py-1.5 text-xs border ${t.bgInput} ${t.border} ${t.text} ${t.focus}`}
      >
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <option key={l} value={l}>
            H{l}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="כותרת..."
        className={`flex-1 rounded-lg px-3 py-1.5 text-right border ${t.bgInput} ${t.border} ${t.textHeading} ${sizes[level]} ${t.focus} placeholder:text-gray-600`}
        dir="rtl"
      />
    </div>
  )
}

function ParagraphEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [block.content])

  return (
    <textarea
      ref={textareaRef}
      value={block.content}
      onChange={(e) => onChange({ ...block, content: e.target.value })}
      placeholder="כתוב כאן..."
      rows={2}
      className={`w-full rounded-lg px-3 py-2 border ${t.bgInput} ${t.border} ${t.text} ${t.focus} resize-none placeholder:text-gray-600 leading-relaxed`}
      dir="rtl"
    />
  )
}

function CodeEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const lang = (block.meta?.language as string) || ''
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-purple-400" />
        <input
          type="text"
          value={lang}
          onChange={(e) => onChange({ ...block, meta: { ...block.meta, language: e.target.value } })}
          placeholder="שפת תכנות (למשל: typescript, python)"
          className={`flex-1 rounded-lg px-3 py-1 text-xs border ${t.bgInput} ${t.border} ${t.text} ${t.focus} placeholder:text-gray-600`}
          dir="ltr"
        />
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="הדבק קוד כאן..."
        rows={6}
        className={`w-full rounded-lg px-3 py-2 border font-mono text-xs ${t.bgInput} ${t.border} ${t.text} ${t.focus} resize-none placeholder:text-gray-600`}
        dir="ltr"
      />
    </div>
  )
}

function ImageEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const src = (block.meta?.src as string) || ''
  const alt = (block.meta?.alt as string) || ''
  const caption = (block.meta?.caption as string) || ''
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={src}
          onChange={(e) => onChange({ ...block, meta: { ...block.meta, src: e.target.value } })}
          placeholder="URL תמונה"
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm border ${t.bgInput} ${t.border} ${t.text} ${t.focus} placeholder:text-gray-600`}
          dir="ltr"
        />
        <input
          type="text"
          value={alt}
          onChange={(e) => onChange({ ...block, meta: { ...block.meta, alt: e.target.value } })}
          placeholder="תיאור alt"
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm border ${t.bgInput} ${t.border} ${t.text} ${t.focus} placeholder:text-gray-600`}
          dir="rtl"
        />
      </div>
      <input
        type="text"
        value={caption}
        onChange={(e) => onChange({ ...block, meta: { ...block.meta, caption: e.target.value } })}
        placeholder="כיתוב תמונה (אופציונלי)"
        className={`w-full rounded-lg px-3 py-1.5 text-sm border ${t.bgInput} ${t.border} ${t.text} ${t.focus} placeholder:text-gray-600`}
        dir="rtl"
      />
      {src && (
        <div className="rounded-lg border overflow-hidden max-h-48">
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}

function QuoteEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = ta.scrollHeight + 'px'
  }, [block.content])

  return (
    <div className={`relative rounded-lg border-r-4 border-purple-500 ${isDark ? 'bg-purple-500/5' : 'bg-purple-50'} pr-4 py-3`}>
      <Quote className="absolute top-2 right-3 w-5 h-5 text-purple-400/40" />
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="ציטוט..."
        rows={2}
        className={`w-full bg-transparent pr-6 text-sm italic ${t.text} resize-none focus:outline-none placeholder:text-gray-600`}
        dir="rtl"
      />
    </div>
  )
}

function ListEditor({
  block,
  onChange,
  isDark,
}: {
  block: Block
  onChange: (b: Block) => void
  isDark: boolean
}) {
  const t = useTheme(isDark)
  const ordered = block.meta?.ordered as boolean
  const items = useMemo(() => {
    const tmp = document.createElement('div')
    tmp.innerHTML = block.content
    return Array.from(tmp.querySelectorAll('li')).map((li) => li.innerHTML)
  }, [block.content])

  const [localItems, setLocalItems] = useState<string[]>(items.length ? items : [''])

  useEffect(() => {
    const tag = ordered ? 'ol' : 'ul'
    const html = `<${tag}>\n${localItems.map((it) => `  <li>${it}</li>`).join('\n')}\n</${tag}>`
    if (html !== block.content) {
      onChange({ ...block, content: html })
    }
  }, [localItems, ordered])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange({ ...block, meta: { ...block.meta, ordered: false }, content: block.content.replace(/<\/?ol/g, '<ul').replace(/<\/?ol>/g, '</ul>') })}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${!ordered ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <List className="w-3.5 h-3.5" />
          תבליטים
        </button>
        <button
          onClick={() => onChange({ ...block, meta: { ...block.meta, ordered: true }, content: block.content.replace(/<\/?ul/g, '<ol').replace(/<\/?ul>/g, '</ol>') })}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${ordered ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          ממוספר
        </button>
      </div>
      <div className="space-y-1 pr-4">
        {localItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-xs ${t.textMuted}`}>{ordered ? `${i + 1}.` : '•'}</span>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...localItems]
                next[i] = e.target.value
                if (i === next.length - 1 && e.target.value.trim() !== '') {
                  next.push('')
                }
                // Remove empty trailing items but keep at least one
                while (next.length > 1 && next[next.length - 1] === '' && next[next.length - 2] === '') {
                  next.pop()
                }
                setLocalItems(next)
              }}
              className={`flex-1 rounded px-2 py-1 text-sm border ${t.bgInput} ${t.border} ${t.text} ${t.focus}`}
              dir="rtl"
            />
            {localItems.length > 1 && (
              <button
                onClick={() => setLocalItems((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function DividerEditor({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 opacity-50">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      <Minus className="w-4 h-4 text-purple-400" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                         INDIVIDUAL BLOCK ROW                               */
/* -------------------------------------------------------------------------- */

function BlockRow({
  block,
  index,
  total,
  isDark,
  onChange,
  onDelete,
  onMove,
  onAddBelow,
}: {
  block: Block
  index: number
  total: number
  isDark: boolean
  onChange: (b: Block) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  onAddBelow: () => void
}) {
  const [showSlash, setShowSlash] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const t = useTheme(isDark)

  const renderEditor = () => {
    switch (block.type) {
      case 'heading':
        return <HeadingEditor block={block} onChange={onChange} isDark={isDark} />
      case 'paragraph':
        return (
          <div className="relative">
            <ParagraphEditor block={block} onChange={onChange} isDark={isDark} />
            {showSlash && (
              <SlashMenu
                onSelect={(type) => {
                  onChange({ ...block, type, content: type === 'divider' ? '' : block.content })
                  setShowSlash(false)
                }}
                onClose={() => setShowSlash(false)}
                isDark={isDark}
              />
            )}
          </div>
        )
      case 'code':
        return <CodeEditor block={block} onChange={onChange} isDark={isDark} />
      case 'image':
        return <ImageEditor block={block} onChange={onChange} isDark={isDark} />
      case 'quote':
        return <QuoteEditor block={block} onChange={onChange} isDark={isDark} />
      case 'divider':
        return <DividerEditor isDark={isDark} />
      case 'list':
        return <ListEditor block={block} onChange={onChange} isDark={isDark} />
      default:
        return null
    }
  }

  return (
    <div
      className={`group relative flex items-start gap-2 rounded-xl border border-transparent hover:border-white/10 transition-all p-2 -mr-2 ${t.hover}`}
    >
      {/* Drag handle / reorder */}
      <div className="flex flex-col items-center gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <GripVertical className="w-3.5 h-3.5 text-gray-600 cursor-grab" />
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="p-0.5 rounded hover:bg-white/10 disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {renderEditor()}

        {/* Empty paragraph slash command trigger */}
        {block.type === 'paragraph' && block.content === '' && !showSlash && (
          <button
            onClick={() => setShowSlash(true)}
            className={`mt-1 text-xs ${t.textMuted} hover:text-purple-400 transition-colors flex items-center gap-1`}
          >
            <Plus className="w-3 h-3" />
            לחץ כדי להוסיף בלוק
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onAddBelow}
          className="p-1 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-purple-400"
          title="הוסף בלוק מתחת"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-red-400"
          title="מחק בלוק"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${t.bgCard} border ${t.border}`}>
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className={`text-sm ${t.text}`}>למחוק בלוק זה?</span>
            <button onClick={onDelete} className="text-sm text-red-400 hover:text-red-300 font-medium">
              מחק
            </button>
            <button onClick={() => setShowDelete(false)} className={`text-sm ${t.textMuted} hover:text-gray-300`}>
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           MAIN COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function CanvasBlockEditor({
  initialHtml = '',
  onChange,
  isDark = true,
}: CanvasBlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(initialHtml))
  const [preview, setPreview] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const draftKey = useMemo(() => `canvas-draft-${btoa(initialHtml.slice(0, 40))}`, [initialHtml])
  const t = useTheme(isDark)

  /* -- Auto-save draft to localStorage every 10s -- */
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(blocks))
        setSavedAt(new Date().toLocaleTimeString('he-IL'))
      } catch {
        /* ignore quota errors */
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [blocks, draftKey])

  /* -- Notify parent on change -- */
  useEffect(() => {
    if (!onChange) return
    const html = blocksToHtml(blocks)
    onChange(html)
  }, [blocks, onChange])

  const updateBlock = useCallback((id: string, updater: (b: Block) => Block) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id)
      if (next.length === 0) next.push({ id: uid(), type: 'paragraph', content: '' })
      return next
    })
  }, [])

  const moveBlock = useCallback((index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev]
      const newIndex = index + dir
      if (newIndex < 0 || newIndex >= next.length) return prev
      const [removed] = next.splice(index, 1)
      next.splice(newIndex, 0, removed)
      return next
    })
  }, [])

  const addBlockBelow = useCallback((index: number, type: BlockType = 'paragraph') => {
    setBlocks((prev) => {
      const next = [...prev]
      next.splice(index + 1, 0, { id: uid(), type, content: '', meta: type === 'list' ? { ordered: false } : undefined })
      return next
    })
  }, [])

  const htmlOutput = useMemo(() => blocksToHtml(blocks), [blocks])

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-bold ${t.textHeading}`}>תצוגה מקדימה</h3>
          <button
            onClick={() => setPreview(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${t.border} ${t.bgCard} ${t.hover} transition-colors`}
          >
            <Edit3 className="w-4 h-4" />
            חזרה לעריכה
          </button>
        </div>
        <div className={`rounded-2xl border ${t.border} p-8 ${t.bgCard}`}>
          <CanvasBlockRenderer content={htmlOutput} isDark={isDark} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setBlocks((prev) => [...prev, { id: uid(), type: 'paragraph', content: '' }])
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${t.border} ${t.bgCard} ${t.hover} transition-colors`}
          >
            <Plus className="w-3.5 h-3.5" />
            בלוק חדש
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${t.border} ${t.bgCard} ${t.hover} transition-colors`}
          >
            <Eye className="w-3.5 h-3.5" />
            תצוגה מקדימה
          </button>
        </div>
        {savedAt && (
          <span className={`text-xs ${t.textMuted}`}>
            טיוטה נשמרה בשעה {savedAt}
          </span>
        )}
      </div>

      {/* Blocks */}
      <div className={`rounded-2xl border ${t.border} p-4 ${t.bgCard} space-y-2`}>
        {blocks.map((block, index) => (
          <BlockRow
            key={block.id}
            block={block}
            index={index}
            total={blocks.length}
            isDark={isDark}
            onChange={(b) => updateBlock(block.id, () => b)}
            onDelete={() => deleteBlock(block.id)}
            onMove={(dir) => moveBlock(index, dir)}
            onAddBelow={() => addBlockBelow(index)}
          />
        ))}
      </div>

      {/* HTML output (for debugging / copy) */}
      <details className={`rounded-xl border ${t.border} overflow-hidden`}>
        <summary className={`px-4 py-2 text-sm cursor-pointer ${t.textMuted} ${t.hover} transition-colors`}>
          HTML גולמי (להעתקה)
        </summary>
        <textarea
          readOnly
          value={htmlOutput}
          rows={6}
          className={`w-full px-4 py-3 text-xs font-mono ${t.bgInput} ${t.text} resize-none focus:outline-none`}
          dir="ltr"
        />
      </details>
    </div>
  )
}
