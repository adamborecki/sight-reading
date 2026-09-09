export interface RecordingHandle {
  stop: () => Promise<Blob>
  cancel: () => void
}

export async function startRecording(): Promise<RecordingHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const chunks: BlobPart[] = []
  const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }))
    }
  })

  recorder.start()

  return {
    stop: () => {
      recorder.stop()
      return stopped
    },
    cancel: () => {
      recorder.onstop = null
      recorder.stop()
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
