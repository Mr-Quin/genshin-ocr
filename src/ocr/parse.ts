import { pieceRef } from '../data/translation'
import { setNames, slotNames } from '../data/artifacts'
import { guessWith } from './parse/helper'
import guessMainStat from './parse/guessMainStat'
import guessSubStats from './parse/guessSubStats'
import guessEnhancement from './parse/guessEnhancement'
import { MarvinImage } from 'marvinj-ts'
import { preprocessArtifact } from './preprocessing'
import getOcr, { OcrOptions } from './ocr'
import guessRarity from './parse/guessRarity'

const guessPieceName = guessWith(
    Object.values(pieceRef).flatMap((artifact) => Object.values(artifact)),
    1
)
const guessSetName = guessWith(Object.keys(setNames), 1)
const guessSlotName = guessWith(Object.keys(slotNames), 1)

export const parseArtifact = (
    topData: Tesseract.RecognizeResult,
    botData: Tesseract.RecognizeResult,
    setData: Tesseract.RecognizeResult
) => {
    const mainStat = guessMainStat(topData)
    const subStats = guessSubStats(botData)
    const set = guessSetName(setData)
    const slot = guessSlotName(topData)
    const piece = guessPieceName(topData)

    return { mainStat, subStats, set, slot, piece }
}

type Options = { onProgress?: OcrOptions['onProgress'] }
export const doAll = async (imageData: string, options: Options = {}) => {
    const marvinLoad = (url: string): Promise<MarvinImage> => {
        return new Promise((resolve) => {
            const img = new MarvinImage()
            img.load(url, () => {
                resolve(img)
            })
        })
    }
    const image = await marvinLoad(imageData)
    const processed = Object.values(preprocessArtifact(image))
    const [topRes, botRes, setRes] = await Promise.all(
        processed.map((data) =>
            getOcr(data, {
                onProgress: options.onProgress,
                // langPath: '/static/media',
                // langFile: 'chi_sim.dc1be34a',
            })
        )
    )
    console.log(topRes, botRes, setRes)
    const parse = parseArtifact(topRes, botRes, setRes)
    const rarity = guessRarity(image)
    const enhancement = guessEnhancement(parse.mainStat.value, rarity)
    return Promise.resolve({ ...parse, rarity, enhancement })
}
