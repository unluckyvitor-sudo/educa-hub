// Página de desenvolvimento (só existe em modo dev): mostra o gato em todas as animações,
// pelagens, roupas e acessórios para conferência visual. Acesse em /laboratorio.
import { useState } from 'react';
import { GatoVivo } from '../gato/GatoVivo';
import { AVATAR_PADRAO, type Animacao, type AvatarConfig } from '../gato/modelo';
import { PELAGENS, ROUPAS } from '../gato/pelagens';
import { ACESSORIOS } from '../gato/acessorios';
import { Retrato } from '../componentes/Retrato';
import type { Enquadramento } from '../gato/cena';
import { verificar, type Achado, type Encaixe } from '../gato/colisoes';

const ANIMACOES: Animacao[] = ['parado', 'acenar', 'comemorar', 'triste', 'pensar', 'dancar', 'surpreso'];
const ENCAIXE: Record<string, Encaixe> = {
  laco: 'cabeca', bone: 'cabeca', 'chapeu-festa': 'cabeca', gorro: 'cabeca', fones: 'cabeca', capelo: 'cabeca', cartola: 'cabeca', 'chapeu-mago': 'cabeca', coroa: 'cabeca', astronauta: 'cabeca', aureola: 'cabeca',
  'oculos-redondos': 'rosto', 'oculos-escuros': 'rosto', monoculo: 'rosto', 'mascara-heroi': 'rosto', 'oculos-estrela': 'rosto',
  sino: 'pescoco', 'gravata-borboleta': 'pescoco', cachecol: 'pescoco', medalha: 'pescoco',
  mochila: 'costas', capa: 'costas', 'asas-borboleta': 'costas', 'asas-anjo': 'costas', jetpack: 'costas',
  livro: 'mao', pirulito: 'mao', lapis: 'mao', balao: 'mao', varinha: 'mao', trofeu: 'mao',
};

// Verificação de colisões, pelo console do navegador:
//   await verificarColisoes()                      cada acessório sozinho, em todas as animações
//   await verificarColisoes([['mochila', 'fones']]) combinações específicas
// Devolve o que se atravessa (lista vazia = nada atravessa). O andamento fica em window.colisoes.
async function verificarColisoes(combinacoes?: string[][]) {
  const limpo: AvatarConfig = { ...AVATAR_PADRAO, mao: null };
  const grupos = combinacoes ?? [[], ...Object.keys(ACESSORIOS).map((id) => [id])];
  const andamento = { feito: 0, total: grupos.length, achados: [] as Achado[] };
  Object.assign(window, { colisoes: andamento });
  for (const itens of grupos) {
    const avatar = itens.reduce((a, id) => ({ ...a, [ENCAIXE[id]]: id }), limpo);
    andamento.achados.push(...verificar({ [itens.join(' + ') || 'sem acessórios']: avatar }, ENCAIXE));
    andamento.feito++;
    await new Promise((r) => setTimeout(r)); // deixa a página respirar entre um caso e outro
  }
  return andamento.achados;
}
Object.assign(window, { verificarColisoes });

export function Laboratorio() {
  const [avatar, setAvatar] = useState<AvatarConfig>(AVATAR_PADRAO);
  const [animacao, setAnimacao] = useState<Animacao>('parado');
  const [quadro, setQuadro] = useState<Enquadramento>('corpo');
  const [giro, setGiro] = useState(0);
  const [quatroVistas, setQuatroVistas] = useState(false);
  const usar = (parcial: Partial<AvatarConfig>) => setAvatar((a) => ({ ...a, ...parcial }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${quatroVistas ? 590 : 520}px 1fr`, gap: 20, padding: 20, minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
        {quatroVistas ? (
          // Frente, 3/4, lado e costas ao mesmo tempo, para conferir se nada atravessa o corpo.
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[0, 0.7, 1.57, 3.14, -0.7, -1.57].map((angulo) => (
              <GatoVivo key={`${quadro}${angulo}`} avatar={avatar} animacao={animacao} enquadramento={quadro} giro={angulo} className="lab-gato lab-vista" />
            ))}
          </div>
        ) : (
          <GatoVivo key={quadro} avatar={avatar} animacao={animacao} enquadramento={quadro} giro={giro} girarArrastando className="lab-gato" />
        )}
        <style>{'.lab-gato{width:520px;height:560px;background:#e9e9fb;border-radius:24px}.lab-vista{width:auto;height:282px}'}</style>
        <div className="chips" style={{ marginTop: 10 }}>
          {ANIMACOES.map((a) => (
            <button key={a} className={`chip ${animacao === a ? 'ativo' : ''}`} onClick={() => setAnimacao(a)}>
              {a}
            </button>
          ))}
        </div>
        <div className="chips" style={{ marginTop: 10 }}>
          {(['corpo', 'busto', 'retrato'] as const).map((q) => (
            <button key={q} className={`chip rosa ${quadro === q ? 'ativo' : ''}`} onClick={() => setQuadro(q)}>
              {q}
            </button>
          ))}
          <button className="chip" onClick={() => setAvatar(AVATAR_PADRAO)}>
            limpar
          </button>
          {[['frente', 0], ['3/4', 0.7], ['lado', 1.57], ['costas', 3.14]].map(([nome, angulo]) => (
            <button key={nome} className={`chip ${giro === angulo ? 'ativo' : ''}`} onClick={() => setGiro(angulo as number)}>
              {nome}
            </button>
          ))}
          <button className={`chip rosa ${quatroVistas ? 'ativo' : ''}`} onClick={() => setQuatroVistas((v) => !v)}>
            vistas
          </button>
        </div>
      </div>
      <div className="coluna">
        <h2>Pelagens</h2>
        <div className="chips">
          {Object.keys(PELAGENS).map((id) => (
            <button key={id} onClick={() => usar({ pelagem: id })} title={id}>
              <Retrato avatar={{ ...AVATAR_PADRAO, pelagem: id }} tamanho={110} />
            </button>
          ))}
        </div>
        <h2>Roupas</h2>
        <div className="chips">
          {Object.keys(ROUPAS).map((id) => (
            <button key={id} onClick={() => usar({ roupa: id })} title={id}>
              <Retrato avatar={{ ...AVATAR_PADRAO, roupa: id, mao: null }} tamanho={110} />
            </button>
          ))}
        </div>
        <h2>Acessórios</h2>
        <div className="chips">
          {Object.keys(ACESSORIOS).map((id) => (
            <button key={id} onClick={() => usar({ [ENCAIXE[id]]: id })} title={id}>
              <Retrato avatar={{ ...AVATAR_PADRAO, mao: null, [ENCAIXE[id]]: id }} tamanho={110} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
