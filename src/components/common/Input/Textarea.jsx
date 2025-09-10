import { forwardRef } from "react";
import "./Input.css";

const Textarea = forwardRef(
  (
    {
      label,
      placeholder,
      error,
      required = false,
      disabled = false,
      rows = 4,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`input-group ${className}`}>
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="required">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={{ resize: "none" }}
          className={`input-field textarea-field ${error ? "error" : ""} ${
            disabled ? "disabled" : ""
          }`}
          {...props}
        />

        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
