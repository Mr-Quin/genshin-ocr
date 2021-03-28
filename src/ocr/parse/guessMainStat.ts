import { getValueType, guessWith, matchNumbers, parseStatKey, removeGarbo } from './helper'
import { statRef } from '../../data/translation'

const guessMainStatValue = (data: Tesseract.RecognizeResult) => {
    return data.data.lines
        .sort((a, b) => {
            return b.confidence - a.confidence
        })
        .map((line) => {
            const text = removeGarbo(line.text)
            const matches = matchNumbers(text)
            if (matches) return matches[0]
            return matches
        })
        .filter((match): match is string => match !== null)
}

const guessMainStatKey = guessWith(Object.values(statRef).map((a) => a.chs))

export const guessMainStat = (data: Tesseract.RecognizeResult) => {
    const value = guessMainStatValue(data)
    console.log(value)
    const name = guessMainStatKey(data) ?? ''
    const type = getValueType(value[0])
    const approx = parseStatKey(name)

    return { key: approx?.key, name: approx?.name, value: parseFloat(value[0]), type }
}

export default guessMainStat
