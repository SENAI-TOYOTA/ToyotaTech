import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'charcoal' | 'ghost' | 'sm';
  children: React.ReactNode;
  showIcon?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  children,
  showIcon = true,
  className = '',
  ...props
}) => {
  // Estilos base comuns a botões com setas (solid e charcoal)
  const baseStyles = "group font-sans font-semibold text-[0.98rem] inline-flex items-center justify-between gap-3.5 pl-5.5 pr-1.5 py-1.5 rounded-[14px] border-none cursor-pointer w-max transition-all duration-150 hover:-translate-y-0.5 shadow-toyota-sm";
  
  // Icone padrão de seta (SVG do seu index)
  const arrowIcon = (
    <span className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-white/24 transition-transform duration-150 group-hover:translate-x-0.5">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
      </svg>
    </span>
  );

  // Renderização condicional por variante
  if (variant === 'solid') {
    return (
      <button className={`${baseStyles} bg-toyota-red text-white hover:bg-toyota-red-deep ${className}`} {...props}>
        {children}
        {showIcon && arrowIcon}
      </button>
    );
  }

  if (variant === 'charcoal') {
    return (
      <button className={`${baseStyles} bg-charcoal text-white hover:bg-charcoal-deep ${className}`} {...props}>
        {children}
        {showIcon && arrowIcon}
      </button>
    );
  }

  if (variant === 'sm') {
    return (
      <button className="group font-sans font-semibold text-[0.9rem] inline-flex items-center justify-between gap-3.5 pl-4.5 pr-1 py-1 rounded-[12px] border-none cursor-pointer w-max transition-all duration-150 hover:-translate-y-0.5 bg-toyota-red text-white shadow-toyota-sm" {...props}>
        {children}
        {showIcon && (
          <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-white/24 transition-transform duration-150 group-hover:translate-x-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
            </svg>
          </span>
        )}
      </button>
    );
  }

  // Variante Ghost (Usada na navbar/acesso rápido)
  return (
    <button className={`font-sans font-semibold text-[0.92rem] color-ink border-[1.5px] border-border px-4.5 py-2.5 rounded-[12px] inline-flex items-center gap-2 bg-white transition-all duration-150 hover:border-toyota-red hover:text-toyota-red ${className}`} {...props}>
      {children}
    </button>
  );
};