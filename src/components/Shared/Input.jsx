import './Input.css';

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    required = false,
    icon: Icon,
    error,
    rows = 4,
    options = [],
    className = '',
    id,
    ...props
}) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    if (type === 'select') {
        return (
            <div className={`input-group ${className}`}>
                {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
                <div className="input-wrapper">
                    <select
                        id={inputId}
                        className="input-field input-select"
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && <span className="input-error">{error}</span>}
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div className={`input-group ${className}`}>
                {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
                <textarea
                    id={inputId}
                    className="input-field input-textarea"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    {...props}
                />
                {error && <span className="input-error">{error}</span>}
            </div>
        );
    }

    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
            <div className="input-wrapper">
                {Icon && <Icon size={16} className="input-icon" />}
                <input
                    id={inputId}
                    type={type}
                    className={`input-field ${Icon ? 'input-field--with-icon' : ''}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    {...props}
                />
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
}
