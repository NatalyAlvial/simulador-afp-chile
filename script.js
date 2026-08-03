"use strict";

/* =========================================
   PARÁMETROS DEL SIMULADOR
   Referencia: agosto de 2026
========================================= */

const PARAMETROS = {
    porcentajeAhorroObligatorio: 0.10,
    topeImponibleUF: 90,
    valorUFReferencia: 40844.79,
    tasaSalud: 0.07,

    pguMaximaGeneral: 231732,
    pguMaximaAumentada: 250275,
    pguPensionBaseMaximaCompleta: 789139,
    pguPensionBaseLimite: 1252602,

    tasaRetiroProgramado2026: 0.0331,

    fechaReferencia: new Date(2026, 7, 1),
    textoFechaReferencia: "agosto de 2026",
    textoComisionesPension: "julio de 2026"
};

/* =========================================
   AFP Y COMISIONES
========================================= */

const AFP = {
    capital: { nombre: "Capital", comisionCotizante: 1.44, comisionPension: 1.25 },
    cuprum: { nombre: "Cuprum", comisionCotizante: 1.44, comisionPension: 1.25 },
    habitat: { nombre: "Habitat", comisionCotizante: 1.27, comisionPension: 0.95 },
    modelo: { nombre: "Modelo", comisionCotizante: 0.58, comisionPension: 1.20 },
    planvital: { nombre: "PlanVital", comisionCotizante: 1.16, comisionPension: 0.00 },
    provida: { nombre: "Provida", comisionCotizante: 1.45, comisionPension: 1.25 },
    uno: { nombre: "Uno", comisionCotizante: 0.46, comisionPension: 1.20 }
};

const ESCENARIOS_RENTABILIDAD = {
    conservador: { nombre: "Conservador", tasaAnual: 0.02 },
    esperado: { nombre: "Esperado", tasaAnual: 0.04 },
    optimista: { nombre: "Optimista", tasaAnual: 0.06 }
};

/* =========================================
   ELEMENTOS DEL FORMULARIO
========================================= */

const formulario = document.getElementById("formularioSimulador");
const sueldoImponibleInput = document.getElementById("sueldoImponible");
const saldoActualInput = document.getElementById("saldoActual");
const sexoSelect = document.getElementById("sexo");
const edadActualInput = document.getElementById("edadActual");
const edadJubilacionInput = document.getElementById("edadJubilacion");
const aniosCotizadosPreviosInput = document.getElementById("aniosCotizadosPrevios");
const afpSelect = document.getElementById("afp");
const mesesCotizadosSelect = document.getElementById("mesesCotizados");
const crecimientoSueldoInput = document.getElementById("crecimientoSueldo");
const ahorroVoluntarioInput = document.getElementById("ahorroVoluntario");
const otrasPensionesInput = document.getElementById("otrasPensiones");
const beneficiariosSelect = document.getElementById("beneficiarios");
const cumplePGUSelect = document.getElementById("cumplePGU");
const rentabilidadSelect = document.getElementById("rentabilidad");

/* =========================================
   ELEMENTOS DE RESULTADOS
========================================= */

const resultados = document.getElementById("resultados");
const resumenSimulacion = document.getElementById("resumenSimulacion");
const resultadoAporteMensual = document.getElementById("resultadoAporteMensual");
const resultadoTotalAportado = document.getElementById("resultadoTotalAportado");
const resultadoAporteEmpleador = document.getElementById("resultadoAporteEmpleador");
const resultadoComisionesPagadas = document.getElementById("resultadoComisionesPagadas");
const resultadoRentabilidad = document.getElementById("resultadoRentabilidad");
const resultadoSaldoCRP = document.getElementById("resultadoSaldoCRP");
const resultadoSaldoFinal = document.getElementById("resultadoSaldoFinal");
const resultadoPension = document.getElementById("resultadoPension");
const rangoPension = document.getElementById("rangoPension");
const resultadoPensionAFPBruta = document.getElementById("resultadoPensionAFPBruta");
const resultadoComisionPensionAFP = document.getElementById("resultadoComisionPensionAFP");
const textoComisionPensionAFP = document.getElementById("textoComisionPensionAFP");
const resultadoPensionAFP = document.getElementById("resultadoPensionAFP");
const resultadoPensionCRP = document.getElementById("resultadoPensionCRP");
const resultadoBAC = document.getElementById("resultadoBAC");
const resultadoCEV = document.getElementById("resultadoCEV");
const resultadoPGU = document.getElementById("resultadoPGU");
const resultadoOtrasPensiones = document.getElementById("resultadoOtrasPensiones");
const resultadoSalud = document.getElementById("resultadoSalud");
const resultadoPensionLiquida = document.getElementById("resultadoPensionLiquida");
const resultadoPensionLiquidaBonificada = document.getElementById("resultadoPensionLiquidaBonificada");
const notaBeneficios = document.getElementById("notaBeneficios");
const tablaProyeccion = document.getElementById("tablaProyeccion");

