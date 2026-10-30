import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Results from './pages/Results'
import Booking from './pages/Booking'
import CheckIn from './pages/CheckIn'
import Account from './pages/Account'
import Review from './pages/Review'
import News from './pages/News'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/zboruri" element={<Results />} />
        <Route path="/rezervare" element={<Booking />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/cont" element={<Account />} />
        <Route path="/cont/recenzie" element={<Review />} />
        <Route path="/noutati" element={<News />} />
        <Route path="*" element={<div className="wrap section"><h1>Pagina nu există</h1><p>Verifică adresa sau întoarce-te la pagina principală.</p></div>} />
      </Route>
    </Routes>
  )
}
