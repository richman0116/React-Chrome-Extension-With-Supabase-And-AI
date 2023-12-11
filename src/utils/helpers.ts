export const isMainURL = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.pathname === '/';
  } catch (e) {
    console.error("Invalid URL provided:", e);
    return false;
  }
}

export const getSpecificNumberOfWords = (sentences: string, number: number) => {
  const words = sentences.split(' ')
  return words.slice(0, number).join(' ')
}
