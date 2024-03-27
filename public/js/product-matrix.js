import { ErrorMessage } from "./components/error-message.js";
import { Matrix } from "./components/matrix-table.js";
import { getMatrixFrom } from "./utils/get-matrix-from.js";
import { safeParseInt, safeParseNumber } from "./utils/safe-parse-number.js";

const matrix1Form = document.querySelector("#matrix-1");
const matrix1DimensionsInput = {
  rows: matrix1Form.querySelector("[name=rows]"),
  columns: matrix1Form.querySelector("[name=columns]"),
};

const matrix2Form = document.querySelector("#matrix-2");
const matrix2DimensionsInput = {
  rows: matrix2Form.querySelector("[name=rows]"),
  columns: matrix2Form.querySelector("[name=columns]"),
};

const [matrixContainer1, matrixContainer2] =
  document.querySelectorAll("[data-id=matrix]");

const resultMatrixContainer = document.querySelector("[data-id=matrix-result]");

const sendButton = document.querySelector("#send-btn");
const generateMatrixButton = document.querySelector("#generate-matrix-btn");

const appState = {
  matrix1: {
    selectedRows: safeParseInt(matrix1DimensionsInput.rows.value),
    selectedColumns: safeParseInt(matrix1DimensionsInput.columns.value),
  },
  matrix2: {
    selectedRows: safeParseInt(matrix2DimensionsInput.rows.value),
    selectedColumns: safeParseInt(matrix2DimensionsInput.columns.value),
  },
};

const errorDomNode = document.querySelector("#error-message");
const errorMessage = new ErrorMessage(errorDomNode, { timeout: null });

Object.values(matrix1DimensionsInput).forEach(input => input.addEventListener("input", (e) => {
  if (e.target.name == "rows") {
    appState.matrix1.selectedRows = safeParseInt(e.target.value + e.key) || 0;
  } else {
    console.log(e.target.value);
    matrix2DimensionsInput.rows.value = e.target.value;
    appState.matrix2.selectedRows = safeParseInt(e.target.value) || 0;
    appState.matrix1.selectedColumns = safeParseInt(e.target.value) || 0;
  }
}));

Object.values(matrix2DimensionsInput).forEach(input => input.addEventListener("input", (e) => {
  if (e.target.name == "rows") {
    matrix1DimensionsInput.columns.value = e.target.value;
    appState.matrix1.selectedColumns = safeParseInt(e.target.value) || 0;
    appState.matrix2.selectedRows = safeParseInt(e.target.value + e.key) || 0;
  } else {
    appState.matrix2.selectedColumns = safeParseInt(e.target.value + e.key);
  }
}));

generateMatrixButton.addEventListener("click", () => {
  const { matrix1, matrix2 } = appState;
  if (
    matrix1.selectedRows <= 0 ||
    matrix2.selectedColumns <= 0 ||
    matrix2.selectedRows <= 0 ||
    matrix2.selectedColumns <= 0
  ) {
    errorMessage.show(`
            <p>
                Los valores de filas y columnas deben ser mayores a 0
            </p>
        `);
    return;
  }

  for (const matrix of [matrix1, matrix2]) {
    const rows = safeParseNumber(matrix.selectedRows);
    const columns = safeParseNumber(matrix.selectedColumns);
    if (rows == null || columns == null) {
      errorMessage.show(`
                <p>
                    Los valores de filas y columnas deben ser números
                </p>
            `);
      return;
    }
  }

  if (matrix1.selectedColumns != matrix2.selectedRows) {
    errorMessage.show(`
        <p> 
            La cantidad de columnas de la primera matriz debe ser igual 
            a la cantidad de filas de la segunda matriz.
        </p>
    `);
  }

  renderMatrix();
});

function renderCell(matrixNumber, row, column) {
  const element = document.createElement("div");
  element.innerHTML = `
        <input type="text" name="cell" data-cell="${matrixNumber}-${row}-${column}" />
    `;
  return element;
}

function deleteMatrix() {
  matrixContainer1.innerHTML = "";
  matrixContainer2.innerHTML = "";
}

function renderMatrix() {
  deleteMatrix();
  const { matrix1, matrix2 } = appState;
  const matrix1Elmt = Matrix(
    matrix1.selectedRows,
    matrix1.selectedColumns,
    (row, col) => renderCell(1, row, col)
  );
  const matrix2Elmt = Matrix(
    matrix2.selectedRows,
    matrix2.selectedColumns,
    (row, col) => renderCell(2, row, col)
  );
  matrixContainer1.append(matrix1Elmt);
  matrixContainer2.append(matrix2Elmt);
}

sendButton.addEventListener("click", async () => {
  try {
    const matrix1Values = getMatrixFrom(
      matrixContainer1,
      appState.matrix1.selectedRows,
      appState.matrix1.selectedColumns
    );
    console.log(matrixContainer1);
    const matrix2Values = getMatrixFrom(
      matrixContainer2,
      appState.matrix2.selectedRows,
      appState.matrix2.selectedColumns
    );
    console.log(matrixContainer1);
    const response = await fetch("/api/matrix/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [matrix1Values, matrix2Values],
      }),
    });

    const { result } = await response.json();
    errorMessage.hide();
    resultMatrixContainer.innerHTML = "";

    const resultMatrix = Matrix(result.length, result[0].length, (row, col) => {
      const cell = document.createElement("div");
      cell.innerHTML = `
                <p class="border border-1 m-2 p-2">
                    ${result[row][col].toFixed(2)} 
                </p>
            `;
      return cell;
    });
    resultMatrixContainer.append(resultMatrix);
  } catch (err) {
    errorMessage.show(`
            <p class="">
                ${err.message || "Ha ocurrido un error inesperado"}
            </p>
        `);
  }
});
