import { useState, type FormEvent } from 'react';
import { api, mensagemDoErro } from '../../api';
import { avisar } from '../../estado';
import { Modal } from '../../componentes/comuns';
import { Icone, Moeda, Xp } from '../../componentes/Icone';

interface Questao {
  enunciado: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
}

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: () => void;
  turmas: { id: number; nome: string }[];
  /** Matérias disponíveis para a turma escolhida (opcional: sem lista, a missão vale para todas). */
  materias?: { id: string; nome: string }[];
  turmaFixa?: number;
}

const questaoVazia = (): Questao => ({ enunciado: '', alternativas: ['', '', '', ''], correta: 0, explicacao: '' });
const LETRAS = ['A', 'B', 'C', 'D'];

/** Formulário para o professor propor uma missão (meta de atividades/acertos) ou um desafio com questões próprias. */
export function FormMissao({ aberto, aoFechar, aoCriar, turmas, materias = [], turmaFixa }: Props) {
  const [turmaId, setTurmaId] = useState(turmaFixa ?? turmas[0]?.id ?? 0);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [periodo, setPeriodo] = useState<'diaria' | 'semanal'>('semanal');
  const [tipo, setTipo] = useState<'atividades' | 'acertos' | 'quiz'>('atividades');
  const [materia, setMateria] = useState('');
  const [meta, setMeta] = useState(3);
  const [xp, setXp] = useState(80);
  const [moedas, setMoedas] = useState(40);
  const [questoes, setQuestoes] = useState<Questao[]>([questaoVazia()]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const mudarQuestao = (i: number, parcial: Partial<Questao>) => setQuestoes(questoes.map((q, j) => (j === i ? { ...q, ...parcial } : q)));

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await api('/prof/missoes', {
        corpo: { turmaId: turmaFixa ?? turmaId, titulo, descricao, periodo, tipo, materia: materia || null, meta, xp, moedas, questoes: tipo === 'quiz' ? questoes : undefined },
      });
      avisar('Missão enviada para a turma!', 'sucesso');
      setTitulo('');
      setDescricao('');
      setQuestoes([questaoVazia()]);
      aoCriar();
      aoFechar();
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} largo>
      <form className="coluna" onSubmit={criar}>
        <div>
          <h2>Nova missão</h2>
          <p className="suave">Os alunos da turma são avisados na hora e ganham a recompensa ao concluir.</p>
        </div>

        <div className="grade-campos">
          {!turmaFixa && (
            <label className="campo">
              <span>Turma</span>
              <select className="entrada" value={turmaId} onChange={(e) => setTurmaId(Number(e.target.value))} required>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="campo">
            <span>Título</span>
            <input className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="ex.: Semana das frações" maxLength={60} required />
          </label>
        </div>
        <label className="campo">
          <span>Descrição (opcional)</span>
          <input className="entrada" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={200} />
        </label>

        <div className="grade-campos">
          <div className="campo">
            <span>Prazo</span>
            <div className="chips">
              <button type="button" className={`chip ${periodo === 'diaria' ? 'ativo' : ''}`} onClick={() => setPeriodo('diaria')}>
                Diária (vale hoje)
              </button>
              <button type="button" className={`chip ${periodo === 'semanal' ? 'ativo' : ''}`} onClick={() => setPeriodo('semanal')}>
                Semanal (7 dias)
              </button>
            </div>
          </div>
          <div className="campo">
            <span>O que o aluno deve fazer</span>
            <div className="chips">
              <button type="button" className={`chip ${tipo === 'atividades' ? 'ativo' : ''}`} onClick={() => setTipo('atividades')}>
                Completar atividades
              </button>
              <button type="button" className={`chip ${tipo === 'acertos' ? 'ativo' : ''}`} onClick={() => setTipo('acertos')}>
                Acertar questões
              </button>
              <button type="button" className={`chip rosa ${tipo === 'quiz' ? 'ativo' : ''}`} onClick={() => setTipo('quiz')}>
                Quiz com minhas questões
              </button>
            </div>
          </div>
        </div>

        <div className="grade-campos">
          {tipo !== 'quiz' && (
            <label className="campo">
              <span>{tipo === 'atividades' ? 'Quantas atividades' : 'Quantos acertos'}</span>
              <input className="entrada" type="number" min={1} max={200} value={meta} onChange={(e) => setMeta(Number(e.target.value))} required />
            </label>
          )}
          {materias.length > 0 && (
            <label className="campo">
              <span>Matéria</span>
              <select className="entrada" value={materia} onChange={(e) => setMateria(e.target.value)}>
                <option value="">Qualquer matéria</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="campo">
            <span className="linha" style={{ gap: 6 }}>
              <Xp tamanho={16} /> Recompensa em XP (até 300)
            </span>
            <input className="entrada" type="number" min={0} max={300} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
          </label>
          <label className="campo">
            <span className="linha" style={{ gap: 6 }}>
              <Moeda tamanho={16} /> Recompensa em moedas (até 200)
            </span>
            <input className="entrada" type="number" min={0} max={200} value={moedas} onChange={(e) => setMoedas(Number(e.target.value))} />
          </label>
        </div>

        {tipo === 'quiz' && (
          <div className="coluna" style={{ gap: 14 }}>
            {questoes.map((q, i) => (
              <fieldset key={i} className="questao-form">
                <legend>
                  Questão {i + 1}
                  {questoes.length > 1 && (
                    <button type="button" className="botao-icone" onClick={() => setQuestoes(questoes.filter((_, j) => j !== i))} aria-label={`Remover questão ${i + 1}`}>
                      <Icone nome="lixeira" tamanho={18} />
                    </button>
                  )}
                </legend>
                <input className="entrada" value={q.enunciado} onChange={(e) => mudarQuestao(i, { enunciado: e.target.value })} placeholder="Enunciado da questão" maxLength={300} required />
                <div className="grade-campos">
                  {q.alternativas.map((alt, j) => (
                    <label key={j} className={`alternativa-form ${q.correta === j ? 'certa' : ''}`}>
                      <input type="radio" name={`correta-${i}`} checked={q.correta === j} onChange={() => mudarQuestao(i, { correta: j })} aria-label={`Alternativa ${LETRAS[j]} é a correta`} />
                      <strong>{LETRAS[j]}</strong>
                      <input className="entrada" value={alt} onChange={(e) => mudarQuestao(i, { alternativas: q.alternativas.map((a, k) => (k === j ? e.target.value : a)) })} placeholder={`Alternativa ${LETRAS[j]}`} maxLength={160} required />
                    </label>
                  ))}
                </div>
                <input className="entrada" value={q.explicacao} onChange={(e) => mudarQuestao(i, { explicacao: e.target.value })} placeholder="Explicação mostrada depois da resposta (opcional)" maxLength={300} />
              </fieldset>
            ))}
            <p className="suave pequeno">Marque o círculo ao lado da alternativa correta de cada questão.</p>
            {questoes.length < 20 && (
              <button type="button" className="botao claro pequeno" style={{ alignSelf: 'flex-start' }} onClick={() => setQuestoes([...questoes, questaoVazia()])}>
                <Icone nome="mais" tamanho={16} /> Adicionar questão
              </button>
            )}
          </div>
        )}

        {erro && <div className="erro-form">{erro}</div>}
        <div className="modal-acoes">
          <button type="button" className="botao claro" onClick={aoFechar}>
            Cancelar
          </button>
          <button className="botao rosa" disabled={enviando}>
            <Icone nome="enviar" tamanho={18} /> Enviar missão
          </button>
        </div>
      </form>
    </Modal>
  );
}
