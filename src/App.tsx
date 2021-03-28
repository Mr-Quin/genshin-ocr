import React, { useEffect, useState } from 'react'
import './App.css'
import { fileToURL } from './util/dataUrl'
import { doAll } from './ocr/parse'
import { MarvinImage } from 'marvinj-ts'
import { preprocessArtifact } from './ocr/preprocessing'

function App() {
    const [origImg, setOrigImg] = useState<string>()
    const [procImg, setProcImg] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [parsedText, setParsedText] = useState<any>()

    useEffect(() => {
        // what event type is this?
        const onPaste = async (e: any) => {
            const imgUrl = await fileToURL(e.clipboardData!.files[0])
            // let a = document.createElement('a') //Create <a>
            // a.href = imgUrl //Image Base64 Goes here
            // a.download = `${Math.random().toString(36).substring(2)}.png` //File name Here
            // a.click() //Downloaded file
            setOrigImg(imgUrl)
            setParsedText('')
        }
        window.addEventListener('paste', onPaste)
        return () => window.removeEventListener('paste', onPaste)
    }, [])

    useEffect(() => {
        if (!origImg) return
        const a = async () => {
            const all = await doAll(origImg, {
                onProgress: (p) => {
                    console.log(p)
                },
            })
            console.log(all)
            setParsedText(JSON.stringify(all, null, 2))
            setLoading(false)
        }
        a()
        setLoading(true)
        const image = new MarvinImage()
        image.load(origImg, () => {
            const processed = Object.values(preprocessArtifact(image))
            setProcImg(processed)
        })
    }, [origImg])

    return (
        <div className="App">
            <div>
                <p>Ctrl + V</p>
            </div>
            {loading && <p>{'loading'}</p>}
            <div className={'wrapper'}>
                {origImg && <ImageDisplay src={origImg} style={{ gridArea: 'main' }} />}
                <div style={{ gridArea: 'text', overflowY: 'auto' }}>
                    {parsedText && <pre>{parsedText}</pre>}
                </div>
                {procImg?.map((src, i) => {
                    return <ImageDisplay src={src} key={i} />
                })}
            </div>
        </div>
    )
}

const ImageDisplay = (props: any) => {
    const { src, name, style } = props

    return (
        <div className={'image-display'} style={style}>
            <img src={src} />
            <p>{name}</p>
        </div>
    )
}
export default App
