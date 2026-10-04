import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/nunito';
import '@fontsource-variable/grandstander';
import './estilos/base.css';
import './estilos/layout.css';
import './estilos/paginas.css';
import './estilos/areas.css';
import './estilos/jogos.css';
import './estilos/suporte.css';
import './estilos/conteudo.css';
import { App } from './App';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
