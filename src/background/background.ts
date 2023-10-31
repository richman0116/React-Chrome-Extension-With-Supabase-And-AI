
import supabase from '../utils/supabase'
import { Session, AuthError } from '@supabase/supabase-js';

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

var userLoaded = false; // check if we are loading the user
var supabaseUser: SupabaseUserDataInterface = {}; // store the user
var supabaseUsername: string = ""; // store the username

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
        resolve(result[key]);
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
    if (session?.data?.session?.access_token && session?.data?.session?.access_token) {
      await supabase.auth.setSession({ access_token: session.data.session.access_token, refresh_token: session.data.session.refresh_token })
    }
    const newSession = await supabase.auth.getSession()
    setToStorage('supabaseSession', JSON.stringify(newSession));
    chrome.runtime.sendMessage({ loggedIn: true });
  } else {
    console.log("background.js: Session does not exist, logging in with session failed.")
  }
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      supabase.rpc('circles_get_circle_names_by_url', { p_url: request.url }).then(result => {
        console.log('background.js: result of getting circles: ', result)
        sendResponse(result)
      })
    } else {
      console.error("background.js: User not logged in when calling getCircles")
      sendResponse({ error: 'User not logged in' })
    }
    return true;
  }
  if (request.action === "createCircle") {
    console.log("background.js: Creating circle with name: ", request.circleName, " and url: ", request.url)
    supabase.rpc('circles_checkpoint_add_new_record', {
      p_circlename: request.circleName,
      p_url: request.url,
    }).then(result => {
      console.log("background.js: Result of creating circle: ", result)
      sendResponse(result)
    })
    return true;
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url === undefined) return;
  // check if the url starts with https or http
  if (!changeInfo.url.startsWith('https://') && !changeInfo.url.startsWith('http://')) {
    console.log('URL does not start with https or http.');
    return;
  }
  const url = new URL(changeInfo.url);
  if (url.pathname.length <= 1) {
    console.log("background.js: URL does not have a path.");
    return;
  }
  // // execute a content script to get the text content of the page
  // if (supabaseUser) {
  //     chrome.scripting.executeScript({
  //         target: { tabId: tab.id },
  //         func: () => {
  //             const texts = (document.body.innerText);
  //             return texts;
  //         }
  //     }).then((result) => {
  //         tabContents[tab.id] = result[0].result; // we will set the tab content for viewing later
  //         // it's not needed right now but maybe later we will need to look at the content
  //         const hash = CryptoJS.SHA256(result[0].result).toString();
  //         console.log(changeInfo.url)
  //         console.log(hash);
  //     }).catch((err) => {
  //         console.error(`Error executing script: ${err}`);
  //     });
  // }
});

// whenever we create a new tab, log the url
chrome.tabs.onCreated.addListener((tab) => {
  console.log(`New tab created. URL: ${tab.url}`);
});
