import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import './App.css';
import Footer from './components/Footer';

const App = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen max-w-screen-xl px-4 py-6 font-primary mx-auto">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default App;