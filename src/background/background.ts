import supabase from '../utils/supabase'

import { CircleGenerationStatus } from '../utils/constants'
import { ICircleGenerationStatus } from '../types/circle'
import {
  getFromStorage,
  handleCircleCreation,
  handleCircleGeneration,
  handleCircleGenerationWithHistory,
  removeItemFromStorage,
  setToStorage,
} from './helpers'
import { BJActions, BJMessages } from './actions'
import { generateCircleImage, generateTags } from '../utils/edgeFunctions'
import { resizeAndConvertImageToBuffer } from '../utils/helpers'

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

console.log('Background.js is running')

interface SupabaseUserDataInterface {
  data?: {
    user?: {
      id?: string
      user_name?: string
      email?: string
    }
  }
}

let userLoaded = false // check if we are loading the user
let supabaseUser: SupabaseUserDataInterface = {} // store the user

let circleGeneratedStatus = {
  autoGeneratingCircles: {},
  manualCreatingCircle: {},
  directCreatingCircle: {},
}

// log user in with email and password
// if the result is success
// we will set supabaseUser to the user
const loginWithEmailPassword = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    console.log('background.js: Error logging in: ', error)
    return false
  }
  userLoaded = true
  supabaseUser = (await supabase.auth.getUser()) as SupabaseUserDataInterface
  console.log('background.js: New supabase user: ', supabaseUser)
  const session = await supabase.auth.getSession()
  setToStorage('supabaseSession', JSON.stringify(session))
  chrome.runtime.sendMessage({ loggedIn: true })
  return true
}

const loginWithGoogle = async () => {
  try {
    const manifest: any = chrome.runtime.getManifest() as chrome.runtime.Manifest
    console.log(chrome.runtime.id)

    const url = new URL('https://accounts.google.com/o/oauth2/auth')
    url.searchParams.set('client_id', manifest.oauth2.client_id)
    url.searchParams.set('response_type', 'id_token')
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))

    chrome.identity.launchWebAuthFlow(
      {
        url: url.toString(),
        interactive: true,
      },
      async (redirectedTo: any) => {
        if (chrome.runtime.lastError) {
          console.error('Authentication failed:', chrome.runtime.lastError.message)
          chrome.runtime.sendMessage({
            message: BJMessages.GOOGLE_LOGIN_RESULT,
            loggedIn: false,
          })
          return
        }

        const redirectedURL = new URL(redirectedTo)
        const params = new URLSearchParams(redirectedURL.hash.substring(1)) // Remove the leading '#'

        const idToken = params.get('id_token')
        if (idToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          })

          if (error) {
            console.error('Sign-in error:', error)
            chrome.runtime.sendMessage({
              message: BJMessages.GOOGLE_LOGIN_RESULT,
              loggedIn: false,
            })
            return
          }

          userLoaded = true
          const { session, user } = data
          supabaseUser = {
            data: {
              user,
            },
          } as SupabaseUserDataInterface
          console.log('background.js: New supabase user: ', supabaseUser)
          const newSession = {
            data: {
              session,
            },
          }
          setToStorage('supabaseSession', JSON.stringify(newSession))
          chrome.runtime.sendMessage({
            message: BJMessages.GOOGLE_LOGIN_RESULT,
            loggedIn: true,
          })
        } else {
          console.error('No ID token found in URL hash.')
          chrome.runtime.sendMessage({
            message: BJMessages.GOOGLE_LOGIN_RESULT,
            loggedIn: false,
          })
          return
        }
      }
    )
  } catch (error) {
    console.error('Error during login:', error)
    chrome.runtime.sendMessage({
      message: BJMessages.GOOGLE_LOGIN_RESULT,
      loggedIn: false,
    })
  }
}

// this function tries to log in user with session
// if the session exists
const loginUserWithSession = async () => {
  console.log('Logging in with session')
  const session = await getFromStorage('supabaseSession')
  if (session) {
    console.log('background.js: Session exists, logging in with session: ', session)
    if (session?.data?.session?.access_token && session?.data?.session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.data.session.access_token,
        refresh_token: session.data.session.refresh_token,
      })
    }
    const newSession = await supabase.auth.getSession()
    setToStorage('supabaseSession', JSON.stringify(newSession))
    chrome.runtime.sendMessage({ loggedIn: true })
  } else {
    console.log('background.js: Session does not exist, logging in with session failed.')
  }
}

