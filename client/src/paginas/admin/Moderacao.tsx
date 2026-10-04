import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { haQuantoTempo } from '../../visual';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';

interface Mensagem {
  id: number;
  texto: string;
  criado_em: string;
  de: string;
  de_id: number;
  para: string;
}

interface Registro {
  id: number;
  acao: string;
  ip: string | null;
  detalhe: string | null;
  criadoEm: string;
  usuarioId: number | null;
  usuario: string | null;
  alvoId: number | null;
  alvo: string | null;
}

// Nome legível e cor de cada ação gravada no registro de auditoria (server/src/registro.js).
const ACOES: Record<string, [string, string]> = {
  'login.ok': ['Entrou na conta', 'cinza'],
  'login.falha': ['Senha ou usuário errado', 'amarela'],
  'conta.criada': ['Conta criada', 'verde'],
  'senha.alterada': ['Trocou a própria senha', ''],
  'admin.situacao': ['Situação da conta alterada', 'rosa'],
  'admin.papel': ['Tipo de conta alterado', 'rosa'],
  'admin.moedas': ['Moedas ajustadas', 'rosa'],
  'admin.senha': ['Senha redefinida', 'rosa'],
  'admin.exclusao': ['Conta excluída', 'vermelha'],
  'admin.chamado-excluido': ['Chamado de suporte excluído', 'vermelha'],
  'admin.copia': ['Cópia de segurança feita', ''],
  'professor.senha': ['Professor redefiniu a senha de um aluno', 'rosa'],
  'conta.termos': ['Aceitou os termos', 'cinza'],
  'conteudo.publicado': ['Conteúdo publicado para todos', 'verde'],
  'conteudo.recolhido': ['Conteúdo recolhido', 'amarela'],
};

/** Mensagens trocadas nos chats de duelo, para acompanhamento do administrador. */
function ChatsDosDuelos() {
  const { dados, erro } = useCarregar(() => api<{ mensagens: Mensagem[] }>('/admin/mensagens'));
  if (erro) return <ErroDeCarga erro={erro} />;
  if (!dados) return <Carregando />;
  if (dados.mensagens.length === 0) return <Vazio titulo="Nenhuma mensagem ainda">As conversas dos duelos entre amigos aparecem aqui.</Vazio>;
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead>
          <tr>
            <th>Quando</th>
            <th>De</th>
            <th>Para</th>
            <th>Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {dados.mensagens.map((m) => (
            <tr key={m.id}>
              <td className="pequeno suave">{haQuantoTempo(m.criado_em)}</td>
              <td>
                <Link className="link" to={`/perfil/${m.de_id}`}>
                  {m.de}
                </Link>
              </td>
              <td>{m.para}</td>
              <td>{m.texto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Logins, trocas de senha e ações de administradores: quem fez, em qual conta e de onde. */
function RegistroDeSeguranca() {
  const { dados, erro } = useCarregar(() => api<{ registros: Registro[] }>('/admin/auditoria'));
  if (erro) return <ErroDeCarga erro={erro} />;
  if (!dados) return <Carregando />;
  if (dados.registros.length === 0) return <Vazio titulo="Nada registrado ainda">Logins, trocas de senha e ações administrativas aparecem aqui.</Vazio>;
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead>
          <tr>
            <th>Quando</th>
            <th>O que aconteceu</th>
            <th>Quem fez</th>
            <th>Conta afetada</th>
            <th>Detalhe</th>
            <th>Endereço (IP)</th>
          </tr>
        </thead>
        <tbody>
          {dados.registros.map((r) => {
            const [rotulo, cor] = ACOES[r.acao] ?? [r.acao, 'cinza'];
            return (
              <tr key={r.id}>
                <td className="pequeno suave">{haQuantoTempo(r.criadoEm)}</td>
                <td>
                  <span className={`etiqueta ${cor}`}>{rotulo}</span>
                </td>
                <td>{r.usuario ?? (r.usuarioId ? 'Conta excluída' : '—')}</td>
                <td>{r.alvo ?? (r.alvoId ? 'Conta excluída' : '—')}</td>
                <td className="pequeno">{r.detalhe ?? '—'}</td>
                <td className="pequeno suave">{r.ip ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Moderacao() {
  const [aba, setAba] = useState<'chats' | 'registro'>('chats');
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Moderação</h1>
          <p className="subtitulo">
            {aba === 'chats'
              ? 'Últimas mensagens dos chats entre amigos durante os duelos. Palavrões são filtrados automaticamente.'
              : 'Últimos 300 eventos de segurança: entradas na plataforma, senhas e ações de administradores. Guardados por 180 dias.'}
          </p>
        </div>
        <div className="abas acoes">
          <button className={aba === 'chats' ? 'ativa' : ''} onClick={() => setAba('chats')}>
            Chats dos duelos
          </button>
          <button className={aba === 'registro' ? 'ativa' : ''} onClick={() => setAba('registro')}>
            Registro de segurança
          </button>
        </div>
      </div>
      <section className="cartao">{aba === 'chats' ? <ChatsDosDuelos /> : <RegistroDeSeguranca />}</section>
    </div>
  );
}