/* =========================================
   UTILIDADES
========================================= */

function asignarTexto(elemento, texto) {
    if (elemento) elemento.textContent = texto;
}

function obtenerNumero(valor) {
    return Number(String(valor).replace(/\D/g, "")) || 0;
}

function obtenerNumeroDecimal(valor) {
    const numero = Number(String(valor).trim().replace(",", "."));
    return Number.isFinite(numero) ? numero : 0;
}

function formatearInputMoneda(input) {
    const numero = obtenerNumero(input.value);
    input.value = numero === 0 ? "" : numero.toLocaleString("es-CL");
}

function formatearPesos(valor) {
    const numeroSeguro = Number.isFinite(valor) ? valor : 0;
    return Math.round(numeroSeguro).toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}

function formatearPorcentaje(valor) {
    return `${valor.toLocaleString("es-CL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}%`;
}

function sumarMeses(fecha, cantidadMeses) {
    return new Date(fecha.getFullYear(), fecha.getMonth() + cantidadMeses, 1);
}

function obtenerSerieMes(fecha) {
    return fecha.getFullYear() * 12 + fecha.getMonth();
}

function limitar(valor, minimo, maximo) {
    return Math.min(maximo, Math.max(minimo, valor));
}

/* =========================================
   CARGAR AFP Y FORMATEAR MONEDAS
========================================= */

function cargarAFP() {
    Object.entries(AFP).forEach(([codigo, datos]) => {
        const opcion = document.createElement("option");
        opcion.value = codigo;
        opcion.textContent = `AFP ${datos.nombre} — Comisión ${formatearPorcentaje(datos.comisionCotizante)}`;
        afpSelect.appendChild(opcion);
    });
}

[sueldoImponibleInput, saldoActualInput, ahorroVoluntarioInput, otrasPensionesInput]
    .forEach((input) => {
        input.addEventListener("input", () => formatearInputMoneda(input));

        input.addEventListener("blur", () => {
            if (input.value.trim() === "") input.value = "0";
        });

        input.addEventListener("focus", () => {
            if (input.value === "0") input.value = "";
        });
    });

/* =========================================
   APORTE DEL EMPLEADOR
========================================= */

function obtenerTasasEmpleador(fecha) {
    const serie = obtenerSerieMes(fecha);
    const ago2025 = 2025 * 12 + 7;
    const ago2026 = 2026 * 12 + 7;
    const ago2027 = 2027 * 12 + 7;
    const ago2028 = 2028 * 12 + 7;
    const ago2029 = 2029 * 12 + 7;
    const ago2030 = 2030 * 12 + 7;
    const ago2031 = 2031 * 12 + 7;
    const ago2032 = 2032 * 12 + 7;
    const ago2033 = 2033 * 12 + 7;
    const ago2045 = 2045 * 12 + 7;

    if (serie < ago2025) return { cuentaIndividual: 0, crp: 0 };
    if (serie < ago2026) return { cuentaIndividual: 0.001, crp: 0 };
    if (serie < ago2027) return { cuentaIndividual: 0.001, crp: 0.009 };
    if (serie < ago2028) return { cuentaIndividual: 0.0025, crp: 0.015 };
    if (serie < ago2029) return { cuentaIndividual: 0.010, crp: 0.015 };
    if (serie < ago2030) return { cuentaIndividual: 0.017, crp: 0.015 };
    if (serie < ago2031) return { cuentaIndividual: 0.024, crp: 0.015 };
    if (serie < ago2032) return { cuentaIndividual: 0.031, crp: 0.015 };
    if (serie < ago2033) return { cuentaIndividual: 0.038, crp: 0.015 };
    if (serie < ago2045) return { cuentaIndividual: 0.045, crp: 0.015 };

    const pasosAnuales = limitar(Math.floor((serie - ago2045) / 12) + 1, 1, 10);

    return {
        cuentaIndividual: 0.045 + pasosAnuales * 0.0015,
        crp: Math.max(0, 0.015 - pasosAnuales * 0.0015)
    };
}

