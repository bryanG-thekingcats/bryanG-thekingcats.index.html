const estado = {
    filtroActual: 'todos',
    datos: null
};

const elementos = {
    filtrosDestinos: document.getElementById('filtrosDestinos'),
    destinosGrid: document.getElementById('destinosGrid'),
    detalleDestino: document.getElementById('detalleDestino'),
    detalleCategoria: document.getElementById('detalleCategoria'),
    culturaAccordion: document.getElementById('culturaAccordion'),
    gastronomiaGrid: document.getElementById('gastronomiaGrid'),
    itinerarioForm: document.getElementById('itinerarioForm'),
    itinerarioResumen: document.getElementById('itinerarioResumen'),
    presupuestoEstimado: document.getElementById('presupuestoEstimado'),
    presupuestoValor: document.getElementById('presupuestoValor')
};

function actualizarTema(isNightMode) {
    document.body.classList.toggle('night-mode', isNightMode);
    document.body.classList.toggle('day-mode', !isNightMode);
    const toggleBtn = document.getElementById('toggleTime');
    if (toggleBtn) {
        toggleBtn.textContent = isNightMode ? '☀️ Modo Día' : '🌙 Modo Noche';
        toggleBtn.setAttribute('aria-pressed', String(isNightMode));
    }
}

async function cargarDatos() {
    try {
        const respuesta = await fetch('data/experiencia.json');
        const datos = await respuesta.json();
        estado.datos = datos;
        renderizarDestinos();
        renderizarCultura();
        renderizarGastronomia();
    } catch (error) {
        console.error('No se pudieron cargar los datos:', error);
    }
}

function renderizarDestinos() {
    if (!estado.datos) return;

    const categorias = ['todos', ...new Set(estado.datos.destinos.map((item) => item.categoria))];

    elementos.filtrosDestinos.innerHTML = '';
    categorias.forEach((categoria) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = `btn ${estado.filtroActual === categoria ? 'btn-pixel-primary' : 'btn-pixel'} me-2 mb-2`;
        boton.textContent = categoria === 'todos' ? 'Todos' : categoria;
        boton.addEventListener('click', () => {
            estado.filtroActual = categoria;
            renderizarDestinos();
        });
        elementos.filtrosDestinos.appendChild(boton);
    });

    const destinosFiltrados = estado.filtroActual === 'todos'
        ? estado.datos.destinos
        : estado.datos.destinos.filter((item) => item.categoria === estado.filtroActual);

    elementos.destinosGrid.innerHTML = '';
    destinosFiltrados.forEach((destino) => {
        const col = document.createElement('article');
        col.className = 'col-md-6 col-xl-3';

        col.innerHTML = `
            <div class="card pixel-card destino-card h-100">
                <img src="${destino.imagen}" class="card-img-top" alt="${destino.titulo}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge rounded-pill pixel-badge-soft">${destino.categoria}</span>
                        <span class="badge rounded-pill pixel-badge">${destino.ubicacion}</span>
                    </div>
                    <h3 class="h5 pixel-title">${destino.titulo}</h3>
                    <p class="card-text">${destino.descripcion}</p>
                    <button class="btn btn-pixel w-100 ver-detalle" type="button" data-categoria="${destino.categoria}" data-detalle="${destino.detalle}" data-titulo="${destino.titulo}">Ver detalles</button>
                </div>
            </div>
        `;

        elementos.destinosGrid.appendChild(col);
    });

    document.querySelectorAll('.ver-detalle').forEach((boton) => {
        boton.addEventListener('click', () => {
            const titulo = boton.dataset.titulo;
            const categoria = boton.dataset.categoria;
            const detalle = boton.dataset.detalle;
            elementos.detalleDestino.textContent = `${detalle} ${titulo} te invita a vivir una experiencia auténtica.`;
            elementos.detalleCategoria.textContent = categoria;
        });
    });
}

