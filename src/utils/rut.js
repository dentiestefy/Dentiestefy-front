/**
 * Formatea un RUT chileno mientras el usuario escribe.
 * Formato final: 12.345.678-9
 * Máximo 8 dígitos en el cuerpo (≤ 99.999.999).
 *
 * @param {string} input - valor crudo del input
 * @returns {string} RUT formateado
 */
export function formatRut(input) {
    // Eliminar todo excepto dígitos y K
    let clean = input.replace(/[^0-9kK]/g, '').toUpperCase();

    if (clean.length === 0) return '';

    // Limitar a 9 caracteres (8 dígitos cuerpo + 1 dígito verificador)
    if (clean.length > 9) {
        clean = clean.slice(0, 9);
    }

    // Con solo 1 carácter no hay separador todavía
    if (clean.length === 1) return clean;

    const verifier = clean.slice(-1);
    const body = clean.slice(0, -1);

    // Añadir puntos cada 3 dígitos desde la derecha
    const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${bodyFormatted}-${verifier}`;
}

/**
 * Valida que el cuerpo del RUT no supere 99.999.999.
 * @param {string} rut - RUT formateado o crudo
 * @returns {boolean}
 */
export function isValidRutLength(rut) {
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return true;
    const body = parseInt(clean.slice(0, -1), 10);
    return body <= 99999999;
}
