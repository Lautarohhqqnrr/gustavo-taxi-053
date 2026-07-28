export type EditorContent = {
  html: string
  json: Record<string, unknown> | null
  text: string
  isEmpty: boolean
}

export type EditorImageUploadResult = {
  url: string
  path: string
}

export interface TiptapEditorProps {
  content?: string
  onChange?: (content: EditorContent) => void
  placeholder?: string
  editable?: boolean
  className?: string
  minHeight?: string
  maxHeight?: string
  onImageUpload?: (file: File) => Promise<EditorImageUploadResult>
  /** Límite de caracteres (null = sin límite). Default: 15000 */
  characterLimit?: number | null
}