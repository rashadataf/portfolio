import { BrowserRouter } from 'react-router-dom';
import logo from '/logo.svg';

const App = () => {
  return (
    <BrowserRouter>
      <div className='relative z-0 bg-primary'>
        <div className='h-screen flex justify-center flex-col items-center'>
          <img src={logo} alt="portfolio logo" />
          <h3>Rashad Portfolio</h3>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
