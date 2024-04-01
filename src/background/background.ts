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
import { BJActions } from './actions'
import { generateCircleImage, generateTags } from '../utils/edgeFunctions'

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

// log user in with google
// if the result is success
// we will set supabaseUser to the user
const loginWithGoogle = async () => {
  const manifest = chrome.runtime.getManifest()
  if (manifest && manifest.oauth2 && manifest.oauth2.scopes) {
    const url = new URL('https://accounts.google.com/o/oauth2/auth')

    url.searchParams.set('client_id', manifest.oauth2.client_id)
    url.searchParams.set('response_type', 'id_token')
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))

    chrome.identity.launchWebAuthFlow(
      {
        url: url.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError) {
          // auth was not successful
        } else {
          // auth was successful, extract the ID token from the redirectedTo URL
          const url = new URL(redirectedTo || '')
          const params = new URLSearchParams(url.hash)

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: params.get('id_token') || '',
          })
          console.log(data, '==================')
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
      }
    )
  } else {
    return false
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
  return supabase
    .from('users')
    .select('avatar_url')
    .eq('id', supabaseUser?.data?.user?.id)
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
  if (url) {
    supabase.rpc('circles_get_circles_by_url', { p_url: url }).then((result) => {
      if (result.data?.length > 0) {
        chrome.action.setBadgeText({ text: result.data.length.toString() })
      } else {
        chrome.action.setBadgeText({ text: '' })
      }
    })
  }
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
      .then((result) => {
        console.log('background.js: Result of loginWithGoogle: ', result)
        sendResponse(result)
      })
      .catch((error) => {
        console.log('background.js: Error loginWithGoogle: ', error)
        sendResponse({ error: 'Error during sign in.' })
      })
    return true
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
        if (result.data) {
          sendResponse(result.data[0])
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
    if (supabaseUser) {
      const { tabId, url, circleName, circleDescription, imageData, tags } = request

      const generatingCircle: ICircleGenerationStatus = {
        type: 'manual',
        status: CircleGenerationStatus.GENERATING,
        result: [],
      }
      setToStorage(tabId.toString(), JSON.stringify(generatingCircle))
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
                  addedTagNames
                )
              }
            )
          } catch (err) {
            console.error('An error occurred on generating tags')
            sendResponse(false)
          }
        } else {
          handleCircleCreation(
            supabase,
            tabId,
            url,
            circleName,
            circleDescription,
            imageData,
            tags
          )
        }
        sendResponse(true)
      } catch (err) {
        sendResponse(false)
      }
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
      setToStorage(tabId.toString(), JSON.stringify(generatingCircles))

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
      setToStorage(tabId.toString(), JSON.stringify(generatingCircles))

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

    const { tabId, name, description, tags } = request
    // initialize the status
    setToStorage(
      tabId.toString(),
      JSON.stringify({
        type: 'manual',
        status: CircleGenerationStatus.INITIALIZED,
        result: [
          {
            id: '',
            name,
            description,
            tags,
          },
        ],
      })
    )

    generateCircleImage(undefined, name, description).then((result) => {
      if (result.error) {
        setToStorage(
          tabId.toString(),
          JSON.stringify({
            type: 'manual',
            status: CircleGenerationStatus.FAILED,
            result: [
              {
                id: '',
                name,
                description,
                tags,
              },
            ],
          })
        )
      } else if (result.url) {
        const imageUrl = result?.url?.replaceAll('"', '')
        const newCircleGenerationStatus: ICircleGenerationStatus = {
          type: 'manual',
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
        setToStorage(tabId.toString(), JSON.stringify(newCircleGenerationStatus))
      }
    })

    return true
  }

  if (request.action === BJActions.GET_CIRCLE_GENERATION_STATUS) {
    console.log('background.js: Getting saved circles from the storage')
    const tabId = request.tabId
    getFromStorage(tabId?.toString())
      .then((generationStatus: ICircleGenerationStatus) => {
        sendResponse(Object.keys(generationStatus).length > 0 ? generationStatus : null)
      })
      .catch(() => {
        sendResponse(null)
      })
    return true
  }

  if (request.action === BJActions.SET_CIRCLE_GENERATION_STATUS) {
    console.log('background.js: Saving circle generation status to storage')
    const tabId = request.tabId
    setToStorage(tabId.toString(), JSON.stringify(request.circleGenerationStatus))
    sendResponse(true)

    return true
  }

  if (request.action === BJActions.REMOVE_CIRCLES_FROM_STORAGE) {
    const tabId = request.tabId
    console.log('background.js: Removing circles from the storage. TabId: ', tabId)
    try {
      removeItemFromStorage(tabId.toString())
      sendResponse(true)
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
    showCircleCount(request.url).then(() => {})
    return true
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
      supabase
        .rpc('circles_get_user_circles_count', { userid: supabaseUser.data?.user?.id })
        .then((result) => {
          console.log('background.js: result of getting user circles count : ', result)
          sendResponse(result.data)
        })
    } else {
      console.error('background.js: User not logged in when calling getUserCircles')
      sendResponse({ error: 'User not logged in' })
    }
    return true
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
