import './App.css'
import Home from './Components/Home'
import Room from './Components/Room'
import { BrowserRouter,Route,Routes } from 'react-router-dom'

function App() {
 

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomID" element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
