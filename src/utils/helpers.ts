export const isMainURL = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.pathname === '/';
  } catch (e) {
    console.error("Invalid URL provided:", e);
    return false;
  }
}
