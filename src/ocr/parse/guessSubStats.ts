import { getValueType, parseStatKey, removeGarbo } from './helper'

const guessSubStats = (data: Tesseract.RecognizeResult) => {
    // assume substat lines are in the shape of "name+value(%)"
    return data.data.lines
        .map((line) => {
            const text = removeGarbo(line.text)
            if (!text.includes('+')) return null
            return text.split('+')
        })
        .filter((match): match is string[] => match !== null)
        .map((match) => {
            const [statName, statValue] = match
            const type = getValueType(statValue)
            const approx = parseStatKey(statName)
            const key = approx?.key
            const name = approx?.name ?? statName
            return { key, name, value: parseFloat(statValue), type }
        })
}

export default guessSubStats