/* =========================================
   BENEFICIO POR AÑOS COTIZADOS
========================================= */

function obtenerMinimoAniosBAC(sexo, anioEnQueCumple65) {
    if (sexo === "hombre") return 20;
    if (anioEnQueCumple65 <= 2027) return 10;
    if (anioEnQueCumple65 <= 2029) return 11;
    if (anioEnQueCumple65 <= 2031) return 12;
    if (anioEnQueCumple65 <= 2033) return 13;
    if (anioEnQueCumple65 <= 2035) return 14;
    return 15;
}

function calcularBAC(datos, mesesCotizadosFuturos, fechaJubilacion) {
    if (aniosCotizadosPreviosInput.value.trim() === "") {
        return {
            conocido: false,
            monto: 0,
            texto: "No calculado",
            aniosReconocidos: null,
            minimoExigido: null
        };
    }

    const mesesPrevios = Math.max(0, datos.aniosCotizadosPrevios * 12);
    const mesesTotales = mesesPrevios + mesesCotizadosFuturos;
    const aniosReconocidos = Math.min(25, Math.floor(mesesTotales / 12));

    const fechaCumple65 = sumarMeses(
        PARAMETROS.fechaReferencia,
        Math.max(0, (65 - datos.edadActual) * 12)
    );

    const anioEnQueCumple65 = datos.edadJubilacion >= 65
        ? fechaJubilacion.getFullYear()
        : fechaCumple65.getFullYear();

    const minimoExigido = obtenerMinimoAniosBAC(datos.sexo, anioEnQueCumple65);

    if (datos.edadJubilacion < 65) {
        return {
            conocido: true,
            monto: 0,
            texto: "Se paga desde los 65 años",
            aniosReconocidos,
            minimoExigido
        };
    }

    if (aniosReconocidos < minimoExigido) {
        return {
            conocido: true,
            monto: 0,
            texto: "$0",
            aniosReconocidos,
            minimoExigido
        };
    }

    const monto = aniosReconocidos * 0.1 * PARAMETROS.valorUFReferencia;

    return {
        conocido: true,
        monto,
        texto: formatearPesos(monto),
        aniosReconocidos,
        minimoExigido
    };
}

/* =========================================
   PGU
========================================= */

function obtenerPGUMaxima(fechaJubilacion, edadJubilacion) {
    const septiembre2026 = new Date(2026, 8, 1);
    const septiembre2027 = new Date(2027, 8, 1);

    if (fechaJubilacion >= septiembre2027 && edadJubilacion >= 65) {
        return PARAMETROS.pguMaximaAumentada;
    }

    if (fechaJubilacion >= septiembre2026 && edadJubilacion >= 75) {
        return PARAMETROS.pguMaximaAumentada;
    }

    if (edadJubilacion >= 82) return PARAMETROS.pguMaximaAumentada;
    return PARAMETROS.pguMaximaGeneral;
}

function calcularPGUPotencial(pensionBase, fechaJubilacion, edadJubilacion) {
    if (edadJubilacion < 65) return 0;

    const maxima = obtenerPGUMaxima(fechaJubilacion, edadJubilacion);
    const tramoCompleto = PARAMETROS.pguPensionBaseMaximaCompleta;
    const limite = PARAMETROS.pguPensionBaseLimite;

    if (pensionBase <= tramoCompleto) return maxima;
    if (pensionBase >= limite) return 0;

    return Math.max(
        0,
        maxima * ((limite - pensionBase) / (limite - tramoCompleto))
    );
}

/* =========================================
   COMPENSACIÓN PARA MUJERES
========================================= */

