import { safeParseNumber } from "./safe-parse-number.js";
import { emptyMatrix, InvalidMatrixValueError } from "/matrix.util.js";

/**
 * Obtiene una matriz de valores a partir de un contenedor con múltiples inputs
 * con un atributo data-cell cuyo valor está en el formato numeroMatriz-fila-columna.
 * @param {HTMLElement} container
 * @param {number} rows
 * @param {number} columns
 */
export function getMatrixFrom(container, rows, columns) {
  const inputs = container.querySelectorAll("input");
  const arr = emptyMatrix(rows, columns);
  for (const input of inputs) {
    const [_, row, column] = input.getAttribute("data-cell").split("-");
    let num = safeParseNumber(input.value);
    if (num == null) {
      throw new InvalidMatrixValueError(
        "Algún valor ingresado no es un número válido"
      );
    }
    arr[parseInt(row)][parseInt(column)] = num;
  }
  return arr;
}
