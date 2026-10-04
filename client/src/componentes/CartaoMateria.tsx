import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { coresDaMateria } from '../visual';
import { Icone } from './Icone';
import { IconeMateria } from './IconeMateria';
import type { MateriaResumo } from '../tipos';

/** Cartão colorido de uma matéria, como no painel inicial. */
export function CartaoMateria({ materia, indice = 0, para }: { materia: MateriaResumo; indice?: number; para?: string }) {
  const cores = coresDaMateria(materia.id);
  const feito = materia.total ? (materia.concluidas / materia.total) * 100 : 0;
  const estilo = {
    '--claro': cores.claro,
    '--claro2': cores.claro2,
    '--botao': cores.botao,
    '--forte': cores.forte,
    animationDelay: `${indice * 55}ms`,
  } as CSSProperties;

  return (
    <Link to={para ?? `/materias/${materia.id}`} className="materia" style={estilo}>
      <span className="materia-icone">
        <svg className="materia-faiscas" viewBox="0 0 140 96" fill="none" stroke={cores.botao} strokeWidth="4.500" strokeLinecap="round" aria-hidden="true">
          <path d="M14 30l10 7M8 50h13M15 71l10-7M126 30l-10 7M132 50h-13M125 71l-10-7" />
        </svg>
        <IconeMateria materia={materia.id} tamanho={98} />
      </span>
      <span className="materia-rodape">
        <strong>{materia.nome}</strong>
        <span className="materia-seta">
          <Icone nome="seta" tamanho={20} />
        </span>
      </span>
      {feito > 0 && <i className="materia-progresso" style={{ width: `${feito}%` }} />}
    </Link>
  );
}
