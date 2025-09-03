import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  noPadding = false,
  shadow = true,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`card ${shadow ? 'card-shadow' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
