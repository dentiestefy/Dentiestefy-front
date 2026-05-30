import './Badge.css';

const variants = {
    Activo: 'success',
    Atendido: 'info',
    Confirmada: 'info',
    'En espera': 'primary',
    Pendiente: 'warning',
    'De alta': 'info',
    Cancelada: 'danger',
    admin: 'primary',
    doctor: 'info',
    secretaria: 'warning',
};

export default function Badge({ text, variant: variantProp, size = 'md' }) {
    const variant = variantProp || variants[text] || 'neutral';
    return (
        <span className={`badge badge--${variant} badge--${size}`}>
            <span className="badge-dot" />
            {text}
        </span>
    );
}
