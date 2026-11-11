import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type BaseProps = {
  variant: 'primary' | 'secondary' | 'tint' | 'disabled';
  label: string;
  hasArrow?: boolean;
  className?: string;
};

type ButtonAsAnchor = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = ButtonAsAnchor | ButtonAsButton;

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-medium py-2 px-6';

const VARIANT_CLASSES: Record<BaseProps['variant'], string> = {
  primary: 'bg-white text-black cursor-pointer',
  secondary: 'bg-black text-white border border-white cursor-pointer',
  tint: 'bg-(--tt-signal) text-white cursor-pointer',
  disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none',
};

function Button(props: ButtonProps) {
  const { variant, href, label, hasArrow, className = '', ...rest } = props;
  const combinedClassName = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`.trim();

  const content = (
    <>
      <span>{label}</span>
      {hasArrow && <span className="ml-2">→</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        aria-disabled={variant === 'disabled'}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      className={combinedClassName}
      disabled={variant === 'disabled' || buttonRest.disabled}
      {...buttonRest}
    >
      {content}
    </button>
  );
}

export default Button;

