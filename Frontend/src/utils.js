import Swal from "sweetalert2"

export const validarRut = (rutCompleto) => {
	// Eliminar puntos, guiones y espacios
	const rutLimpio = rutCompleto.replace(/[^0-9kK]/g, "").toUpperCase()

	// Verificar longitud mínima (8 dígitos) y que contenga dígito verificador
	if (rutLimpio.length < 9) return false

	// Separar el número del dígito verificador
	const cuerpo = rutLimpio.slice(0, -1)
	const dv = rutLimpio.slice(-1)

	// Validar que el cuerpo sea numérico
	if (!/^\d+$/.test(cuerpo)) return false

	// Calcular dígito verificador esperado
	let suma = 0
	let multiplo = 2

	for (let i = cuerpo.length - 1; i >= 0; i--) {
		suma += parseInt(cuerpo[i]) * multiplo
		multiplo = multiplo === 7 ? 2 : multiplo + 1
	}

	const resto = suma % 11
	const dvCalculado =
		11 - resto === 11
			? "0"
			: 11 - resto === 10
			? "K"
			: (11 - resto).toString()

	// Comparar el dígito verificador
	return dv === dvCalculado
}
export const notificaError = (titulo, text) => {
	Swal.fire({
		icon: "error",
		title: titulo,
		text: text
	})
}
export const normaliceRut = (rut) => {
	const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase()
	return rutLimpio
}

export function obtenerUltimoPorFecha(array, campo) {
	if (!array || array.length === 0) {
		return null // Si el array está vacío, retorna null
	}

	// Usamos sort para ordenar los objetos por fecha de manera descendente
	const ordenadoPorFecha = array.sort(
		(a, b) => new Date(b[campo]) - new Date(a[[campo]])
	)

	// Retornamos el primer elemento del array ordenado
	return ordenadoPorFecha[0]
}
