import './App.css'

import { Outlet, BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './pages/Home/home';
import Welcome from './pages/Welcome/welcome';
import Login from './pages/Login/login';
import RegisterPage from './pages/Register/register';
import ProfilePage from './pages/Profile/profile';
import PuzzlesPage from './pages/Puzzles/puzzles';
import NewsPage from './pages/News/news';
import BoardEditor from './pages/BoardEditor/boardeditor';
import ChessGamePage from './pages/Game/game';

function App() {

	return (
		<>
			<BrowserRouter>
				<Routes>
					<Route path='/' element = {<Outlet />} >
					<Route index element = {<Welcome />} />
					<Route path='home' element = {<Home />} />
					<Route path='profile' element = {<ProfilePage />} />
					<Route path='puzzles' element = {<PuzzlesPage />} />
					<Route path='news' element = {<NewsPage />} />
					<Route path='boardeditor' element = {<BoardEditor />} />
					<Route path='login' element = {<Login />} />
					<Route path='signup' element = {<RegisterPage />} />
					<Route path='game/bullet' element = {<ChessGamePage />} />
					<Route path='game/blitz' element = {<ChessGamePage />} />
					<Route path='game/rapid' element = {<ChessGamePage />} />
					<Route path='game/classical' element = {<ChessGamePage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	)
}

export default App
