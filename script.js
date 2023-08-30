const photoViewer = document.getElementById('photoViewer');
const prevPhotoButton = document.getElementById('prevPhoto');
const nextPhotoButton = document.getElementById('nextPhoto');
const currentPhoto = document.getElementById('currentPhoto');
let currentPhotoIndex = 0;
let photos = [];

// Función para mostrar fotos en el visor
function showPhoto(photoIndex) {
  currentPhoto.src = photos[photoIndex].url;
  prevPhotoButton.disabled = photoIndex === 0;
  nextPhotoButton.disabled = photoIndex === photos.length - 1;
}

// Event listener para botones de navegación del visor
prevPhotoButton.addEventListener('click', () => {
  if (currentPhotoIndex > 0) {
    currentPhotoIndex--;
    showPhoto(currentPhotoIndex);
  }
});

nextPhotoButton.addEventListener('click', () => {
  if (currentPhotoIndex < photos.length - 1) {
    currentPhotoIndex++;
    showPhoto(currentPhotoIndex);
  }
});

//Función para obtener una foto de la API de Unsplash (API pública, no requiere clave)
async function getPhoto() {
  const response = await fetch('https://source.unsplash.com/random');
  const media = {
    url: response.url,
    media_type: 'image',
    alt_description: `Unsplash Photo`,
    id: new Date().getTime().toString(),
    created_at: new Date().toISOString(),
  };
  return media;
}

// Función para eliminar una foto o video de la galería
function deleteMedia(mediaId) {
  // Eliminar de la vista de la galería
  const mediaCard = document.querySelector(`[data-id="${mediaId}"]`).closest('.col-md-4');
  mediaCard.remove();

  // Eliminar de la tabla de detalles de medios
  const mediaRow = document.querySelector(`#mediaTableBody [data-id="${mediaId}"]`).closest('tr');
  mediaRow.remove();

  // Eliminar de la tabla de detalles de fotos
  const photoRow = document.querySelector(`#photoTableBody [data-id="${mediaId}"]`).closest('tr');
  if (photoRow) {
    photoRow.remove();
  }
}

// Función para mostrar la foto o el video en la galería y en las tablas
function displayMedia(media) {
  const gallery = document.getElementById('gallery');
  const mediaCard = `
    <div class="col-md-4 mb-4">
      <div class="card">
        ${
          media.media_type === 'image'
            ? `<img src="${media.url}" class="card-img-top" alt="${media.alt_description}">`
            : `<video src="${media.url}" class="card-img-top" alt="${media.alt_description}" controls></video>`
        }
        <div class="card-body">
          <h5 class="card-title">${media.alt_description || 'Media'}</h5>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${media.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
  gallery.insertAdjacentHTML('beforeend', mediaCard);

  const mediaTableBody = document.getElementById('mediaTableBody');
  const mediaDetails = `
    <tr>
      <td>${media.created_at}</td>
      <td>${new Date(media.created_at).getFullYear()}</td>
      <td>${new Date(media.created_at).toLocaleString('default', { month: 'long' })}</td>
      <td>${media.media_type === 'image' ? 'Foto' : 'Video'}</td>
      <td>
        <button class="btn btn-danger btn-sm btn-delete" data-id="${media.id}">Eliminar</button>
      </td>
    </tr>
  `;
  mediaTableBody.insertAdjacentHTML('beforeend', mediaDetails);

  const photoTableBody = document.getElementById('photoTableBody');
  photoTableBody.insertAdjacentHTML('beforeend', mediaDetails);
}

// Función para agregar una nueva foto
async function addPhoto() {
  const media = await getPhoto();
  photos.push(media);
  displayMedia(media);
  showPhoto(photos.length - 1);
}

// Carga la galería cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const btnAddPhoto = document.getElementById('btnAddPhoto');
  btnAddPhoto.addEventListener('click', addPhoto);

  // Event listener para eliminar una foto o video al hacer clic en el botón "Eliminar"
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-delete')) {
      const mediaId = event.target.dataset.id;
      deleteMedia(mediaId);
    }
  });

  // Event listener para cargar la galería cuando cambia la opción seleccionada en el select
  document.getElementById('mediaType').addEventListener('change', () => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    loadGallery();
  });

  loadGallery();
});

async function loadGallery() {
  try {
    const mediaType = document.getElementById('mediaType').value;
    const count = 3; // Cantidad de elementos a seleccionar (puedes ajustar este valor)
    let mediaArray = [];

    if (mediaType === 'photo') {
      for (let i = 0; i < count; i++) {
        const media = await getPhoto();
        mediaArray.push(media);
      }
    } else if (mediaType === 'video') {
      mediaArray = await getVideos(count);
    }

    mediaArray.forEach(media => {
      displayMedia(media);
    });

  } catch (error) {
    console.error('Error al cargar el contenido multimedia:', error);
  }
}
