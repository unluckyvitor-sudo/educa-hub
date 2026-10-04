import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';

interface TurmaAdmin {
  id: number;
  nome: string;
  serieNome: string;
  descricao: string | null;
  codigo: string;
  professor: string;
  membros: number;
}

export function TurmasAdmin() {
  const { dados, erro, recarregar } = useCarregar(() => api<{ turmas: TurmaAdmin[] }>('/admin/turmas'));
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Turmas</h1>
          <p className="subtitulo">Todas as turmas criadas pelos professores da plataforma.</p>
        </div>
      </div>
      <section className="cartao">
        {erro ? (
          <ErroDeCarga erro={erro} aoTentar={recarregar} />
        ) : !dados ? (
          <Carregando />
        ) : dados.turmas.length === 0 ? (
          <Vazio titulo="Nenhuma turma criada ainda" />
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Nível</th>
                  <th>Professor</th>
                  <th>Alunos</th>
                  <th>Código</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dados.turmas.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.nome}</strong>
                      {t.descricao && <div className="suave pequeno">{t.descricao}</div>}
                    </td>
                    <td>
                      <span className="etiqueta rosa">{t.serieNome}</span>
                    </td>
                    <td>{t.professor}</td>
                    <td className="forte">{t.membros}</td>
                    <td>
                      <code>{t.codigo}</code>
                    </td>
                    <td>
                      <Link className="botao claro pequeno" to={`/turmas/${t.id}`}>
                        Abrir <Icone nome="seta" tamanho={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
