import { SupabaseClient } from '@supabase/supabase-js'
import { CircleInterface } from '../types/circle'
import { CircleGenerationStatus, supabaseSotrageUrl } from '../utils/constants'
import { getGeneratedCircles } from '../utils/edgeFunctions'
import { getSpecificNumberOfWords, uploadImageToSupabase } from '../utils/helpers'

// function to get a value from storage
export const getFromStorage = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError as string))
      } else {
        resolve(JSON.parse(result[key] || '{}'))
      }
    })
  })
}

export const setToStorage = (key: string, value: string) => {
  chrome.storage.local.set({ [key]: value }, function () {})
}

export const removeItemFromStorage = (key: string) => {
  chrome.storage.local.remove(key)
}

const updateCircleImageUrl = async (supabase: SupabaseClient, circleId: string) => {
  const { error, status } = await supabase
    .from('circles')
    .update({
      circle_logo_image: `${supabaseSotrageUrl}/media_bucket/circle_images/${circleId}.webp`,
    })
    .eq('id', circleId)
  if (error) {
    console.log(error, 'An error occurred on circle image updating')
  }
  return status
}

const circleGenerationSuccessHandler = (
  type: 'auto' | 'manual',
  tabId: number,
  circles: CircleInterface[]
) => {
  setToStorage(
    tabId.toString(),
    JSON.stringify({
      type,
      status: CircleGenerationStatus.SUCCEEDED,
      result: circles,
    })
  )
}
const circleGenerationFailedHandler = (type: 'auto' | 'manual', tabId: number) => {
  setToStorage(
    tabId.toString(),
    JSON.stringify({
      type,
      status: CircleGenerationStatus.FAILED,
      result: [],
    })
  )
}
export const handleCircleGeneration = (
  tabId: number,
  pageUrl: string,
  pageContent: string
) => {
  getGeneratedCircles(pageUrl, pageContent)
    .then((res1: any) => {
      if (res1?.error && res1?.error === 'context_length_exceeded') {
        const limitedWords = getSpecificNumberOfWords(pageContent, 5000)
        getGeneratedCircles(pageUrl, limitedWords).then((res2) => {
          if (res2.length > 0) {
            circleGenerationSuccessHandler('auto', tabId, res2)
          } else {
            circleGenerationFailedHandler('auto', tabId)
          }
        })
      } else {
        if (res1.length > 0) {
          circleGenerationSuccessHandler('auto', tabId, res1)
        } else {
          circleGenerationFailedHandler('auto', tabId)
        }
      }
    })
    .catch((error) => {
      circleGenerationFailedHandler('auto', tabId)
    })
}

export const handleCircleCreation = (
  supabase: SupabaseClient<any, 'public', any>,
  tabId: number,
  pageUrl: string,
  name: string,
  description: string,
  imageBlob: Blob,
  tagNames: string[]
) => {
  supabase
    .rpc('tags_add_new_return_all_ids', {
      tag_names: tagNames,
    })
    .then(async (result) => {
      const addedTags = result.data
      const { data } = await supabase.rpc(
        'circles_checkpoint_add_new_with_tags_return_id',
        {
          p_circle_name: name,
          p_url: pageUrl,
          p_circle_description: description,
          circle_tags: addedTags,
        }
      )
      const addedCircleId = data
      console.log(addedCircleId, '===== addedCircleid')
      try {
        // upload the converted image to Supabase storage
        const imageBuffer = await imageBlob.arrayBuffer()
        await uploadImageToSupabase(
          imageBuffer,
          'media_bucket',
          `circle_images/${addedCircleId}.webp`
        )

        const status = await updateCircleImageUrl(supabase, addedCircleId)
        if (status === 204) {
          circleGenerationSuccessHandler('manual', tabId, [
            {
              name,
              description,
              circle_logo_image: `${supabaseSotrageUrl}/media_bucket/circle_images/${addedCircleId}.webp`,
              tags: tagNames,
            } as CircleInterface,
          ])
        } else {
          circleGenerationFailedHandler('manual', tabId)
        }
      } catch (err) {
        circleGenerationFailedHandler('manual', tabId)
        console.error(err)
      }
    })
}
