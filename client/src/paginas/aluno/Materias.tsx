import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useEstado } from '../../estado';
import { CartaoMateria } from '../../componentes/CartaoMateria';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import type { MateriaResumo } from '../../tipos';

export function Materias() {
  const usuario = useEstado((e) => e.usuario)!;
  const { dados, erro, recarregar } = useCarregar(() => api<{ materias: MateriaResumo[]; total: number; concluidas: number; erros: number }>('/materias'));

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
        <ErroDeCarga erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <>
          {dados.erros > 0 && <FaixaDoCaderno erros={dados.erros} />}
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
        </>
      )}
    </div>
  );
}

/** Convite para revisar o que está no caderno de erros. */
export function FaixaDoCaderno({ erros }: { erros: number }) {
  return (
    <Link to="/jogar/revisao" className="cartao caderno-faixa">
      <span className="caderno-icone">
        <Icone nome="atualizar" tamanho={26} />
      </span>
      <span className="cresce">
        <strong>Caderno de erros</strong>
        <span className="suave pequeno">
          {erros === 1 ? '1 questão esperando' : `${erros} questões esperando`} revisão. Acerte duas vezes seguidas para tirar cada uma do caderno.
        </span>
      </span>
      <span className="botao pequeno">Revisar agora</span>
    </Link>
  );
}
