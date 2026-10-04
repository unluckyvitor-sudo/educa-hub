import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar } from '../../estado';
import { EVENTO_PRESENCA, useDuelo } from '../../tempoReal';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';
import { Icone, Chama } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import type { Amigo, ResumoUsuario } from '../../tipos';

interface Dados {
  amigos: Amigo[];
  recebidos: Amigo[];
  enviados: Amigo[];
}

function Pessoa({ pessoa, online }: { pessoa: ResumoUsuario; online?: boolean }) {
  return (
    <Link to={`/perfil/${pessoa.id}`} className="pessoa cresce">
      <Retrato avatar={pessoa.avatar} tamanho={52} online={online} />
      <span style={{ minWidth: 0 }}>
        <span className="pessoa-nome" style={{ display: 'block' }}>{pessoa.nome}</span>
        <span className="pessoa-sub">
          @{pessoa.usuario} · Nível {pessoa.nivel} · {pessoa.serieNome}
        </span>
      </span>
    </Link>
  );
}

export function Amigos() {
  const { dados, erro, recarregar } = useCarregar(() => api<Dados>('/amigos'));
  const convidar = useDuelo((d) => d.convidar);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<ResumoUsuario[] | null>(null);

  useEffect(() => {
    window.addEventListener(EVENTO_PRESENCA, recarregar);
    return () => window.removeEventListener(EVENTO_PRESENCA, recarregar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca com um pequeno atraso, para não consultar a cada tecla.
  useEffect(() => {
    if (busca.trim().length < 2) return setResultados(null);
    const relogio = window.setTimeout(() => {
      api<{ usuarios: ResumoUsuario[] }>(`/usuarios/buscar?q=${encodeURIComponent(busca.trim())}`)
        .then((r) => setResultados(r.usuarios))
        .catch(() => setResultados([]));
    }, 300);
    return () => window.clearTimeout(relogio);
  }, [busca]);

  const acao = async (fazer: () => Promise<unknown>, sucesso?: string) => {
    try {
      await fazer();
      if (sucesso) avisar(sucesso, 'sucesso');
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const conhecidos = new Set([...(dados?.amigos ?? []), ...(dados?.recebidos ?? []), ...(dados?.enviados ?? [])].map((p) => p.id));

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Amigos</h1>
          <p className="subtitulo">Adicione colegas para duelar com chat e comparar o ranking.</p>
        </div>
      </div>

      <div className="grade-2">
        <div className="coluna">
          <section className="cartao">
            <div className="cartao-titulo">
              <Icone nome="busca" tamanho={26} />
              <h2>Encontrar pessoas</h2>
            </div>
            <input className="entrada" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome ou o usuário do colega" aria-label="Buscar pessoas" />
            {resultados && (
              <div className="coluna" style={{ gap: 10, marginTop: 14 }}>
                {resultados.length === 0 && <p className="suave">Ninguém encontrado com esse nome.</p>}
                {resultados.map((p) => (
                  <div key={p.id} className="linha">
                    <Pessoa pessoa={p} />
                    {conhecidos.has(p.id) ? (
                      <span className="etiqueta cinza">Já na sua lista</span>
                    ) : (
                      <button className="botao pequeno" onClick={() => void acao(() => api('/amigos', { corpo: { usuarioId: p.id } }), 'Pedido de amizade enviado!')}>
                        <Icone nome="mais" tamanho={16} /> Adicionar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {dados && dados.recebidos.length > 0 && (
            <section className="cartao">
              <div className="cartao-titulo">
                <h2>Pedidos recebidos</h2>
                <span className="etiqueta rosa">{dados.recebidos.length}</span>
              </div>
              <div className="coluna" style={{ gap: 10 }}>
                {dados.recebidos.map((p) => (
                  <div key={p.id} className="linha quebra">
                    <Pessoa pessoa={p} />
                    <button className="botao verde pequeno" onClick={() => void acao(() => api(`/amigos/${p.amizadeId}/aceitar`, { metodo: 'POST' }), `Você e ${p.nome.split(' ')[0]} agora são amigos!`)}>
                      Aceitar
                    </button>
                    <button className="botao claro pequeno" onClick={() => void acao(() => api(`/amigos/${p.amizadeId}`, { metodo: 'DELETE' }))}>
                      Recusar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {dados && dados.enviados.length > 0 && (
            <section className="cartao">
              <div className="cartao-titulo">
                <h2>Pedidos enviados</h2>
              </div>
              <div className="coluna" style={{ gap: 10 }}>
                {dados.enviados.map((p) => (
                  <div key={p.id} className="linha">
                    <Pessoa pessoa={p} />
                    <button className="botao claro pequeno" onClick={() => void acao(() => api(`/amigos/${p.amizadeId}`, { metodo: 'DELETE' }))}>
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="cartao" style={{ alignSelf: 'start' }}>
          <div className="cartao-titulo">
            <Icone nome="usuarios" tamanho={28} style={{ color: '#5b5ff0' }} />
            <h2>Meus amigos</h2>
            {dados && <span className="etiqueta acao">{dados.amigos.filter((a) => a.online).length} online</span>}
          </div>
          {erro ? (
            <ErroDeCarga erro={erro} aoTentar={recarregar} />
          ) : !dados ? (
            <Carregando />
          ) : dados.amigos.length === 0 ? (
            <Vazio titulo="Sua lista está vazia">Use a busca ao lado para encontrar seus colegas.</Vazio>
          ) : (
            <div className="coluna" style={{ gap: 12 }}>
              {dados.amigos.map((a) => (
                <div key={a.id} className="linha quebra">
                  <Pessoa pessoa={a} online={a.online} />
                  {a.sequencia > 0 && (
                    <span className="valor pequeno" title="Sequência de dias">
                      <Chama tamanho={18} /> {a.sequencia}
                    </span>
                  )}
                  <button
                    className="botao rosa pequeno"
                    disabled={!a.online || !a.mesmoNivel}
                    title={!a.mesmoNivel ? 'Duelos são entre alunos do mesmo nível de ensino' : !a.online ? 'Seu amigo está offline' : 'Enviar convite de duelo'}
                    onClick={() => convidar(a.id, null)}
                  >
                    <Icone nome="espadas" tamanho={16} /> Desafiar
                  </button>
                  <button className="botao-icone" title="Desfazer amizade" aria-label={`Desfazer amizade com ${a.nome}`} onClick={() => window.confirm(`Desfazer a amizade com ${a.nome}?`) && void acao(() => api(`/amigos/${a.amizadeId}`, { metodo: 'DELETE' }))}>
                    <Icone nome="lixeira" tamanho={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