function renderizarCultura() {
    if (!estado.datos) return;

    elementos.culturaAccordion.innerHTML = '';
    estado.datos.cultura.forEach((item, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                    ${item.titulo}
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#culturaAccordion">
                <div class="accordion-body">
                    <p class="mb-2"><strong>${item.descripcion}</strong></p>
                    <p class="mb-0">${item.contenido}</p>
                </div>
            </div>
        `;

        elementos.culturaAccordion.appendChild(accordionItem);
    });
}

function renderizarGastronomia() {
    if (!estado.datos) return;

    elementos.gastronomiaGrid.innerHTML = '';
    estado.datos.gastronomia.forEach((receta) => {
        const col = document.createElement('article');
        col.className = 'col-md-6 col-xl-3';
        col.innerHTML = `
            <div class="card pixel-card h-100">
                <img src="${receta.imagen}" class="card-img-top" alt="${receta.titulo}">
                <div class="card-body d-flex flex-column">
                    <h3 class="h5 pixel-title">${receta.titulo}</h3>
                    <p class="card-text">${receta.descripcion}</p>
                    <p class="small"><strong>Ingredientes:</strong> ${receta.ingredientes}</p>
                    <button class="btn btn-pixel mt-auto ver-receta" type="button" data-receta-id="${receta.id}" data-bs-toggle="modal" data-bs-target="#recetaModal">Ver receta</button>
                </div>
            </div>
        `;

        elementos.gastronomiaGrid.appendChild(col);
    });

    document.querySelectorAll('.ver-receta').forEach((boton) => {
        boton.addEventListener('click', () => {
            const receta = estado.datos.gastronomia.find((item) => item.id === boton.dataset.recetaId);
            if (!receta) return;

            document.getElementById('recetaModalLabel').textContent = receta.titulo;
            document.getElementById('modalIngredientes').textContent = `Ingredientes: ${receta.ingredientes}`;
            document.getElementById('modalPreparacion').textContent = `Preparación: ${receta.preparacion}`;
        });
    });
}

function actualizarFormulario() {
    const dias = Number(document.getElementById('dias').value);
    const viajeros = Number(document.getElementById('viajeros').value);
    const presupuesto = Number(document.getElementById('presupuesto').value);
    document.getElementById('presupuestoValor').textContent = `${presupuesto} USD`;
    document.getElementById('presupuestoEstimado').textContent = `${presupuesto} USD`;

    const lista = [
        `Días en Puno: ${dias}`,
        `Viajeros: ${viajeros}`,
        `Guía de destinos: lago, islas y cultura`,
        `Costo estimado: ${presupuesto} USD`
    ];

    elementos.itinerarioResumen.innerHTML = lista.map((item) => `<div class="pixel-item">${item}</div>`).join('');
}

function validarFormulario(evento) {
    const formulario = elementos.itinerarioForm;
    Array.from(formulario.elements).forEach((elemento) => {
        if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT') {
            elemento.classList.toggle('is-invalid', !elemento.checkValidity());
            elemento.classList.toggle('is-valid', elemento.checkValidity() && elemento.value !== '');
        }
    });

    if (!formulario.checkValidity()) {
        evento.preventDefault();
        evento.stopPropagation();
        return;
    }

    evento.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const preferencia = document.getElementById('preferencia').value;
    const dias = document.getElementById('dias').value;
    const viajeros = document.getElementById('viajeros').value;
    const presupuesto = document.getElementById('presupuesto').value;

    const itinerario = [
        `Inicio: ${nombre} inicia la ruta con una visita al lago Titicaca.`,
        `En ${dias} días se explora la preferencia ${preferencia} y el itinerario se adapta a ${viajeros} viajero(s).`,
        `Presupuesto estimado: ${presupuesto} USD.`,
        'Incluye transporte, alojamiento sugerido y actividades culturales.'
    ];

    elementos.itinerarioResumen.innerHTML = itinerario.map((item) => `<div class="pixel-item">${item}</div>`).join('');
    document.getElementById('presupuestoEstimado').textContent = `${presupuesto} USD`;
    document.getElementById('resumenEtiqueta').textContent = 'Personalizado';
    formulario.classList.add('was-validated');
}

document.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('timeMode');
    actualizarTema(savedMode === 'night');

    document.getElementById('toggleTime').addEventListener('click', () => {
        const newMode = !document.body.classList.contains('night-mode');
        actualizarTema(newMode);
        localStorage.setItem('timeMode', newMode ? 'night' : 'day');
    });

    const formulario = document.getElementById('itinerarioForm');
    Array.from(formulario.elements).forEach((elemento) => {
        if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT') {
            elemento.addEventListener('input', () => {
                elemento.classList.toggle('is-invalid', !elemento.checkValidity() && elemento.value !== '');
                elemento.classList.toggle('is-valid', elemento.checkValidity() && elemento.value !== '');
            });
        }
    });

    cargarDatos();

    ['input', 'change'].forEach((evento) => {
        document.getElementById('presupuesto').addEventListener(evento, actualizarFormulario);
        document.getElementById('dias').addEventListener(evento, actualizarFormulario);
        document.getElementById('viajeros').addEventListener(evento, actualizarFormulario);
    });

    formulario.addEventListener('submit', validarFormulario);
    actualizarFormulario();
});
