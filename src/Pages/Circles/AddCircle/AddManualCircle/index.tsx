import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import FormLine from '../../../../components/FormLine'
import { useCircleContext } from '../../../../context/CircleContext'
import CreationHeader from '../../../../components/CreationHeader'
import Button from '../../../../components/Buttons/Button'
import GenerateButton from '../../../../components/Buttons/GenerateButton'
import Refresh from '../../../../components/SVGIcons/Refresh'
import Loading from '../../../../components/Loading'

import {
  getCircleLoadingMessage,
  resizeAndConvertImageToBlob,
} from '../../../../utils/helpers'
import { CircleGenerationStatus, circlePageStatus } from '../../../../utils/constants'
import { generateCircleImage } from '../../../../utils/edgeFunctions'

import { CircleInterface } from '../../../../types/circle'
import { initialCircleData } from '..'
import UploadIcon from '../../../../components/SVGIcons/UploadIcon'
import classNames from 'classnames'
import { BJActions } from '../../../../background/actions'

interface CircleFormData {
  name: string
  description: string
}

interface IAddManualCIrcle {
  circleData: CircleInterface
  setCircleData: Dispatch<SetStateAction<CircleInterface>>
}

export const AddManualCircle = ({ circleData, setCircleData }: IAddManualCIrcle) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [circleImageUrl, setCircleImageUrl] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [message, setMessage] = useState(getCircleLoadingMessage());

  const { currentUrl: url, currentTabId, setPageStatus, circleGenerationStatus, getCircleGenerationStatus } = useCircleContext()
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm<CircleFormData>({
    defaultValues: circleData,
  })

  const { tags } = circleData

  useEffect(() => {
    if (circleData.circle_logo_image) {
      setCircleImageUrl(circleData.circle_logo_image)
    }
  }, [circleData.circle_logo_image])

  useEffect(() => {
    if (circleGenerationStatus?.status === CircleGenerationStatus.GENERATING) {
      setIsSaving(true)
    } else if (circleGenerationStatus?.status === CircleGenerationStatus.FAILED) {
      setIsSaving(false)
    } else {
      setIsSaving(false)
    }
  }, [circleGenerationStatus?.status])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(getCircleLoadingMessage());
    }, 3000); // Change message every 3 seconds
    if (!isSaving) {
      clearInterval(intervalId); // clean up the interval if loading circles finished
    }

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [isSaving]); // Empty dependency array means this effect runs once on mount

  const handleCreateCircle = useCallback(async (data: CircleFormData) => {
    if (circleImageUrl) {
      setIsSaving(true)
      const imageBuffer = await resizeAndConvertImageToBlob(circleImageUrl)
      const imageData = btoa(String.fromCharCode(...Array.from(imageBuffer)))

      const { name, description } = data
      chrome.runtime.sendMessage(
        {
          action: BJActions.CREATE_CIRCLE,
          tabId: currentTabId,
          url,
          circleName: name,
          circleDescription: description,
          imageData,
          tags: tags,
        },
        (response: boolean) => {
          if (response) {
            getCircleGenerationStatus()
          }
        }
      )
    }
  }, [circleImageUrl, currentTabId, getCircleGenerationStatus, tags, url])

  const handleGenerateImage = useCallback(async () => {
    const name = getValues('name')
    const description = getValues('description')
    if (name && description) {
      setIsGeneratingImage(true)
      const result = await generateCircleImage(undefined, name, description)
      setCircleImageUrl(result?.url?.replaceAll('"', ''))
      setIsGeneratingImage(false)
    }
  }, [getValues])

  useEffect(() => {
    handleGenerateImage()
  }, [handleGenerateImage])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0]
    if (imgFile) {
      const reader = new FileReader()
      reader.onload = () => {
        setCircleImageUrl(reader.result as string)
      }
      reader.readAsDataURL(imgFile)
    }
  }

  return (
    <div className="w-full h-full py-5">
      <CreationHeader
        title="Create Circle"
        onBack={() => {
          setCircleData(initialCircleData)
          setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
        }}
      />
      <div className="w-full flex flex-col gap-2 justify-between">
        {isSaving && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-gray-600 flex flex-col gap-y-3">
            <div className="-mt-6">
              <p className="text-sm font-medium leading-normal text-center text-brand">Running on background</p>
              <p className="text-base font-medium leading-normal text-center text-primary">{message}...</p>
              <div className='h-1.5 w-full bg-secondary overflow-hidden rounded-xl'>
                <div className='animate-progress w-full h-full bg-brand origin-left-right rounded-xl' />
              </div>
            </div>
          </div>
        )}
        {!isSaving &&
          <form
            onSubmit={handleSubmit(handleCreateCircle)}
            className="space-y-6 w-full flex flex-col items-center"
          >
            <FormLine
              title="Name:"
              id="name"
              type="text"
              error={errors.name?.message}
              {...register('name', {
                required: "Circle name is required",
                // --- will be applied if we need later ------
                // pattern: {
                //   value: /^[a-zA-Z0-9 _-]+$/,
                //   message: "Please enter a valid name"
                // }
              })}
              placeholder="Give it a good name!"
            />
            <FormLine
              title="Description:"
              id="description"
              type="text"
              error={errors.description?.message}
              {...register('description', {
                required: "Circle description is required",
                // --- will be applied if we need later ------
                // pattern: {
                //   value: /^[a-zA-Z0-9 _-]+$/,
                //   message: "Please enter a valid description"
                // }
              })}
              placeholder="What does it about?"
            />
            {isGeneratingImage ? (
              <div className="w-25 h-25 flex items-center justify-center">
                <Loading />
              </div>
            ) : (
              <div className="w-25 h-25 ">
                <div className="relative w-full h-full rounded-full bg-secondary">
                  {circleImageUrl ? (
                    <div>
                      <img
                        src={circleImageUrl}
                        alt="circle logo"
                        className="z-10 rounded-full w-25 h-25"
                      />
                    </div>
                  ) : null}
                  <div
                    className="absolute top-0 inset-0 flex items-center justify-center group cursor-pointer"
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <div
                      className={classNames('w-fit text-tertiary z-20', {
                        'hidden group-hover:flex text-transparent group-hover:text-white':
                          circleImageUrl,
                        'group-hover:text-black/50': !circleImageUrl,
                      })}
                    >
                      <UploadIcon />
                    </div>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <div className="w-full flex justify-center">
              <GenerateButton type="button" onClick={handleGenerateImage}>
                <Refresh />
                <p>{isGeneratingImage ? 'Generating' : 'Generate'}</p>
              </GenerateButton>
            </div>

            <div className="fixed bottom-6 w-fit justify-center">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Creating' : 'Create'}
              </Button>
            </div>
          </form>}
      </div>
    </div>
  )
}

export default AddManualCircle