function obtenerTextoCEV(datos) {
    if (datos.sexo !== "mujer") return "$0";

    const minimoReferencial = 0.25 * PARAMETROS.valorUFReferencia;

    if (datos.edadJubilacion < 65) {
        return `Potencial desde los 65: ${formatearPesos(minimoReferencial)}`;
    }

    return `Potencial desde ${formatearPesos(minimoReferencial)}`;
}

/* =========================================
   PENSIÓN AFP APROXIMADA
========================================= */

function calcularRentaMensual(saldo, mesesPago) {
    if (saldo <= 0 || mesesPago <= 0) return 0;

    const tasaMensual = Math.pow(
        1 + PARAMETROS.tasaRetiroProgramado2026,
        1 / 12
    ) - 1;

    return saldo * tasaMensual /
        (1 - Math.pow(1 + tasaMensual, -mesesPago));
}

function calcularPensionAFP(datos, saldoFinal) {
    const edadFinalReferencial = datos.sexo === "mujer" ? 92 : 89;

    const factoresBeneficiarios = {
        ninguno: 1,
        conyuge: 1.08,
        hijos: 1.05,
        ambos: 1.12
    };

    const factorBeneficiarios = factoresBeneficiarios[datos.beneficiarios] || 1;
    const aniosPagoCentrales = Math.max(15, edadFinalReferencial - datos.edadJubilacion);
    const mesesCentrales = Math.round(aniosPagoCentrales * 12 * factorBeneficiarios);
    const mesesEscenarioLargo = mesesCentrales + 36;
    const mesesEscenarioCorto = Math.max(120, mesesCentrales - 36);

    return {
        central: calcularRentaMensual(saldoFinal, mesesCentrales),
        minima: calcularRentaMensual(saldoFinal, mesesEscenarioLargo),
        maxima: calcularRentaMensual(saldoFinal, mesesEscenarioCorto)
    };
}

/* =========================================
   VALIDACIÓN
========================================= */

function validarDatos(datos) {
    if (datos.sueldoImponible <= 0) {
        alert("Ingresa un sueldo imponible mayor que cero.");
        sueldoImponibleInput.focus();
        return false;
    }

    if (datos.edadActual < 18 || datos.edadActual > 80) {
        alert("Ingresa una edad actual válida.");
        edadActualInput.focus();
        return false;
    }

    if (datos.edadJubilacion <= datos.edadActual || datos.edadJubilacion > 90) {
        alert("La edad de jubilación debe ser mayor que la edad actual y no superar los 90 años.");
        edadJubilacionInput.focus();
        return false;
    }

    if (!datos.sexo) {
        alert("Selecciona el sexo para el cálculo previsional.");
        sexoSelect.focus();
        return false;
    }

    if (!datos.codigoAFP || !AFP[datos.codigoAFP]) {
        alert("Selecciona tu AFP.");
        afpSelect.focus();
        return false;
    }

    if (datos.crecimientoSueldo < -5 || datos.crecimientoSueldo > 10) {
        alert("El crecimiento real del sueldo debe estar entre -5% y 10%.");
        crecimientoSueldoInput.focus();
        return false;
    }

    if (datos.aniosCotizadosPrevios < 0 || datos.aniosCotizadosPrevios > 50) {
        alert("Los años cotizados deben estar entre 0 y 50.");
        aniosCotizadosPreviosInput.focus();
        return false;
    }

    return true;
}

/* =========================================
   TABLA DE PROYECCIÓN
========================================= */

function agregarFilaTabla(datosFila) {
    const fila = document.createElement("tr");

    const valores = [
        datosFila.anio,
        datosFila.edad,
        formatearPesos(datosFila.aportesPersonales),
        formatearPesos(datosFila.aporteEmpleador),
        formatearPesos(datosFila.rentabilidad),
        formatearPesos(datosFila.saldoAFP),
        formatearPesos(datosFila.saldoCRP)
    ];

    valores.forEach((valor) => {
        const celda = document.createElement("td");
        celda.textContent = valor;
        fila.appendChild(celda);
    });

    tablaProyeccion.appendChild(fila);
}

/* =========================================
   PROYECCIÓN PRINCIPAL
========================================= */

