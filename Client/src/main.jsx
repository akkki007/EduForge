import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // ✅ Import Provider
import store from './redux/store'; // ✅ Import Redux store
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* ✅ Wrap App inside Provider */}
      <App />
    </Provider>
  </StrictMode>
);
