// Configuración común de las pruebas: agrega comparadores como toBeInTheDocument()
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