function calcularProyeccion(datos) {
    const datosAFP = AFP[datos.codigoAFP];
    const escenario = ESCENARIOS_RENTABILIDAD[datos.escenario];
    const topeImponiblePesos = PARAMETROS.topeImponibleUF * PARAMETROS.valorUFReferencia;
    const tasaMensualRentabilidad = Math.pow(1 + escenario.tasaAnual, 1 / 12) - 1;
    const cantidadMeses = Math.round((datos.edadJubilacion - datos.edadActual) * 12);
    const fechaJubilacion = sumarMeses(PARAMETROS.fechaReferencia, cantidadMeses);

    let saldoAFP = datos.saldoActual;
    let saldoCRP = 0;
    let totalAportesPersonales = 0;
    let totalAporteEmpleadorCuenta = 0;
    let totalComisionesCotizante = 0;
    let mesesCotizadosFuturos = 0;
    let aporteObligatorioPrimerMes = 0;
    let comisionCotizantePrimerMes = 0;

    tablaProyeccion.innerHTML = "";

    for (let indiceMes = 0; indiceMes < cantidadMeses; indiceMes++) {
        const fechaMes = sumarMeses(PARAMETROS.fechaReferencia, indiceMes);
        const anioProyeccion = Math.floor(indiceMes / 12);

        const sueldoMes = datos.sueldoImponible * Math.pow(
            1 + datos.crecimientoSueldo / 100,
            anioProyeccion
        );

        const baseImponible = Math.min(sueldoMes, topeImponiblePesos);
        const aporteObligatorio = baseImponible * PARAMETROS.porcentajeAhorroObligatorio;
        const comisionCotizante = baseImponible * (datosAFP.comisionCotizante / 100);
        const tasasEmpleador = obtenerTasasEmpleador(fechaMes);
        const aporteEmpleadorCuenta = baseImponible * tasasEmpleador.cuentaIndividual;
        const aporteCRP = baseImponible * tasasEmpleador.crp;
        const cotizaEsteMes = (indiceMes % 12) < datos.mesesCotizados;

        saldoAFP *= 1 + tasaMensualRentabilidad;

        if (indiceMes === 0) {
            aporteObligatorioPrimerMes = aporteObligatorio;
            comisionCotizantePrimerMes = comisionCotizante;
        }

        if (cotizaEsteMes) {
            saldoAFP += aporteObligatorio + aporteEmpleadorCuenta;
            saldoCRP += aporteCRP;
            totalAportesPersonales += aporteObligatorio;
            totalAporteEmpleadorCuenta += aporteEmpleadorCuenta;
            totalComisionesCotizante += comisionCotizante;
            mesesCotizadosFuturos++;
        }

        if (datos.ahorroVoluntario > 0) {
            saldoAFP += datos.ahorroVoluntario;
            totalAportesPersonales += datos.ahorroVoluntario;
        }

        if ((indiceMes + 1) % 12 === 0) {
            const rentabilidadAcumulada = saldoAFP
                - datos.saldoActual
                - totalAportesPersonales
                - totalAporteEmpleadorCuenta;

            agregarFilaTabla({
                anio: fechaMes.getFullYear(),
                edad: datos.edadActual + (indiceMes + 1) / 12,
                aportesPersonales: totalAportesPersonales,
                aporteEmpleador: totalAporteEmpleadorCuenta,
                rentabilidad: Math.max(0, rentabilidadAcumulada),
                saldoAFP,
                saldoCRP
            });
        }
    }

    const rentabilidadTotal = saldoAFP
        - datos.saldoActual
        - totalAportesPersonales
        - totalAporteEmpleadorCuenta;

    const pensionAFPBruta = calcularPensionAFP(datos, saldoAFP);
    const tasaComisionPensionAFP = datosAFP.comisionPension / 100;
    const comisionPensionAFP = pensionAFPBruta.central * tasaComisionPensionAFP;
    const pensionAFPNeta = pensionAFPBruta.central - comisionPensionAFP;
    const pensionAFPMinimaNeta = pensionAFPBruta.minima * (1 - tasaComisionPensionAFP);
    const pensionAFPMaximaNeta = pensionAFPBruta.maxima * (1 - tasaComisionPensionAFP);

    const pensionCRP = saldoCRP / 240;
    const bac = calcularBAC(datos, mesesCotizadosFuturos, fechaJubilacion);

    const pensionBaseParaPGU = pensionAFPBruta.central
        + pensionCRP
        + bac.monto
        + datos.otrasPensiones;

    const pguPotencial = calcularPGUPotencial(
        pensionBaseParaPGU,
        fechaJubilacion,
        datos.edadJubilacion
    );

    const pguIncluida = datos.cumplePGU === "si" ? pguPotencial : 0;

    const totalHaberesBrutos = pensionAFPBruta.central
        + pensionCRP
        + bac.monto
        + pguIncluida
        + datos.otrasPensiones;

    const pensionAntesDeSalud = totalHaberesBrutos - comisionPensionAFP;
    const descuentoSalud = totalHaberesBrutos * PARAMETROS.tasaSalud;
    const pensionLiquidaSinBonificacion = totalHaberesBrutos
        - comisionPensionAFP
        - descuentoSalud;
    const pensionLiquidaConBonificacion = totalHaberesBrutos
        - comisionPensionAFP;

    return {
        datosAFP,
        escenario,
        fechaJubilacion,
        topeImponiblePesos,
        aporteObligatorioPrimerMes,
        comisionCotizantePrimerMes,
        totalAportesPersonales,
        totalAporteEmpleadorCuenta,
        totalComisionesCotizante,
        rentabilidadTotal: Math.max(0, rentabilidadTotal),
        saldoAFP,
        saldoCRP,
        pensionAFPBruta,
        comisionPensionAFP,
        pensionAFPNeta,
        pensionAFPMinimaNeta,
        pensionAFPMaximaNeta,
        pensionCRP,
        bac,
        textoCEV: obtenerTextoCEV(datos),
        pguPotencial,
        pguIncluida,
        pensionAntesDeSalud,
        descuentoSalud,
        pensionLiquidaSinBonificacion,
        pensionLiquidaConBonificacion
    };
}

