import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";

/** Convert a data-URL (Filerobot output) to a File for upload. */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

interface ImageStudioProps {
  /** Directly-loadable image URL (presigned). */
  source: string;
  onSave: (file: File) => void;
  onClose: () => void;
}

/**
 * Full-image studio (Filerobot) — crop, rotate, resize, filters, finetune, annotate, watermark.
 * On save the edited image is handed back as a File to be uploaded as a new gallery asset.
 *
 * Note: the source must be CORS-loadable (the object store must send `Access-Control-Allow-Origin`),
 * otherwise the canvas is tainted and export is blocked by the browser.
 */
export function ImageStudio({ source, onSave, onClose }: ImageStudioProps) {
  return (
    <div className="fixed inset-0 z-studio bg-ink">
      <FilerobotImageEditor
        source={source}
        onSave={(edited: { imageBase64?: string; fullName?: string }) => {
          if (edited.imageBase64) {
            onSave(
              dataUrlToFile(edited.imageBase64, edited.fullName ?? "edited.png")
            );
          }
          onClose();
        }}
        onClose={onClose}
        tabsIds={[
          TABS.ADJUST,
          TABS.FINETUNE,
          TABS.FILTERS,
          TABS.ANNOTATE,
          TABS.RESIZE,
          TABS.WATERMARK,
        ]}
        defaultTabId={TABS.ADJUST}
        defaultToolId={TOOLS.CROP}
        savingPixelRatio={1}
        previewPixelRatio={1}
      />
    </div>
  );
}
