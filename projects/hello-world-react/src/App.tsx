import { useState, useEffect } from 'react'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Hello There! 👋</h1>
    </div>
  )
}

export default App
