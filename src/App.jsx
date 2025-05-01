import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AppointmentsPage from './pages/AppointmentsPage';
import CallsPage from './pages/CallsPage';
import ContactsPage from './pages/ContactsPage';
import ContactDetailPage from './pages/ContactDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CallsPage />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:id" element={<ContactDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;