import { useEditor, useEditorState, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useId, useState } from 'react'
import { plainToParagraphs } from '@/lib/html'
import { signalChange } from './AdminForm'

type Props = {
  name: string
  defaultValue?: string
  maxLength: number
  label?: string
  compact?: boolean
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active ?? false}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold disabled:opacity-40 ${
        active ? 'bg-navy text-white' : 'bg-mist text-navy hover:bg-sky'
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ name, defaultValue = '', maxLength, compact, label = 'Tekst' }: Props) {
  const reactId = useId()
  const [html, setHtml] = useState(() => plainToParagraphs(defaultValue))
  const [count, setCount] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: { rel: null, target: null },
          isAllowedUri: (url, ctx) => {
            try {
              if (url.startsWith('/') && !url.startsWith('//')) return true
              const parsed = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)
              return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
            } catch {
              return false
            }
          },
        },
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: plainToParagraphs(defaultValue),
    editorProps: {
      attributes: {
        class: `${compact ? 'min-h-28' : 'min-h-40'} prose-site max-w-none px-3 py-2 outline-none`,
        'aria-labelledby': `${reactId}-label`,
      },
    },
    onUpdate: ({ editor: ed, transaction }) => {
      setHtml(ed.getHTML())
      if (transaction.docChanged) signalChange(ed.view.dom)
      setCount(ed.storage.characterCount.characters())
    },
    onCreate: ({ editor: ed }) => {
      setCount(ed.storage.characterCount.characters())
    },
  })

  useEffect(() => {
    if (!editor) return
    setCount(editor.storage.characterCount.characters())
  }, [editor])

  const active = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed?.isActive('bold') ?? false,
      italic: ed?.isActive('italic') ?? false,
      bulletList: ed?.isActive('bulletList') ?? false,
      orderedList: ed?.isActive('orderedList') ?? false,
      link: ed?.isActive('link') ?? false,
      h2: ed?.isActive('heading', { level: 2 }) ?? false,
      h3: ed?.isActive('heading', { level: 3 }) ?? false,
    }),
  })

  const setLink = () => {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const next = window.prompt('Link-URL (https://… of mailto:…)', previous ?? 'https://')
    if (next === null) return
    const trimmed = next.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
  }

  const over = count > maxLength

  return (
    <div className="grid gap-1">
      <span id={`${reactId}-label`} className="sr-only">
        {label}
      </span>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap gap-1 border-b border-line bg-mist/60 p-2">
          <ToolbarButton
            active={active?.bold}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            Vet
          </ToolbarButton>
          <ToolbarButton
            active={active?.italic}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            Cursief
          </ToolbarButton>
          <ToolbarButton
            active={active?.bulletList}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            Lijst
          </ToolbarButton>
          <ToolbarButton
            active={active?.orderedList}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            Genummerd
          </ToolbarButton>
          <ToolbarButton active={active?.link} disabled={!editor} onClick={setLink}>
            Link
          </ToolbarButton>
          {!compact ? (
            <>
              <ToolbarButton
                active={active?.h2}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                Kop
              </ToolbarButton>
              <ToolbarButton
                active={active?.h3}
                disabled={!editor}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                Subkop
              </ToolbarButton>
            </>
          ) : null}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
      <p className={`text-sm ${over ? 'font-semibold text-closed' : 'text-muted'}`}>
        {count} / {maxLength} tekens
      </p>
    </div>
  )
}
