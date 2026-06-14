import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadedFile {
  name: string
  fileType: string
}

function toFileType(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() ?? "" : ""
  return ext ? ext.toUpperCase() : "PDF"
}

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "")
}

/**
 * Simulated drag-and-drop upload zone (CLAUDE.md §7.7 - upload is simulated, no
 * backend). Accepts dropped files or a click-to-browse selection and reports
 * them to the parent, which mocks the ingestion lifecycle.
 */
export function UploadZone({
  onFiles,
}: {
  onFiles: (files: UploadedFile[]) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const emit = (files: UploadedFile[]) => {
    if (files.length) onFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).map((f) => ({
      name: baseName(f.name),
      fileType: toFileType(f.name),
    }))
    // Demo fallback: dragging non-file content still shows the flow.
    emit(
      dropped.length
        ? dropped
        : [{ name: "Fund document", fileType: "PDF" }]
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload knowledge base documents"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        dragOver
          ? "border-primary bg-primary/[0.06]"
          : "border-border bg-card hover:border-primary/40 hover:bg-fcmb-offwhite"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []).map((f) => ({
            name: baseName(f.name),
            fileType: toFileType(f.name),
          }))
          emit(picked)
          e.target.value = ""
        }}
      />
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-colors",
          dragOver
            ? "bg-primary text-white"
            : "bg-primary/10 text-primary group-hover:bg-primary/15"
        )}
      >
        <UploadCloud className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-text-primary">
          {dragOver ? "Drop to upload" : "Drag documents here, or click to browse"}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">
          PDF, DOCX or TXT · simulated ingestion (Uploaded → Indexed → Active)
        </p>
      </div>
    </div>
  )
}
