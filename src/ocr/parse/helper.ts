// match spaces and irrelevant special chars
import { Language, statRef } from '../../data/translation'
import { hammingDistance } from '../../util/hammingDistance'

const garboRegex = new RegExp(/(\s|[-!$^&*()_|~=`{}\[\]:";<>?,\/\\|↵，、【】])/g)
// match numbers and numbers ending in percentage sign
const numberRegex = new RegExp(/(?:\d*\.)?\d+%|(?:\d*\.)?\d+/)

export const removeGarbo = (text: string) => text.replace(garboRegex, '')
export const matchNumbers = (text: string) => text.match(numberRegex)

export const getValueType = (value: string) => (value.endsWith('%') ? 'percent' : 'flat')

export const parseStatKey = (key: string, language: Language = 'chs') => {
    const entry = Object.entries(statRef).find(([_, value]) => {
        return hammingDistance(value[language], key) <= 1
    })
    if (entry !== undefined) {
        return { key: entry[0], name: entry[1][language] }
    }
    // undefined is returned if no match
}

export const guessWith = (ref: string[], maxDistance = 0) => (data: Tesseract.RecognizeResult) => {
    // should change to filter to return list of possible matches
    const match = ref.find((name) => {
        return data.data.lines
            .map((line) => removeGarbo(line.text))
            .some((text) => {
                if (text === '') return false
                return hammingDistance(text, name) <= maxDistance
            })
    })
    return match
}