/* =========================================
   MOSTRAR RESULTADOS
========================================= */

function mostrarResultados(datos, calculo) {
    asignarTexto(resultadoAporteMensual, formatearPesos(calculo.aporteObligatorioPrimerMes));
    asignarTexto(resultadoTotalAportado, formatearPesos(calculo.totalAportesPersonales));
    asignarTexto(resultadoAporteEmpleador, formatearPesos(calculo.totalAporteEmpleadorCuenta));
    asignarTexto(resultadoComisionesPagadas, formatearPesos(calculo.totalComisionesCotizante));
    asignarTexto(resultadoRentabilidad, formatearPesos(calculo.rentabilidadTotal));
    asignarTexto(resultadoSaldoCRP, formatearPesos(calculo.saldoCRP));
    asignarTexto(resultadoSaldoFinal, formatearPesos(calculo.saldoAFP));
    asignarTexto(
    resultadoPension,
    formatearPesos(
        calculo.pensionAntesDeSalud +
        calculo.comisionPensionAFP
    )
);

    asignarTexto(
        rangoPension,
        `Rango AFP después de comisión: ${formatearPesos(calculo.pensionAFPMinimaNeta)} ` +
        `a ${formatearPesos(calculo.pensionAFPMaximaNeta)}`
    );

    asignarTexto(resultadoPensionAFPBruta, formatearPesos(calculo.pensionAFPBruta.central));

    asignarTexto(
        resultadoComisionPensionAFP,
        calculo.comisionPensionAFP > 0
            ? `- ${formatearPesos(calculo.comisionPensionAFP)}`
            : formatearPesos(0)
    );

    asignarTexto(
        textoComisionPensionAFP,
        `Retiro Programado · ${formatearPorcentaje(calculo.datosAFP.comisionPension)} ` +
        `sobre la pensión AFP · referencia ${PARAMETROS.textoComisionesPension}`
    );

    asignarTexto(resultadoPensionAFP, formatearPesos(calculo.pensionAFPNeta));
    asignarTexto(resultadoPensionCRP, formatearPesos(calculo.pensionCRP));
    asignarTexto(resultadoBAC, calculo.bac.texto);
    asignarTexto(resultadoCEV, calculo.textoCEV);

    if (datos.cumplePGU === "si") {
        asignarTexto(resultadoPGU, formatearPesos(calculo.pguIncluida));
    } else if (datos.cumplePGU === "no") {
        asignarTexto(resultadoPGU, "$0");
    } else {
        asignarTexto(resultadoPGU, `Potencial: ${formatearPesos(calculo.pguPotencial)}`);
    }

    asignarTexto(resultadoOtrasPensiones, formatearPesos(datos.otrasPensiones));
    asignarTexto(resultadoSalud, `- ${formatearPesos(calculo.descuentoSalud)}`);
    asignarTexto(resultadoPensionLiquida, formatearPesos(calculo.pensionLiquidaSinBonificacion));
    asignarTexto(
        resultadoPensionLiquidaBonificada,
        formatearPesos(calculo.pensionLiquidaConBonificacion)
    );

    const textoPGU = datos.cumplePGU === "si"
        ? "La PGU potencial fue incluida en el total."
        : datos.cumplePGU === "no"
            ? "No se incluyó PGU porque indicaste que no cumples sus requisitos."
            : "La PGU potencial se muestra por separado y no fue sumada porque indicaste que no sabes si cumples los requisitos.";

    let textoBAC;

    if (!calculo.bac.conocido) {
        textoBAC = "El BAC no fue calculado porque dejaste vacíos los años cotizados anteriores.";
    } else if (datos.edadJubilacion < 65) {
        textoBAC = `El BAC se paga desde los 65 años. Años reconocidos estimados: ${calculo.bac.aniosReconocidos}.`;
    } else {
        textoBAC = `Años reconocidos para BAC: ${calculo.bac.aniosReconocidos}. ` +
            `Mínimo estimado exigido: ${calculo.bac.minimoExigido}.`;
    }

    asignarTexto(
        notaBeneficios,
        `${textoPGU} ${textoBAC} ` +
        "La compensación para mujeres no se suma automáticamente porque el IPS debe determinar su monto exacto."
    );

    const seAplicaTope = datos.sueldoImponible > calculo.topeImponiblePesos;
    const textoTope = seAplicaTope
        ? `Se aplicó el tope imponible referencial de ${formatearPesos(calculo.topeImponiblePesos)}.`
        : "No fue necesario aplicar el tope imponible al sueldo inicial.";

    asignarTexto(
        resumenSimulacion,
        `AFP ${calculo.datosAFP.nombre}. ` +
        `Comisión inicial mientras trabaja: ${formatearPesos(calculo.comisionCotizantePrimerMes)} mensuales. ` +
        `Comisión de pensión usada: ${formatearPorcentaje(calculo.datosAFP.comisionPension)}. ` +
        `Escenario ${calculo.escenario.nombre.toLowerCase()} con crecimiento real del sueldo de ` +
        `${datos.crecimientoSueldo.toLocaleString("es-CL")}% anual. ${textoTope} ` +
        `Jubilación aproximada en ${calculo.fechaJubilacion.getFullYear()}. ` +
        `Parámetros expresados en pesos de ${PARAMETROS.textoFechaReferencia}.`
    );

    resultados.classList.remove("oculto");
    resultados.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =========================================
   ENVÍO DEL FORMULARIO
========================================= */

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const textoAniosCotizados = aniosCotizadosPreviosInput.value.trim();

    const datos = {
        sueldoImponible: obtenerNumero(sueldoImponibleInput.value),
        saldoActual: obtenerNumero(saldoActualInput.value),
        sexo: sexoSelect.value,
        edadActual: Number(edadActualInput.value),
        edadJubilacion: Number(edadJubilacionInput.value),
        aniosCotizadosPrevios: textoAniosCotizados === "" ? 0 : Number(textoAniosCotizados),
        codigoAFP: afpSelect.value,
        mesesCotizados: Number(mesesCotizadosSelect.value),
        crecimientoSueldo: obtenerNumeroDecimal(crecimientoSueldoInput.value),
        ahorroVoluntario: obtenerNumero(ahorroVoluntarioInput.value),
        otrasPensiones: obtenerNumero(otrasPensionesInput.value),
        beneficiarios: beneficiariosSelect.value,
        cumplePGU: cumplePGUSelect.value,
        escenario: rentabilidadSelect.value
    };

    if (!validarDatos(datos)) return;

    const calculo = calcularProyeccion(datos);
    mostrarResultados(datos, calculo);
});

/* =========================================
   INICIAR APLICACIÓN
========================================= */

cargarAFP();
