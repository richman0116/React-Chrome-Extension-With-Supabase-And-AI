
import supabase from '../utils/supabase'
import { Session, AuthError } from '@supabase/supabase-js';

import { getGeneratedCircles, generateCircleImage } from '../utils/edgeFunctions';

const bannedURLList: string[] = [
  "https://twitter.com/home",
  "https://www.facebook.com/",
  "https://www.quora.com/",
  "https://www.reddit.com/",
  "https://www.youtube.com/",
  "https://www.google.com/maps",
  "https://www.google.com/",
  "https://drive.google.com/",
  "https://mail.google.com/mail/u/0/#inbox",
  "https://www.microsoft.com/en-us/microsoft-365/outlook/email-and-calendar-software-microsoft-outlook",
  "https://www.instagram.com/",
  "https://www.netflix.com/browse",
  "https://www.wikipedia.org/",
  "https://www.amazon.com/",
  "https://www.microsoft.com/en-us/microsoft-365/onedrive/online-cloud-storage",
  "https://www.tiktok.com/",
  "https://www.bing.com/",
  "https://www.linkedin.com/feed/",
  "https://docs.google.com/",
  "https://www.bilibili.com/",
];


console.log("Background.js is running")

interface SupabaseUserDataInterface {
  data?: {
    user?: {
      id?: string
      user_name?: string
      email?: string
    }
  }
}

let userLoaded = false; // check if we are loading the user
let supabaseUser: SupabaseUserDataInterface = {}; // store the user
let supabaseUsername: string = ""; // store the username

// function to get a value from storage
function getFromStorage(key: string): Promise<{
  data: {
    session: Session;
  };
  error: null;
} | {
  data: {
    session: null;
  };
  error: AuthError;
} | {
  data: {
    session: null;
  };
  error: null;
}> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError as string));
      } else {
        resolve(JSON.parse(result[key] || "{}"));
      }
    });
  });
}

function setToStorage(key: string, value: string) {
  chrome.storage.local.set({ [key]: value }, function () {
    console.log(`Value of ${key} is set to ${value}`);
  });
}

// log user in with email and password
// if the result is success
// we will set supabaseUser to the user
async function loginWithEmailPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    console.log("background.js: Error logging in: ", error);
    return false;
  }
  userLoaded = true;
  supabaseUser = await supabase.auth.getUser() as SupabaseUserDataInterface;
  console.log("background.js: New supabase user: ", supabaseUser)
  const session = await supabase.auth.getSession();
  setToStorage('supabaseSession', JSON.stringify(session));
  chrome.runtime.sendMessage({ loggedIn: true });
  return true;
}

// this function tries to log in user with session
// if the session exists
async function loginUserWithSession() {
  console.log('Logging in with session')
  const session = await getFromStorage('supabaseSession');
  if (session) {
    console.log("background.js: Session exists, logging in with session: ", session);
    if (session?.data?.session?.access_token && session?.data?.session?.refresh_token) {
      await supabase.auth.setSession({ access_token: session.data.session.access_token, refresh_token: session.data.session.refresh_token })
    }
    const newSession = await supabase.auth.getSession()
    setToStorage('supabaseSession', JSON.stringify(newSession));
    chrome.runtime.sendMessage({ loggedIn: true });
  } else {
    console.log("background.js: Session does not exist, logging in with session failed.")
  }
}

async function logout() {
  console.log('Supabase log out')
  const { error } = await supabase.auth.signOut()
  if (error) console.log("An error occurred on log out")
  setToStorage('supabaseSession', '');
  supabaseUser = {}
  supabaseUsername = ''
  userLoaded = false
}

// get user name from saved supabaseUser variable
async function getUsername() {
  console.log("background.js: Getting username with id: ", supabaseUser?.data?.user?.id);
  return supabase
    .from('users')
    .select('user_name')
    .eq('id', supabaseUser?.data?.user?.id)
}

// this function tries to get user if user already logged in
// if not it will try to log in with session
async function getUser() {
  if (userLoaded) {
    return supabaseUser;
  } else {
    console.log("background.js: Checking if user exists.");
    // check if user exists
    try {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        // we log in failed,
        console.log("background.js: Check log in error: ", error);
        await loginUserWithSession();
        supabaseUser = await supabase.auth.getUser() as SupabaseUserDataInterface;
      } else {
        if (user) {
          console.log("background.js: User: ", user);
          supabaseUser = user as SupabaseUserDataInterface;
        } else {
          await loginUserWithSession();
          supabaseUser = await supabase.auth.getUser() as SupabaseUserDataInterface;
        }
      }
    } catch (error) {
      console.log("background.js: Error getting user: ", error);
      console.log("background.js: We will check if session exists")
      // we first get the session from storage
      loginUserWithSession();
      supabaseUser = await supabase.auth.getUser() as SupabaseUserDataInterface;
    }
    userLoaded = true;
  }
  return supabaseUser;
}

