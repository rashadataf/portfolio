import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';

const App = () => {
  return (
    <BrowserRouter>
      <div className='bg-black'>
        <Navbar />
        <Hero />
      </div>
      <About />
    </BrowserRouter>
  )
}

export default App
