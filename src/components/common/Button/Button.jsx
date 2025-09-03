import { forwardRef } from 'react';
import LoaderCircle from '../LoaderCircle/LoaderCircle';
import './Button.css';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={16} color="currentColor" />}
      {!loading && startIcon && <span className="btn-icon start-icon">{startIcon}</span>}
      
      <span className="btn-content">{children}</span>
      
      {!loading && endIcon && <span className="btn-icon end-icon">{endIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
