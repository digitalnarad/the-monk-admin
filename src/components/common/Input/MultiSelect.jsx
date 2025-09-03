import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './Input.css';

const MultiSelect = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveOption = (optionValue) => {
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return value.map(val => {
      const option = options.find(opt => opt.value === val);
      return option ? option.label : val;
    });
  };

  return (
    <div className={`input-group ${className}`} ref={dropdownRef}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="multi-select-wrapper">
        <div
          className={`multi-select-control ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="multi-select-values">
            {value.length === 0 ? (
              <span className="placeholder">{placeholder}</span>
            ) : (
              <div className="selected-tags">
                {getSelectedLabels().map((label, index) => (
                  <span key={index} className="selected-tag">
                    {label}
                    {!disabled && (
                      <X
                        size={14}
                        className="remove-tag"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOption(value[index]);
                        }}
                      />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ChevronDown className={`multi-select-arrow ${isOpen ? 'open' : ''}`} size={16} />
        </div>
        
        {isOpen && !disabled && (
          <div className="multi-select-dropdown">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="multi-select-search"
            />
            <div className="multi-select-options">
              {filteredOptions.length === 0 ? (
                <div className="no-options">No options found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`multi-select-option ${value.includes(option.value) ? 'selected' : ''}`}
                    onClick={() => handleOptionToggle(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => {}}
                      className="option-checkbox"
                    />
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default MultiSelect;
