import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext.jsx';
import { AuthProvider } from '@/context/AuthContext.jsx';
import AppRouter from '@/routes/AppRouter.jsx';

/** Raíz de la aplicación: proveedores de estado compartido y enrutador. */
export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  );
}
