import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';

const App = () => {
  return (
    <BrowserRouter>
      <div className='bg-black'>
        <Navbar />
        <Hero />
      </div>
    </BrowserRouter>
  )
}

export default App
