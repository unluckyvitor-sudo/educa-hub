import { useRef, useState, type CSSProperties } from 'react';
import { api, mensagemDoErro } from '../../api';
import { avisar, useEstado } from '../../estado';
import { GatoVivo } from '../../gato/GatoVivo';
import type { Animacao, AvatarConfig } from '../../gato/modelo';
import { tocar } from '../../sons';
import { fundoDoAvatar, RARIDADES, TIPOS_ITEM } from '../../visual';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { soltarConfete } from '../../componentes/Gamificacao';
import { Icone, Chama, Moeda } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import type { ItemLoja, TipoItem } from '../../tipos';

export function MeuAvatar() {
  const usuario = useEstado((e) => e.usuario)!;
  const atualizarUsuario = useEstado((e) => e.atualizarUsuario);
  const { dados, erro, recarregar } = useCarregar(() => api<{ moedas: number; itens: ItemLoja[] }>('/loja'));
  const [aba, setAba] = useState<TipoItem>('pelagem');
  const [provando, setProvando] = useState<ItemLoja | null>(null);
  const [animacao, setAnimacao] = useState<Animacao>('acenar');
  const [ocupado, setOcupado] = useState(false);
  const relogio = useRef<number | undefined>(undefined);

  const avatar = usuario.avatar;
  const mostrado: AvatarConfig = provando ? { ...avatar, [provando.tipo]: provando.id } : avatar;

  const animar = (a: Animacao, ms = 1800) => {
    window.clearTimeout(relogio.current);
    setAnimacao(a);
    relogio.current = window.setTimeout(() => setAnimacao('parado'), ms);
  };

  const equipar = async (tipo: TipoItem, id: string | null) => {
    setOcupado(true);
    try {
      await api('/eu/avatar', { metodo: 'PUT', corpo: { avatar: { ...avatar, [tipo]: id } } });
      await atualizarUsuario();
      setProvando(null);
      tocar('clique');
      animar('comemorar');
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    } finally {
      setOcupado(false);
    }
  };

  const comprar = async (item: ItemLoja) => {
    setOcupado(true);
    try {
      await api('/loja/comprar', { corpo: { itemId: item.id } });
      tocar('moeda');
      soltarConfete();
      avisar(`${item.nome} agora é seu!`, 'sucesso');
      await equipar(item.tipo, item.id);
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
      animar('triste');
      setOcupado(false);
    }
  };

  const escolher = (item: ItemLoja) => {
    if (item.possui) return void equipar(item.tipo, item.id);
    setProvando(item);
    animar('surpreso', 1200);
  };

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} aoTentar={recarregar} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;

  const tipoAtual = TIPOS_ITEM.find((t) => t.id === aba)!;
  const itens = dados.itens.filter((i) => i.tipo === aba);
  const falta = provando?.preco ? provando.preco - usuario.moedas : 0;

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Meu avatar</h1>
          <p className="subtitulo">Vista seu gato do seu jeito. Ganhe moedas jogando e desbloqueie itens na loja.</p>
        </div>
        <span className="ficha ouro acoes" style={{ fontSize: 20, height: 50 }}>
          <Moeda tamanho={26} /> {usuario.moedas} moedas
        </span>
      </div>

      <div className="provador">
        <section className="provador-palco" style={{ background: fundoDoAvatar(mostrado.fundo) }}>
          <GatoVivo className="provador-gato" avatar={mostrado} animacao={animacao} girarArrastando />
          <span className="provador-dica">Arraste para girar</span>
          {provando && (
            <div className="provador-compra">
              <div className="cresce">
                <span className="pequeno suave">Experimentando</span>
                <strong>{provando.nome}</strong>
              </div>
              {provando.preco ? (
                <button className="botao amarelo" disabled={ocupado || falta > 0} onClick={() => void comprar(provando)} title={falta > 0 ? `Faltam ${falta} moedas` : undefined}>
                  <Moeda tamanho={20} /> {falta > 0 ? `Faltam ${falta}` : `Comprar por ${provando.preco}`}
                </button>
              ) : (
                <span className="etiqueta amarela">
                  <Chama tamanho={16} /> {provando.marco} dias de sequência
                </span>
              )}
              <button className="botao-icone" onClick={() => setProvando(null)} aria-label="Parar de experimentar">
                <Icone nome="x" tamanho={20} />
              </button>
            </div>
          )}
        </section>

        <section className="cartao provador-itens">
          <div className="abas" role="tablist">
            {TIPOS_ITEM.map((t) => (
              <button key={t.id} role="tab" aria-selected={aba === t.id} className={aba === t.id ? 'ativa' : ''} onClick={() => setAba(t.id)}>
                {t.nome}
              </button>
            ))}
          </div>
          <div className="itens-grade">
            {tipoAtual.opcional && (
              <button className={`item ${avatar[aba] === null && !provando ? 'em-uso' : ''}`} disabled={ocupado} onClick={() => void equipar(aba, null)}>
                <span className="item-vazio">
                  <Icone nome="x" tamanho={34} />
                </span>
                <strong>Nenhum</strong>
                <span className="item-rodape suave">Sem item</span>
              </button>
            )}
            {itens.map((item) => {
              const emUso = avatar[item.tipo] === item.id;
              const raridade = RARIDADES[item.raridade];
              return (
                <button
                  key={item.id}
                  className={`item ${emUso ? 'em-uso' : ''} ${provando?.id === item.id ? 'provando' : ''} ${item.possui ? '' : 'bloqueado'}`}
                  style={{ '--raridade': raridade.cor } as CSSProperties}
                  disabled={ocupado}
                  onClick={() => escolher(item)}
                >
                  <Retrato avatar={{ ...avatar, [item.tipo]: item.id }} tamanho={86} />
                  <strong>{item.nome}</strong>
                  <span className="item-raridade">{raridade.nome}</span>
                  <span className="item-rodape">
                    {emUso ? (
                      <span className="etiqueta verde">Em uso</span>
                    ) : item.possui ? (
                      <span className="etiqueta">Usar</span>
                    ) : item.preco ? (
                      <span className="valor">
                        <Moeda tamanho={18} /> {item.preco}
                      </span>
                    ) : (
                      <span className="valor pequeno" title={`Recompensa de ${item.marco} dias de sequência`}>
                        <Icone nome="cadeado" tamanho={16} /> {item.marco} dias
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
