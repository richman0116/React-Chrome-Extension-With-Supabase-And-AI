import { circleLoadingMessages } from './constants'
import supabase from './supabase'

const bannedURLList: string[] = [
  'https://twitter.com/home',
  'https://www.facebook.com/',
  'https://www.quora.com/',
  'https://www.reddit.com/',
  'https://www.youtube.com/',
  'https://www.google.com/maps',
  'https://www.google.com/',
  'https://drive.google.com/',
  'https://mail.google.com/mail/u/0/#inbox',
  'https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook',
  'https://www.instagram.com/',
  'https://www.netflix.com/browse',
  'https://www.wikipedia.org/',
  'https://www.amazon.com/',
  'https://www.microsoft.com/en-us/microsoft-365/onedrive/online-cloud-storage',
  'https://www.tiktok.com/',
  'https://www.bing.com/',
  'https://www.linkedin.com/feed/',
  'https://docs.google.com/',
  'https://www.bilibili.com/',
]
export const isMainURL = (urlString: string) => {
  try {
    if (!urlString.startsWith('https://') && !urlString.startsWith('http://')) {
      return true
    }
    return bannedURLList.includes(urlString.toLowerCase())
  } catch (e) {
    console.error('Invalid URL provided:', e)
    return false
  }
}

export const getSpecificNumberOfWords = (sentences: string, number: number) => {
  const words = sentences.split(' ')
  return words.slice(0, number).join(' ')
}

// Define a function to load an image and return it as an HTMLImageElement
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous' // Handle CORS if fetching from an external URL
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// Define a function to resize and convert an image to WebP format, returning the result as a Uint8Array
export const resizeAndConvertImageToBuffer = async (
  imageUrl: string
): Promise<Uint8Array> => {
  // Load the image
  const img = await loadImage(imageUrl)

  // Create a canvas and context
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Unable to get canvas context')
  }

  // Set the canvas size to the desired dimensions
  canvas.width = 256
  canvas.height = 256

  // Draw the image onto the canvas, resizing it
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Convert the canvas content to a WebP blob
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp')
  )
  if (!blob) {
    throw new Error('Unable to convert canvas to Blob')
  }

  // Convert the blob to an ArrayBuffer then to a Uint8Array
  const buffer = await blob.arrayBuffer()
  return new Uint8Array(buffer)
}

export const uploadImageToSupabase = async (
  imageBuffer: ArrayBuffer,
  bucketName: string,
  uploadPath: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, imageBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })
    console.log(data, '****** image uploading result')
    if (error) {
      console.error(error)
    }
    return data;
  } catch (ex) {
    console.error('An error occurred on image uploading', ex)
  }
}

export const getCircleLoadingMessage = () => {
  const randomNumber = Math.floor(Math.random() * circleLoadingMessages.length)
  return circleLoadingMessages[randomNumber]
}
