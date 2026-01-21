import './App.css'
import { Suspense, lazy } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '../public/vite.svg'

// Works also with SSR as expected
const Card = lazy(() => import('./Card'))

const App: React.FC<{ initialData?: Dict }> = ({ initialData = {} }) => {
  console.log("initialData: ", initialData)
  return (
    <main>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </Suspense>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p>initialData: {initialData?.value}</p>
    </main>
  )
}

export default App