const logout = async () => {
  console.log('Supabase log out')
  const { error } = await supabase.auth.signOut()
  if (error) console.log('An error occurred on log out')
  setToStorage('supabaseSession', '')
  supabaseUser = {}
  userLoaded = false
}

// get user name from saved supabaseUser variable
const getUserAvatarUrl = async () => {
  console.log(
    'background.js: Getting user avatar url with id: ',
    supabaseUser?.data?.user?.id
  )
  try {
    const response = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', supabaseUser?.data?.user?.id);
    console.log('background.js: Result of getUserAvatarUrl: ', response);
    return response;
  } catch (error) {
    console.error('background.js: Error in getUserAvatarUrl: ', error);
    throw new Error('Error getting user avatar url.');
  }
}

// this function tries to get user if user already logged in
// if not it will try to log in with session
const getUser = async () => {
  if (userLoaded) {
    return supabaseUser
  } else {
    console.log('background.js: Checking if user exists.')
    // check if user exists
    try {
      const { data: user, error } = await supabase.auth.getUser()
      if (error) {
        // we log in failed,
        console.log('background.js: Check log in error: ', error)
        await loginUserWithSession()
        supabaseUser = (await supabase.auth.getUser()) as SupabaseUserDataInterface
      } else {
        if (user) {
          console.log('background.js: User: ', user)
          supabaseUser = user as SupabaseUserDataInterface
        } else {
          await loginUserWithSession()
          supabaseUser = (await supabase.auth.getUser()) as SupabaseUserDataInterface
        }
      }
    } catch (error) {
      console.log('background.js: Error getting user: ', error)
      console.log('background.js: We will check if session exists')
      // we first get the session from storage
      loginUserWithSession()
      supabaseUser = (await supabase.auth.getUser()) as SupabaseUserDataInterface
    }
    userLoaded = true
  }
  return supabaseUser
}

const showCircleCount = async (url: string) => {
  return new Promise<void>((resolve, reject) => {
    if (url) {
      (supabase.rpc('circles_get_circles_by_url', { p_url: url }) as unknown as Promise<any> ).then(async (result) => {
        if (result.data?.length > 0) {
          await chrome.action.setBadgeText({ text: result.data.length.toString() }, resolve)
        } else {
          await chrome.action.setBadgeText({ text: '' }, resolve)
        }
      }).catch((error: any) => {
        reject(error)
      });
    } else {
      resolve();
    }
  })
}

