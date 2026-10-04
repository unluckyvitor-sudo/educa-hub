/** Marca EducaHub: capelo, "Educa" em azul-noite e "Hub" colorido com faíscas. */
export function Logo({ claro = false, altura = 44 }: { claro?: boolean; altura?: number }) {
  const tinta = claro ? '#ffffff' : '#171b45';
  return (
    <span className="logo" style={{ fontSize: altura * 0.82 }} aria-label="EducaHub">
      <svg width={altura * 1.150} height={altura} viewBox="0 0 54 46" aria-hidden="true">
        <path d="M4 18 28 6l22 12-23 12z" fill="#5b5ff0" stroke="#3f2fc9" strokeWidth="2.500" strokeLinejoin="round" />
        <path d="M13 24v10c6 6 22 6 28 0V24l-14 7z" fill="#7c5cff" stroke="#3f2fc9" strokeWidth="2.500" strokeLinejoin="round" />
        <path d="M8 21v13" stroke="#3f2fc9" strokeWidth="2.500" strokeLinecap="round" />
        <path d="M8 34l-3 7h6z" fill="#2f8bff" stroke="#3f2fc9" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span style={{ color: tinta }}>Educa</span>
      <span className="logo-hub">
        <span style={{ color: '#2f8bff' }}>H</span>
        <span style={{ color: '#7c4dff' }}>u</span>
        <span style={{ color: '#ffab1a' }}>b</span>
        <svg className="logo-faiscas" width={altura * 0.420} height={altura * 0.420} viewBox="0 0 20 20" fill="none" stroke="#ff4f9a" strokeWidth="2.600" strokeLinecap="round" aria-hidden="true">
          <path d="M3 14 7 9M9 17l5-9M15 17l3-4" />
        </svg>
      </span>
    </span>
  );
}
