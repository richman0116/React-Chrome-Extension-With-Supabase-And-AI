import { SupabaseClient } from '@supabase/supabase-js'
import { CircleInterface } from '../types/circle'
import { CircleGenerationStatus, supabaseSotrageUrl } from '../utils/constants'
import {
  getGeneratedCircles,
  getGeneratedCirclesFromHistory,
} from '../utils/edgeFunctions'
import { getSpecificNumberOfWords, uploadImageToSupabase } from '../utils/helpers'
import { IHistory } from '../types/history'
// import { BJActions } from './actions'

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
  getFromStorage(tabId?.toString()).then((generationStatus: any) => {
    if (
      generationStatus &&
      generationStatus.autoGeneratingCircles &&
      Object.keys(generationStatus.autoGeneratingCircles).length > 0 &&
      generationStatus.autoGeneratingCircles.type === type
    ) {
      let circleGeneratedStatus = generationStatus
      circleGeneratedStatus.autoGeneratingCircles = {
        type,
        status: CircleGenerationStatus.SUCCEEDED,
        result: circles,
      }
      setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
    }
  })
}
const circleGenerationFailedHandler = (type: 'auto' | 'manual', tabId: number) => {
  getFromStorage(tabId?.toString()).then((generationStatus) => {
    const circleGeneratedStatus = generationStatus
    if (type === 'auto') {
      circleGeneratedStatus.autoGeneratingCircles = {
        type,
        status: CircleGenerationStatus.FAILED,
        result: [],
      }
    } else if (type === 'manual') {
      circleGeneratedStatus.manualCreatingCircle = {
        type,
        status: CircleGenerationStatus.FAILED,
        result: [],
      }
    }
    setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
  })
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

export const handleCircleGenerationWithHistory = (
  tabId: number,
  histories: IHistory[]
) => {
  getGeneratedCirclesFromHistory(histories)
    .then((res1: any) => {
      if (res1?.error) {
        circleGenerationFailedHandler('auto', tabId)
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
  imageData: any,
  tagNames: string[],
  isGenesisPost: boolean,
  type: string
) => {
  console.log("handleCircleCreation function was invoked!");
  supabase
    .rpc('tags_add_new_return_all_ids', {
      tag_names: tagNames,
    })
    .then(async (result) => {
      const addedTags = result.data

      const genesisPostCircleCreationFuncName =
        'circles_checkpoint_add_new_with_genesis_post'
      const generalCircleCreationFuncName =
        'circles_checkpoint_add_new_with_tags_return_id'
      const { data } = await supabase.rpc(
        `${isGenesisPost ? genesisPostCircleCreationFuncName : generalCircleCreationFuncName}`,
        {
          p_circle_name: name,
          p_url: pageUrl,
          p_circle_description: description,
          circle_tags: addedTags,
        }
      )
      if (!data) {
        return
      }
      const addedCircleId = data
      try {
        // upload the converted image to Supabase storage
        let result;
        if (typeof (imageData) === 'string') {
          const imageBuffer = Uint8Array.from(atob(imageData), (c) =>
            c.charCodeAt(0)
          ).buffer
          result = await uploadImageToSupabase(
            imageBuffer,
            'media_bucket',
            `circle_images/${addedCircleId}.webp`
          )
        } else {
          result = await uploadImageToSupabase(
            imageData,
            'media_bucket',
            `circle_images/${addedCircleId}.webp`
          )
        }

        if (result) {
          getFromStorage(tabId?.toString()).then((generationStatus) => {
            const circleGeneratedStatus = generationStatus
            const newCircle = {
              type,
              status: CircleGenerationStatus.SUCCEEDED,
              result: [],
            }
            console.log('circle was created successfully')
            circleGeneratedStatus[type === "manual" ? "manualCreatingCircle" : "directCreatingCircle"] = newCircle
            circleGeneratedStatus.autoGeneratingCircles = {}
            setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
          })
        }
        const status = await updateCircleImageUrl(supabase, addedCircleId)
        if (!(status === 204)) {
          circleGenerationFailedHandler('manual', tabId)
        }         
      } catch (err) {
        circleGenerationFailedHandler('manual', tabId)
        console.error(err)
      }
    })
}