const checkIfUserJoinedCircle = async (circleId: string) => {
  console.log('background.js: checkIfUserJoinedCircle function')
  const { data, error } = await supabase.rpc('check_auth_user_is_in_the_circle', {
    circleid: circleId,
  })
  if (error)
    console.log('An error occurred on check_auth_user_is_in_the_circle function calling')
  return data
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === BJActions.CHECK_LOGGED_IN) {
    // This is an example async function, replace with your own
    getUser()
      .then((result) => {
        console.log('background.js: Result of checkLoggedIn', result)
        if (result?.data?.user) {
          sendResponse(true)
        } else {
          sendResponse(false)
        }
      })
      .catch((error) => {
        console.log('background.js: Error checkLoggedIn: ', error)
        sendResponse({ error: 'There was an error' })
      })
    return true // This will keep the message channel open until sendResponse is executed
  }

  if (request.action === BJActions.CHECK_IF_CIRCLE_EXIST) {
    console.log('background.js: Check if circle already exist')
    if (supabaseUser) {
      supabase
        .rpc('check_if_circle_exist', { circle_name: request.name })
        .then((result) => {
          sendResponse(result.data)
        })
    }
    return true // This will keep the message channel open until sendResponse is executed
  }

  if (request.action === BJActions.LOGIN_WITH_EMAIL_PASSWORD) {
    console.log('background.js: Logging in with email and password')
    loginWithEmailPassword(request.email, request.password)
      .then((result) => {
        console.log('background.js: Result of loginWithEmailPassword: ', result)
        sendResponse(result)
      })
      .catch((error) => {
        console.log('background.js: Error loginWithEmailPassword: ', error)
        sendResponse({ error: 'Error during sign in.' })
      })
    return true
  }

  if (request.action === BJActions.LOGIN_WITH_GOOGLE) {
    console.log('background.js: Logging in with google')
    loginWithGoogle()
  }

  if (request.action === BJActions.LOGOUT) {
    logout().then(() => {
      sendResponse(true)
    })
    return true
  }

  if (request.action === BJActions.GET_USER_AVATAR_URL) {
    console.log('background.js: Getting user avatar url')
    getUserAvatarUrl()
      .then((result: any) => {
        console.log('background.js: Result of getUserAvatarUrl: ', result)
        if (result.data && result.data.length > 0) {
          sendResponse(result.data[0])
        } else {
          sendResponse({error: 'No avatar URL found'})
        }
      })
      .catch((error) => {
        console.log('background.js: Error getUserAvatarUrl: ', error)
        sendResponse({ error: 'Error getting user avatar url.' })
      })
    return true
  }
  
  if (request.action === BJActions.GET_PAGE_CONTENT) {
    console.log('background.js: Getting page content')
    if (supabaseUser) {
      chrome.scripting
        .executeScript({
          target: { tabId: request.tabId },
          func: () => {
            const texts = document.body.innerText
            return texts
          },
        })
        .then((result) => {
          // console.log(result[0].result)
          sendResponse(result[0].result)
          // it's not needed right now but maybe later we will need to look at the content
          // const hash = CryptoJS.SHA256(result[0].result).toString();
          // console.log(changeInfo.url)
          // console.log(hash);
        })
        .catch((err) => {
          console.error(`Error executing script: ${err}`)
          sendResponse({ error: 'Error getting page content.' })
        })
    } else {
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }
  if (request.action === BJActions.GET_CIRCLES) {
    console.log('background.js: Getting circles')
    if (supabaseUser) {
      supabase
        .rpc('circles_get_circles_by_url', { p_url: request.url })
        .then((result) => {
          console.log('background.js: result of getting circles: ', result)
          sendResponse(result)
        })
    } else {
      console.error('background.js: User not logged in when calling getCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }
  if (request.action === BJActions.GET_USER_CIRCLES) {
    console.log('background.js: Getting User circles')
    if (supabaseUser) {
      supabase
        .rpc('get_user_circles', { userid: supabaseUser.data?.user?.id })
        .then((result) => {
          console.log('background.js: result of getting user circles: ', result)
          sendResponse(result)
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.GET_SIMILAR_CIRCLES_FROM_TAGS) {
    console.log('background.js: Getting Recommended Circles')
    if (supabaseUser) {
      supabase
        .rpc('get_similar_circles_from_tags', { tag_names: request.tags })
        .then((result) => {
          console.log('background.js: result of getting similar circles: ', result)
          sendResponse(result.data)
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.GET_RECOMMENDED_CIRCLES) {
    console.log(
      "background.js: Getting Recommended Circles from the current page's circles"
    )
    if (supabaseUser) {
      supabase
        .rpc('get_related_circles_by_circle_ids', { circle_ids: request.circleIds })
        .then((result) => {
          console.log('background.js: result of getting recommended circles: ', result)
          sendResponse(result.data)
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.CREATE_CIRCLE) {
    console.log('background.js: CREATE_CIRCLE was invoked!')
    if (supabaseUser) {
      const {
        tabId,
        url,
        circleName,
        circleDescription,
        imageData,
        tags,
        isGenesisPost,
        type
      } = request
      const generatingCircle: ICircleGenerationStatus = {
        type: type,
        status: CircleGenerationStatus.GENERATING,
        result: [],
      }

      circleGeneratedStatus[type === "manual" ? "manualCreatingCircle" : "directCreatingCircle"] = generatingCircle

      setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
      try {
        if (tags.length === 1 && tags[0] === '') {
          try {
            generateTags(circleName, circleDescription).then(
              (addedTagNames: string[]) => {
                handleCircleCreation(
                  supabase,
                  tabId,
                  url,
                  circleName,
                  circleDescription,
                  imageData,
                  addedTagNames,
                  isGenesisPost,
                  type
                )
              }
            )
          } catch (err) {
            sendResponse({error: err})
          }
        } else {
          try {
            handleCircleCreation(
              supabase,
              tabId,
              url,
              circleName,
              circleDescription,
              imageData,
              tags,
              isGenesisPost,
              type
            )
          } catch (err) {
            sendResponse({error: err})
          }
        }
      } catch (err) {
        sendResponse({error: err})
      }
      sendResponse(true)
    } else {
      console.error('background.js: User not logged in when creating a circle')
      sendResponse({ error: 'User not logged in' })
    }

    return true
  }

  if (request.action === BJActions.JOIN_CIRCLE) {
    if (supabaseUser) {
      supabase
        .rpc('users_join_circle', {
          circle_id: request.circleId,
        })
        .then(() => {
          sendResponse(true)
        })
    } else {
      console.error('background.js: User not logged in when joining circle')
      sendResponse({ error: 'User not logged in' })
    }

    return true
  }

  if (request.action === BJActions.CLAIM_CIRCLE) {
    if (supabaseUser) {
      supabase
        .rpc('circles_claim_circle', {
          p_url: request.url,
          circle_id: request.circleId,
        })
        .then((result) => {
          sendResponse(true)
        })
    } else {
      console.error('background.js: User not logged in when claiming circle')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.GENERATE_CIRCLES) {
    console.log(
      'background.js: Getting generated circles from the Edge function and saving it to local storage'
    )
    if (supabaseUser) {
      const tabId = request.tabId
      const generatingCircles: ICircleGenerationStatus = {
        type: 'auto',
        status: CircleGenerationStatus.GENERATING,
        result: [],
      }

      circleGeneratedStatus.autoGeneratingCircles = generatingCircles

      setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))

      try {
        handleCircleGeneration(tabId, request.pageUrl, request.pageContent)
        sendResponse(true)
      } catch (err) {
        sendResponse(false)
      }
    } else {
      console.error('background.js: User not logged in when generating circles')
      sendResponse({ error: 'User not logged in' })
    }

    return true
  }
  if (request.action === BJActions.GENERATE_CIRCLES_WITH_HISTORY) {
    console.log(
      'background.js: Getting generated circles with history from the Edge function and saving it to local storage'
    )
    if (supabaseUser) {
      const tabId = request.tabId
      const generatingCircles: ICircleGenerationStatus = {
        type: 'auto',
        status: CircleGenerationStatus.GENERATING,
        result: [],
      }

      circleGeneratedStatus.autoGeneratingCircles = generatingCircles

      setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))

      try {
        handleCircleGenerationWithHistory(tabId, request.histories)
        sendResponse(true)
      } catch (err) {
        sendResponse(false)
      }
    } else {
      console.error('background.js: User not logged in when generating circles')
      sendResponse({ error: 'User not logged in' })
    }

    return true
  }

  if (request.action === BJActions.GENERATE_CIRCLE_IMAGE) {
    console.log(
      'background.js: Getting generate circle image from the Edge function and saving it to local storage'
    )

    const { tabId, name, description, tags, type } = request
    getFromStorage(tabId?.toString()).then((generationStatus: any) => {
      circleGeneratedStatus = generationStatus
      const newCircle = {
        type,
        status: CircleGenerationStatus.INITIALIZED,
        result: [
          {
            id: '',
            name,
            description,
            tags,
          },
        ],
      };
      circleGeneratedStatus[type === "manual" ? "manualCreatingCircle" : "directCreatingCircle"] = newCircle;
      setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
    })

    generateCircleImage(undefined, name, description).then((result) => {
      getFromStorage(tabId?.toString()).then((generationStatus: any) => {
        circleGeneratedStatus = generationStatus
        if ((circleGeneratedStatus.manualCreatingCircle && Object.keys(circleGeneratedStatus.manualCreatingCircle).length > 0) || (circleGeneratedStatus.directCreatingCircle && Object.keys(circleGeneratedStatus.directCreatingCircle).length > 0)) {
          if (result.error) {
            const failedCircle = {
              type,
              status: CircleGenerationStatus.FAILED,
              result: [
                {
                  id: '',
                  name,
                  description,
                  tags,
                },
              ],
            }
            circleGeneratedStatus[type==="manual" ? "manualCreatingCircle" : "directCreatingCircle"] = failedCircle
            setToStorage(
              tabId.toString(),
              JSON.stringify(circleGeneratedStatus)
            )
            sendResponse({error: result.error})
          } else if (result.url) {
            const imageUrl = result?.url?.replaceAll('"', '')
            const newCircleGenerationStatus: ICircleGenerationStatus = {
              type: type,
              status: CircleGenerationStatus.INITIALIZED,
              result: [
                {
                  id: '',
                  name,
                  description,
                  tags,
                  circle_logo_image: imageUrl,
                },
              ],
            }

            circleGeneratedStatus[type === "manual" ? "manualCreatingCircle" : "directCreatingCircle"] = newCircleGenerationStatus

            setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
            sendResponse({imageUrl: imageUrl})
          }
        } else {
          circleGeneratedStatus = generationStatus
          circleGeneratedStatus.manualCreatingCircle = {}
          circleGeneratedStatus.directCreatingCircle = {}
          setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
        }
      })
    })

    return true
  }

  if (request.action === BJActions.GET_CIRCLE_GENERATION_STATUS) {
    try {
      console.log('background.js: Getting saved circles from the storage')
      const tabId = request.tabId
      getFromStorage(tabId?.toString())
        .then((generationStatus: any) => {
          if (Object.keys(generationStatus).length === 0) {
            console.log(generationStatus, "ssssssssssssss", tabId);
            generationStatus = circleGeneratedStatus;
          }
          console.log('Chrome localstorage data : ', generationStatus)
          let autoLength = 0, manualLength = 0, directLength = 0; 
          if(generationStatus.autoGeneratingCircles) autoLength = Object.keys(generationStatus.autoGeneratingCircles).length;
          if(generationStatus.manualCreatingCircle) manualLength = Object.keys(generationStatus.manualCreatingCircle).length;
          if(generationStatus.directCreatingCircle) directLength = Object.keys(generationStatus.directCreatingCircle).length;
          if (autoLength > 0 && manualLength === 0) {
            sendResponse(generationStatus.autoGeneratingCircles)
          }
          if (manualLength > 0 && autoLength === 0) {
            sendResponse(generationStatus.manualCreatingCircle)
          }
          if (generationStatus.directCreatingCircle.type === 'direct') {
            sendResponse(generationStatus.directCreatingCircle)
          }
          if (autoLength === 0 && manualLength === 0 && directLength === 0) sendResponse({})
          if (autoLength > 0 && manualLength > 0) {
            if(generationStatus.autoGeneratingCircles.status === CircleGenerationStatus.SUCCEEDED && generationStatus.manualCreatingCircle.status === CircleGenerationStatus.INITIALIZED)
              sendResponse(generationStatus.manualCreatingCircle)
          }
        })
        .catch(() => {
          sendResponse(null)
        })
    } catch (error) {
      console.error('An error occurred while getting circle generation status:', error);
      sendResponse(null);
    }
    return true
  }

  if (request.action === BJActions.REMOVE_CIRCLES_FROM_STORAGE) {
    const tabId = request.tabId
    console.log('background.js: Removing circles from the storage. TabId: ', tabId)
    try {
      getFromStorage(tabId?.toString())
        .then((generationStatus: any) => {
          circleGeneratedStatus = generationStatus
          let autoLength = 0, manualLength = 0, directLength = 0;
          if(generationStatus.autoGeneratingCircles) autoLength = Object.keys(generationStatus.autoGeneratingCircles).length
          if(generationStatus.manualCreatingCircle) manualLength = Object.keys(generationStatus.manualCreatingCircle).length
          if(generationStatus.directCreatingCircle) directLength = Object.keys(generationStatus.directCreatingCircle).length
          
          if (directLength) circleGeneratedStatus.directCreatingCircle = {}
          if (autoLength > 0 && manualLength > 0) {
            circleGeneratedStatus.manualCreatingCircle = {}
          } else if (autoLength === 0 && manualLength > 0) {
            circleGeneratedStatus.manualCreatingCircle = {}
          } else if (manualLength === 0 && autoLength > 0) {
            circleGeneratedStatus.autoGeneratingCircles = {}
          }
          
          setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
          sendResponse(circleGeneratedStatus)
        })
        .catch(() => {
          sendResponse(null)
        })
    } catch (err) {
      sendResponse(false)
    }

    return true
  }

  if (request.action === BJActions.ADD_TAGS) {
    console.log('background.js: Adding tags')
    if (supabaseUser) {
      supabase
        .rpc('tags_add_new_return_all_ids', {
          tag_names: request.names,
        })
        .then((result) => {
          console.log('background.js: Result of adding tags: ', result)
          sendResponse(result.data)
        })
    } else {
      console.error('background.js: User not logged in when adding tags')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.CHECK_IF_USER_JOINED_CIRCLE) {
    checkIfUserJoinedCircle(request.circleId).then((result) => {
      sendResponse(result)
    })
    return true
  }

  if (request.action === BJActions.SHOW_CIRCLE_COUNT) {
    showCircleCount(request.url).then(() => {
      sendResponse({ message: "circle badge number has been updated" });
    }).catch(error => {
      console.error('Error updating badge:', error);
      sendResponse({ error: 'Failed to update badge' });
    });
    return true;
  }

  if (request.action === BJActions.GET_UNIQUE_USERS_COUNT_IN_USER_CIRCLES) {
    console.log("background.js: Getting unique users count in user's circles")
    if (supabaseUser) {
      supabase.rpc('get_users_in_my_circles').then((result) => {
        console.log(
          "background.js: result of getting unique users count in user's circles : ",
          result
        )
        sendResponse(result?.data?.length)
      })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.GET_USER_CIRCLE_COUNT) {
    console.log("background.js: Getting user circle's count")
    if (supabaseUser) {
      (supabase.rpc('circles_get_user_circles_count', { userid: supabaseUser.data?.user?.id }) as unknown as Promise<any>)
        .then((result: any) => {
          console.log('background.js: result of getting user circles count : ', result)
          sendResponse(result.data)
        }).catch((error: any) => {
          sendResponse({error: error.message || 'Error fetching circles count'})
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.CREATE_POST) {
    console.log('background.js: Creating a post')
    const { context, circleId } = request
    if (supabaseUser) {
      supabase
        .rpc('posts_create_post_with_post_image_url', {
          context,
          circle_id: circleId,
          url: '',
        })
        .then((result) => {
          console.log('background.js: result of getting user circles count : ', result)
          const { data, error } = result
          if (error) {
            sendResponse({ error })
          }
          sendResponse(data)
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
  }

  if (request.action === BJActions.SAVE_COMMENT_TO_STORAGE) {
    console.log('background.js: Saving comment to storage.')
    const { comment } = request
    setToStorage("comment", JSON.stringify(comment))
    return true;
  }

  if (request.action === BJActions.GET_COMMENT_FROM_SOTRAGE) {
    console.log('background.js: Getting comment from storage.')
    getFromStorage('comment').then((result) => {
      sendResponse(result)
    })
    return true
  }

  if (request.action === BJActions.REMOVE_COMMENT_FROM_STORAGE) {
    console.log('background.js: Removing comment from storage.')
    removeItemFromStorage('comment');
  }

  if (request.action === BJActions.GENERATE_DIRECT_CIRCLE) {
    console.log('background.js: Generating direct circle.')
    const { tabId, name, description, tags, url, circleName, circleDescription, isGenesisPost, type } = request;
    if (supabaseUser) {
      getFromStorage(tabId?.toString()).then((generationStatus: any) => {
        circleGeneratedStatus = generationStatus
        const newCircle = {
          type: 'direct',
          status: CircleGenerationStatus.INITIALIZED,
          result: [
            {
              id: '',
              name,
              description,
              tags,
            },
          ],
        };
        circleGeneratedStatus["directCreatingCircle"] = newCircle;
        setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
      })

      generateCircleImage(undefined, name, description).then((result) => {
        getFromStorage(tabId?.toString()).then(async (generationStatus: any) => {
          circleGeneratedStatus = generationStatus
          if ((circleGeneratedStatus.directCreatingCircle && Object.keys(circleGeneratedStatus.directCreatingCircle).length > 0)) {
            if (result.error) {
              const failedCircle = {
                type: 'direct',
                status: CircleGenerationStatus.FAILED,
                result: [
                  {
                    id: '',
                    name,
                    description,
                    tags,
                  },
                ],
              }
              circleGeneratedStatus["directCreatingCircle"] = failedCircle
              setToStorage(
                tabId.toString(),
                JSON.stringify(circleGeneratedStatus)
              )
              sendResponse({ error: result.error })
            } else if (result.url) {
              const imageUrl = result?.url?.replaceAll('"', '')
              const newCircleGenerationStatus: ICircleGenerationStatus = {
                type: 'direct',
                status: CircleGenerationStatus.INITIALIZED,
                result: [
                  {
                    id: '',
                    name,
                    description,
                    tags,
                    circle_logo_image: imageUrl,
                  },
                ],
              }

              circleGeneratedStatus["directCreatingCircle"] = newCircleGenerationStatus

              setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
              
              const imageData = await resizeAndConvertImageToBuffer(imageUrl, 'background')
              
              const generatingCircle: ICircleGenerationStatus = {
                type: 'direct',
                status: CircleGenerationStatus.GENERATING,
                result: [],
              }

              circleGeneratedStatus["directCreatingCircle"] = generatingCircle

              setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
              try {
                if (tags.length === 1 && tags[0] === '') {
                  try {
                    generateTags(circleName, circleDescription).then(
                      (addedTagNames: string[]) => {
                        handleCircleCreation(
                          supabase,
                          tabId,
                          url,
                          circleName,
                          circleDescription,
                          imageData,
                          addedTagNames,
                          isGenesisPost,
                          type
                        )
                      }
                    )
                  } catch (err) {
                    sendResponse({ error: err })
                  }
                } else {
                  try {
                    handleCircleCreation(
                      supabase,
                      tabId,
                      url,
                      circleName,
                      circleDescription,
                      imageData,
                      tags,
                      isGenesisPost,
                      type
                    )
                  } catch (err) {
                    sendResponse({ error: err })
                  }
                }
              } catch (err) {
                sendResponse({ error: err })
              }
              sendResponse(true)
            } else {
              circleGeneratedStatus = generationStatus
              circleGeneratedStatus.manualCreatingCircle = {}
              circleGeneratedStatus.directCreatingCircle = {}
              setToStorage(tabId.toString(), JSON.stringify(circleGeneratedStatus))
              sendResponse({ error: 'something went wrong!' })
            }
          }
        })
      })
    } else {
      console.error('background.js: User not logged in when creating a circle')
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }
})

// whenever we update a tab, log the url
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url === undefined) return
  // check if the url starts with https or http
  console.log('URL BEFORE CHECKING: ', changeInfo.url)
  if (!changeInfo.url.startsWith('https://') && !changeInfo.url.startsWith('http://')) {
    console.log('URL does not start with https or http.')
    return
  }
  const url = new URL(changeInfo.url)
  console.log(url.href)
  if (bannedURLList.includes(url.href)) {
    console.log("background.js: URL is in the list of sites that we don't support.")
    return
  }
  // execute a content script to get the text content of the page
  if (supabaseUser && changeInfo.url) {
    await showCircleCount(changeInfo.url)
  }
})

// whenever we create a new tab, log the url
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab created. URL: ${tab.url}`)
})

// whenever new tab is activated
chrome.tabs.onActivated.addListener((actveInfo) => {
  chrome.tabs.get(actveInfo.tabId, async (tab) => {
    const url = tab.url
    if (url) {
      await showCircleCount(url)
    }
  })
})
