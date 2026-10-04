import { api } from '../../api';
import { useEstado } from '../../estado';
import { CartaoMateria } from '../../componentes/CartaoMateria';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import type { MateriaResumo } from '../../tipos';

export function Materias() {
  const usuario = useEstado((e) => e.usuario)!;
  const { dados, erro } = useCarregar(() => api<{ materias: MateriaResumo[]; total: number; concluidas: number }>('/materias'));

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Minhas matérias</h1>
          <p className="subtitulo">
            Conteúdos de {usuario.serieNome}. {dados && `Você concluiu ${dados.concluidas} de ${dados.total} atividades.`}
          </p>
        </div>
      </div>
      {erro ? (
        <ErroDeCarga erro={erro} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <div className="materias-grade grande">
          {dados.materias.map((m, i) => (
            <div key={m.id} className="coluna" style={{ gap: 8 }}>
              <CartaoMateria materia={m} indice={i} />
              <div className="linha pequeno suave" style={{ padding: '0 4px' }}>
                <div className="barra cresce">
                  <i style={{ width: `${m.total ? (m.concluidas / m.total) * 100 : 0}%` }} />
                </div>
                <span className="forte">
                  {m.concluidas}/{m.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
