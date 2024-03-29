// Kazuo: Please later on replace this token

import { IHistory } from '../types/history'

// it is unsafe since chrome extension's code is exposed to public
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c21yZGJldnd4cGh0cnNldmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUxNzkxNzMsImV4cCI6MjAxMDc1NTE3M30.gstQlVVRP6quLuDyM7pmtSY9HUoW8Igt3_ymgN3tZcA'

const callAPIRequest = async (url: string, data: any) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  const res = await response.json()
  return res
}

export const getGeneratedCircles = async (pageUrl: string, pageContent: string) => {
  const url =
    'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/analyzePageForCircles'

  const data = {
    url: pageUrl,
    bodyText: pageContent,
  }

  const res = await callAPIRequest(url, data)
  return res
}

// export const getGeneratedCircleImage =async (name: string, description: string) => {
//   const url = 'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/generateImageForCircle'
//   const data = {
//     name,
//     description
//   }
//   const res = await callAPIRequest(url, data)
//   return res
// }

export const generateCircleImage = async (
  circle_id?: string,
  name?: string,
  description?: string
) => {
  const url = 'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/generateImageFrom'
  // this function takes the existing circle id and generates the image for it
  const data = {
    circle_id,
    name,
    description,
  }
  const res = await callAPIRequest(url, data)
  return res
}

export const generateTags = async (name: string, description: string) => {
  const url =
    'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/generateTagsForCircle'
  const data = {
    name,
    description,
  }
  const res = await callAPIRequest(url, data)
  const tagsString = res.replaceAll("'", '"')
  return JSON.parse(tagsString)
}

export const getGeneratedCirclesFromHistory = async (histories: IHistory[]) => {
  console.log(histories, '========')
  const url =
    'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/analyzeHistoryForCircles'

  const data = {
    histories,
  }
  const res = await callAPIRequest(url, data)
  return res
}
