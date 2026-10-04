import { api } from '../../api';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { VisaoProgresso } from '../../componentes/VisaoProgresso';
import type { Progresso } from '../../tipos';

export function MeuProgresso() {
  const { dados, erro } = useCarregar(() => api<Progresso>('/progresso'));
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Meu progresso</h1>
          <p className="subtitulo">Acompanhe sua evolução, seus pontos fortes e onde vale a pena treinar mais.</p>
        </div>
      </div>
      {erro ? <ErroDeCarga erro={erro} /> : !dados ? <Carregando /> : <VisaoProgresso progresso={dados} />}
    </div>
  );
}
