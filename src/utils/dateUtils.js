/**
 * Utilidades para manejar fechas asegurando que siempre se evalúen
 * bajo la zona horaria de Chile (UTC-3 o UTC-4), sin importar la
 * configuración local del dispositivo del usuario.
 */

// Obtiene la fecha actual o la de un objeto Date específico en string ISO (YYYY-MM-DD)
export function getChileDateString(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    return `${year}-${month}-${day}`;
}

// Retorna un string formateado para mostrar en la interfaz (ej. '15 may 2024')
export function formatChileDateDisplay(date, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    return date.toLocaleDateString('es-CL', {
        timeZone: 'America/Santiago',
        ...options
    });
}

// Retorna la hora formateada para la interfaz (ej. '14:30')
export function formatChileTimeDisplay(date, options = { hour: '2-digit', minute: '2-digit', hour12: false }) {
    return date.toLocaleTimeString('es-CL', {
        timeZone: 'America/Santiago',
        ...options
    });
}

// Crea un objeto Date falso cuyos métodos locales (getDate, getDay, getHours) 
// coinciden numéricamente con los de Chile en el momento de la fecha original.
export function getChileDateObj(date = new Date()) {
    const chileTimeStr = date.toLocaleString('en-US', { timeZone: 'America/Santiago' });
    return new Date(chileTimeStr);
}

// Obtiene un array de 6 strings 'YYYY-MM-DD' (Lunes a Sábado) para la semana de la fecha dada
export function getChileWeekDates(baseDate = new Date()) {
    const d = getChileDateObj(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    
    return Array.from({ length: 6 }, (_, i) => {
        const curr = new Date(monday);
        curr.setDate(monday.getDate() + i);
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        const dayStr = String(curr.getDate()).padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    });
}
