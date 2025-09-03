import './LoaderCircle.css';

const LoaderCircle = ({ size = 40, color = '#3b82f6' }) => {
  return (
    <div className="loader-circle" style={{ width: size, height: size }}>
      <div 
        className="loader-circle-spinner" 
        style={{ 
          borderColor: `${color}20`,
          borderTopColor: color,
          width: size, 
          height: size 
        }}
      />
    </div>
  );
};

export default LoaderCircle;
