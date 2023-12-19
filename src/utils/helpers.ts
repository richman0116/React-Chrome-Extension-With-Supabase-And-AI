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
export const isMainURL = (urlString: string) => {
  try {
    if (!urlString.startsWith('https://') && !urlString.startsWith('http://')) {
      return true;
    }
    return bannedURLList.includes(urlString.toLowerCase());
    return false;
  } catch (e) {
    console.error("Invalid URL provided:", e);
    return false;
  }
}

export const getSpecificNumberOfWords = (sentences: string, number: number) => {
  const words = sentences.split(' ')
  return words.slice(0, number).join(' ')
}
// console.log("urlString", urlString);
// const url = new URL(urlString);
// chrome.runtime.sendMessage({ action: "checkIsInBanList", url: url }, response => {
//   if (response){
//     console.log("response of checkIsInBanList", response);
//     return response;
//   }else{
//     return false;
//   }
// })
// return false;