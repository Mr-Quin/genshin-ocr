import { createWorker, PSM } from 'tesseract.js'
// @ts-ignore
import gc from '../traineddata/chi_sim.traineddata'
import path from 'path'
console.log(path.dirname(gc), path.basename(gc))

type Image =
    | string
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | CanvasRenderingContext2D
    | File
    | Blob
    | ImageData
    | Buffer

export type TesseractProgress = {
    workerId: string
    jobId: string
    status:
        | 'loading tesseract core'
        | 'loading language traineddata'
        | 'initializing api'
        | 'recognizing text'
    progress: number
}

export type OcrOptions = {
    langPath?: string
    langFile?: string
    onProgress?: (m: TesseractProgress) => any
}
const getOcr = async (image: Image, options: OcrOptions = {}) => {
    const progressCb = options.onProgress
    const langFile = options.langFile ?? 'chi_sim'
    const langPath = options.langPath ?? '/'

    const worker = createWorker({
        // langPath,
        // gzip: options.langPath !== undefined,
        logger: (m: TesseractProgress) => {
            if (progressCb) progressCb(m)
        },
        errorHandler: (err) => console.error(err),
    })
    await worker.load()
    await worker.loadLanguage(langFile)
    await worker.initialize(langFile)
    // sparse text seems to work better
    // @ts-ignore
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
    const result = await worker.recognize(image)
    await worker.terminate()
    return result
}

export default getOcr
