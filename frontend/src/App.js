import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './component/header/Header';
import Login from './component/login/Login';
import Home from './component/home/Home';
import Mypage from './component/mypage/Mypage';
import Join from './component/join/Join';

function App() {
  return (
    <Router>
      <div className='container'>
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='users/mypage' element={<Mypage />} />
          <Route path='/users/sign' element={<Login />} />
          <Route path='/join' element={<Join />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