const showCircleCount = async (url: string) => {
  if (url) {
    supabase.rpc('circles_get_circles_by_url', { p_url: url }).then(result => {
      if (result.data?.length > 0) {
        chrome.action.setBadgeText({ text: result.data.length.toString() })
      } else {
        chrome.action.setBadgeText({ text: '' })
      }
    })
  }
}

const checkIfUserJoinedCircle = async (circleId: string) => {
  console.log("background.js: checkIfUserJoinedCircle function")
  const { data, error } = await supabase.rpc('check_auth_user_is_in_the_circle', {
    circleid: circleId
  })
  if (error) console.log("An error occurred on check_auth_user_is_in_the_circle function calling")
  return data
}

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.action === "checkLoggedIn") {
    // This is an example async function, replace with your own
    getUser().then(result => {
      console.log("background.js: Result of checkLoggedIn", result);
      if (result?.data?.user) {
        sendResponse(true);
      } else {
        sendResponse(false);
      }
    }).catch(error => {
      console.log("background.js: Error checkLoggedIn: ", error)
      sendResponse({ error: 'There was an error' });
    });
    return true;  // This will keep the message channel open until sendResponse is executed
  }
  if (request.action === "loginWithEmailPassword") {
    console.log("background.js: Logging in with email and password");
    loginWithEmailPassword(request.email, request.password).then(result => {
      console.log("background.js: Result of loginWithEmailPassword: ", result)
      sendResponse(result);
    }).catch(error => {
      console.log("background.js: Error loginWithEmailPassword: ", error)
      sendResponse({ error: 'Error during sign in.' });
    });
    return true;
  }
  if (request.action === "getUsername") {
    console.log("background.js: Getting username");
    if (supabaseUsername) {
      sendResponse(supabaseUsername)
    } else {
      getUsername().then(result => {
        console.log("background.js: Result of getUsername: ", result);
        // supabaseUsername = result?.data?[0]?.user_name;
        // sendResponse(result.data?[0].user_name);
      }).catch(error => {
        console.log("background.js: Error getUsername: ", error);
        sendResponse({ error: 'Error getting username.' });
      });
    }
    return true;
  }
  if (request.action === "getPageContent") {
    console.log("background.js: Getting page content")
    if (supabaseUser) {
      chrome.scripting.executeScript({
        target: { tabId: request.tabId },
        func: () => {
          const texts = (document.body.innerText);
          return texts;
        }
      }).then((result) => {
        // console.log(result[0].result)
        sendResponse(result[0].result)
        // it's not needed right now but maybe later we will need to look at the content
        // const hash = CryptoJS.SHA256(result[0].result).toString();
        // console.log(changeInfo.url)
        // console.log(hash);
      }).catch((err) => {
        console.error(`Error executing script: ${err}`);
        sendResponse({ error: 'Error getting page content.' })
      });
    } else {
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }
  if (request.action === "getCircles") {
    console.log("background.js: Getting circles")
    if (supabaseUser) {
      supabase.rpc('circles_get_circles_by_url', { p_url: request.url }).then(result => {
        console.log('background.js: result of getting circles: ', result)
        sendResponse(result)
      })
    } else {
      console.error("background.js: User not logged in when calling getCircles")
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }
  if (request.action === "getUserCircles") {
    console.log("background.js: Getting User circles")
    if (supabaseUser) {
      supabase.rpc('get_user_circles', { userid: supabaseUser.data?.user?.id }).then(result => {
        console.log('background.js: result of getting user circles: ', result)
        sendResponse(result)
      })
    } else {
      console.error("background.js: User not logged in when calling getUserCircles")
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }

  if (request.action === "createCircle") {
    console.log("background.js: Creating circle with name: ", request.circleName, " and rl: ", request.url)
    console.log(request.circleName, request.url, request.circleDescription, request.tags, '============================')
    supabase.rpc('circles_checkpoint_add_new_with_tags_return_id', {
      p_circle_name: request.circleName,
      p_url: request.url,
      p_circle_description: request.circleDescription,
      circle_tags: request.tags,
    }).then(result => {
      console.log("background.js: Result of creating circle with tags: ", result);
      // here we will generate the circle image by sending the edge function
      // we dont even need to await this
      generateCircleImage(result.data);
      sendResponse(result)
    })
    return true;
  }

  if (request.action === "checkIsInBanList") {
    console.log("background.js: Checking if the url is in the ban list with url:", request.url);
    sendResponse(bannedURLList.includes(request.url.toLowerCase()));
    return true;
  }

  if (request.action === 'claimCircle') {
    console.log("background.js: Claiming the circle: ", request.circleId, " and url: ", request.url)
    supabase.rpc('circles_claim_circle', {
      p_url: request.url,
      circle_id: request.circleId
    }).then(result => {
      sendResponse(true)
    })
    return true
  }

  if (request.action === 'getCircleImage') {
    // console.log("background.js: Getting generated circle image from the Edge function")
    // getGeneratedCircleImage(request.name, request.description)
    // .then((imageUrl) => {
    //   sendResponse(imageUrl)
    // })
    // .catch((error) => {
    //   sendResponse('')
    // })
    return true
  }

  if (request.action === 'getGeneratedCircles') {
    console.log("background.js: Getting generated circles from the Edge function")
    getGeneratedCircles(request.pageUrl, request.pageContent)
    .then((circles) => {
      sendResponse(circles)
    })
    .catch((error) => {
      sendResponse([])
    })
    return true
  }

  if (request.action === "addTags") {
    console.log("background.js: Adding tags")
    supabase.rpc('tags_add_new', {
      tag_names: request.names
    }).then(result => {
      console.log("background.js: Result of adding tags: ", result)
      sendResponse(result)
    })
    return true;
  }

  if (request.action === "getTags") {
    console.log("background.js: Getting Tags")
    if (supabaseUser) {
      supabase.rpc('get_all_tags').then(result => {
        console.log('background.js: result of getting all tags: ', result)
        sendResponse(result)
      })
    } else {
      console.error("background.js: User not logged in when calling getUserCircles")
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }

  if (request.action === "checkIfUserJoinedCircle") {
    checkIfUserJoinedCircle(request.circleId).then((result) => {
      sendResponse(result)
    })
    return true
  }

  if (request.action === 'logout') {
    logout().then(() => {
      sendResponse(true)
    })
    return true
  }

  if (request.action === 'showCircleCount') {
    showCircleCount(request.url).then(() => {})
    return true
  }

});

chrome.runtime.onStartup.addListener(async () => {
  console.log("background.js: We are here")
  // on startup, we do the login thing
  await getUser();
  const usernameResult = await getUsername();
  if (usernameResult) {
    // supabaseUsername = usernameResult.data[0].user_name;
  }
})

// whenever we update a tab, log the url
chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
  if (changeInfo.url === undefined) return;
  // check if the url starts with https or http
  console.log("URL BEFORE CHECKING: ", changeInfo.url)
  if (!changeInfo.url.startsWith('https://') && !changeInfo.url.startsWith('http://')) {
    console.log('URL does not start with https or http.');
    return;
  }
  const url = new URL(changeInfo.url);
  console.log(url.href);
  if (bannedURLList.includes(url.href)) {
    console.log("background.js: URL is in the list of sites that we don't support.");
    return;
  }
  // execute a content script to get the text content of the page
  if (supabaseUser && changeInfo.url) {
    await showCircleCount(changeInfo.url)
      // chrome.scripting.executeScript({
      //     target: { tabId: tab.id },
      //     func: () => {
      //         const texts = (document.body.innerText);
      //         return texts;
      //     }
      // }).then((result) => {
      //     tabContents[tab.id] = result[0].result; // we will set the tab content for viewing later
      //     // it's not needed right now but maybe later we will need to look at the content
      //     const hash = CryptoJS.SHA256(result[0].result).toString();
      //     console.log(changeInfo.url)
      //     console.log(hash);
      // }).catch((err) => {
      //     console.error(`Error executing script: ${err}`);
      // });
  }
});

// whenever we create a new tab, log the url
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab created. URL: ${tab.url}`);
});

// whenever new tab is activated
chrome.tabs.onActivated.addListener((actveInfo) => {
  chrome.tabs.get(actveInfo.tabId, async (tab) => {
    const url = tab.url
    if (url) {
      await showCircleCount(url)
    }
  })
})
