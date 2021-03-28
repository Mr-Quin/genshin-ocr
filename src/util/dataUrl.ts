export const imageDataToURL = (imageData: ImageData) => {
    // create off-screen canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = imageData.width
    canvas.height = imageData.height
    if (ctx) {
        // create imageData object
        const canvasImageData = ctx.createImageData(imageData.width, imageData.height)
        // set our buffer as source
        canvasImageData.data.set(imageData.data)
        // update canvas with new data
        ctx.putImageData(canvasImageData, 0, 0)
        // produces a PNG file
        return canvas.toDataURL()
    }
    throw new Error('Canvas context is not initialized')
}

export const imageDataFromImageElement = (image: HTMLImageElement) => {
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = image.width
    tempCanvas.height = image.height
    tempCtx!.drawImage(image, 0, 0, image.width, image.height)
    return tempCtx!.getImageData(0, 0, image.width, image.height)
}

export const urlToImageData = (url: string): PromiseLike<ImageData> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(imageDataFromImageElement(img))
        img.src = url
    })
}

export const fileToURL = (file: File): PromiseLike<string> => {
    if (!file) return Promise.reject('Not a file')
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
    })
}
