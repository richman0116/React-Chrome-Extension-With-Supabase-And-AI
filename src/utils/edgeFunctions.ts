
export const getGeneratedCircles = async (pageUrl: string, pageContent: string ) => {
  const url = 'https://fysmrdbevwxphtrsevkn.supabase.co/functions/v1/analyzePageForCircles';
  const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c21yZGJldnd4cGh0cnNldmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUxNzkxNzMsImV4cCI6MjAxMDc1NTE3M30.gstQlVVRP6quLuDyM7pmtSY9HUoW8Igt3_ymgN3tZcA'
  }

  const data = {
    url: pageUrl,
    bodyText: pageContent
  }
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  const res = await response.json()
  return res
}
