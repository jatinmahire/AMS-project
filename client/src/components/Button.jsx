import './Button.css';

const VARIANTS = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  danger: 'button-danger',
  ghost: 'button-ghost',
};

export default function Button({ variant = 'primary', className = '', children, icon: Icon, ...props }) {
  return (
    <button
      className={`button-base ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
