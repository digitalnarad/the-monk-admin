import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import './Input.css';

const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group checkbox-group ${className}`}>
      <label className={`checkbox-label ${disabled ? 'disabled' : ''}`}>
        <div className="checkbox-wrapper">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="checkbox-input"
            {...props}
          />
          <div className={`checkbox-custom ${checked ? 'checked' : ''} ${error ? 'error' : ''}`}>
            {checked && <Check size={14} className="checkbox-icon" />}
          </div>
        </div>
        {label && <span className="checkbox-text">{label}</span>}
      </label>
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
