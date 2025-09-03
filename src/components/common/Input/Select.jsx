import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Input.css';

const Select = forwardRef(({
  label,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="select-wrapper">
        <select
          ref={ref}
          disabled={disabled}
          className={`input-field select-field ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" size={16} />
      </div>
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
