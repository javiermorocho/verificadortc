// script.js
function verificarYConciliar() {
    const transaccionesFile = document.getElementById('transacciones-file').files[0];
    const pagosFile = document.getElementById('pagos-file').files[0];
    
    if (!transaccionesFile || !pagosFile) {
        alert('Por favor, suba ambos archivos CSV.');
        return;
    }

    Promise.all([leerCSV(transaccionesFile), leerCSV(pagosFile)]).then(([transacciones, pagos]) => {
        console.log("Transacciones:", transacciones);
        console.log("Pagos:", pagos);

        const transaccionesIds = transacciones.map(trans => crearId(trans));
        const pagosIds = pagos.map(pago => crearId(pago));

        const conciliados = [];
        
        transacciones.forEach(trans => {
            const transId = crearId(trans);
            const index = pagosIds.indexOf(transId);
            
            if (index !== -1) {
                conciliados.push({...trans, ...pagos[index]});
                pagosIds[index] = null; // Evitar duplicados
            }
        });

        mostrarResultados(conciliados);
    }).catch(error => {
        console.error('Error al procesar los archivos CSV:', error);
    });
}

function leerCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            const text = event.target.result;
            const data = csvToArray(text);
            resolve(data);
        };
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

function csvToArray(text) {
    const rows = text.split('\n').filter(row => row.trim().length > 0);
    const headers = rows[0].split(',');
    return rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((object, header, index) => {
            object[header.trim()] = values[index].trim();
            return object;
        }, {});
    });
}

function crearId(data) {
    const cuenta = data['Cuenta'] || data['Cuenta Transacción'] || data['Cuenta Pago'];
    const numCheque = data['Num_Cheque'] || data['Referencia'];
    const importe = data['Importe Moneda'] || data['Monto'];
    return cuenta.slice(-3) + numCheque + parseFloat(importe.replace(/[$,]/g, '')).toFixed(2);
}

function mostrarResultados(data) {
    const tbody = document.getElementById('results-table').querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        for (const key in row) {
            const td = document.createElement('td');
            td.textContent = row[key];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}
