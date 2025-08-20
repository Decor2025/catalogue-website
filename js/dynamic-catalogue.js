// Dynamic catalogue page JavaScript

let currentCatalogueId = null;
let products = [];
let catalogueData = null;

// Initialize dynamic catalogue page
document.addEventListener('DOMContentLoaded', () => {
  const urlPath = window.location.pathname;

  // Extract catalogue ID from URL
  if (urlPath.includes('/catalogue/')) {
    // URL like /catalogue/wooden
    const segments = urlPath.split('/');
    currentCatalogueId = segments[segments.length - 1];
  } else {
    // Fallback: check URL parameters
    const params = new URLSearchParams(window.location.search);
    currentCatalogueId = params.get('id');
  }

  if (currentCatalogueId) {
    loadCatalogueData();
    loadNavigationLinks();
    setupEventListeners();
  } else {
    showNotFoundState();
  }
});

// Load navigation links
async function loadNavigationLinks() {
  try {
    const snapshot = await db.ref('catalogues').once('value');
    const navLinks = document.getElementById('nav-links');

    let linksHTML = '<a href="/" class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Home</a>';

    snapshot.forEach(childSnapshot => {
      const catalogue = childSnapshot.val();
      const isActive = childSnapshot.key === currentCatalogueId;
      const activeClass = isActive
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-gray-700';

      linksHTML += `<a href="${childSnapshot.key}.html" class="${activeClass} px-3 py-2 text-sm font-medium">${catalogue.title}</a>`;
    });

    navLinks.innerHTML = linksHTML;
  } catch (error) {
    console.error('Error loading navigation:', error);
  }
}

// Load catalogue data from Firebase
async function loadCatalogueData() {
  try {
    document.getElementById('loading-skeleton').style.display = 'grid';
    document.getElementById('products-grid').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('not-found-state').style.display = 'none';

    // Listen for real-time updates
    db.ref(`catalogues/${currentCatalogueId}`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        catalogueData = snapshot.val();
        updatePageContent(catalogueData);

        // Increment view count on first load
        if (products.length === 0) {
          incrementViewCount();
        }

        products = catalogueData.images || [];
        renderProducts();
      } else {
        showNotFoundState();
      }
    });
  } catch (error) {
    console.error('Error loading catalogue:', error);
    if (window.showToast) {
      showToast('Error loading catalogue data', 'error');
    }
    showNotFoundState();
  }
}

// Update page content
function updatePageContent(data) {
  const title = data.title || `${currentCatalogueId.charAt(0).toUpperCase() + currentCatalogueId.slice(1)} Products`;
  const views = data.views || 0;
  const imageCount = data.images ? data.images.length : 0;

  document.title = `${title} - Virtual Product Catalogue`;
  document.getElementById('catalogue-title').textContent = title;
  document.getElementById('catalogue-description').textContent = `Browse our collection of ${title.toLowerCase()}`;
  document.getElementById('view-count').textContent = `${window.formatNumber ? formatNumber(views) : views} views`;
  document.getElementById('image-count').textContent = `${imageCount} items`;
}

// Increment view count
async function incrementViewCount() {
  try {
    const catalogueRef = db.ref(`catalogues/${currentCatalogueId}`);
    const snapshot = await catalogueRef.once('value');

    if (snapshot.exists()) {
      await catalogueRef.update({
        views: (snapshot.val().views || 0) + 1
      });
    } else {
      await catalogueRef.set({
        title: `${currentCatalogueId.charAt(0).toUpperCase() + currentCatalogueId.slice(1)} Products`,
        images: [],
        views: 1,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Render products grid
function renderProducts() {
  const loadingContainer = document.getElementById('loading-skeleton');
  const productsContainer = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const notFoundState = document.getElementById('not-found-state');

  loadingContainer.style.display = 'none';
  notFoundState.style.display = 'none';

  if (products.length === 0) {
    productsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  productsContainer.style.display = 'grid';

  productsContainer.innerHTML = products.map((product, index) => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden product-card cursor-pointer"
         onclick="openProductModal(${index})">
      <div class="image-container h-48 bg-gray-200 relative">
        <img src="${product.url}" alt="${product.title}" 
             class="w-full h-full object-cover loading-shimmer"
             onload="this.classList.remove('loading-shimmer')"
             onerror="this.src='https://images.pexels.com/photos/3965543/pexels-photo-3965543.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'">
        <div class="image-overlay">
          <div class="text-white text-center">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <p class="text-sm">View Details</p>
          </div>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">${product.title}</h3>
        <p class="text-sm text-blue-600 font-medium mb-2">${product.code}</p>
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description}</p>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            ${window.formatNumber ? formatNumber(product.clicks || 0) : (product.clicks || 0)} clicks
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (window.setupLazyLoading) {
    setupLazyLoading();
  }
}

// Show not found state
function showNotFoundState() {
  document.getElementById('loading-skeleton').style.display = 'none';
  document.getElementById('products-grid').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('not-found-state').style.display = 'block';

  document.title = 'Catalogue Not Found - Virtual Product Catalogue';
  document.getElementById('catalogue-title').textContent = 'Catalogue Not Found';
  document.getElementById('catalogue-description').textContent = 'The requested catalogue does not exist';
}

// Open product modal
function openProductModal(index) {
  const product = products[index];
  if (!product) return;

  incrementClickCount(index);

  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-content').innerHTML = `
    <div class="space-y-4">
      <img src="${product.url}" alt="${product.title}" 
           class="w-full h-64 object-cover rounded-lg">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-600">${product.code}</span>
          <span class="text-xs text-gray-500">${window.formatNumber ? formatNumber(product.clicks || 0) : (product.clicks || 0)} views</span>
        </div>
        <p class="text-gray-700">${product.description}</p>
      </div>
    </div>
  `;

  if (window.showModal) {
    showModal('image-modal');
  } else {
    document.getElementById('image-modal').classList.remove('hidden');
  }
}

// Increment click count
async function incrementClickCount(index) {
  try {
    const updatedImages = [...products];
    updatedImages[index] = {
      ...updatedImages[index],
      clicks: (updatedImages[index].clicks || 0) + 1
    };

    await db.ref(`catalogues/${currentCatalogueId}/images`).set(updatedImages);
  } catch (error) {
    console.error('Error incrementing click count:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('close-modal').addEventListener('click', () => {
    if (window.hideModal) {
      hideModal('image-modal');
    } else {
      document.getElementById('image-modal').classList.add('hidden');
    }
  });

  document.getElementById('image-modal').addEventListener('click', (e) => {
    if (e.target.id === 'image-modal') {
      if (window.hideModal) {
        hideModal('image-modal');
      } else {
        document.getElementById('image-modal').classList.add('hidden');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (window.hideModal) {
        hideModal('image-modal');
      } else {
        document.getElementById('image-modal').classList.add('hidden');
      }
    }
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (currentCatalogueId) {
    db.ref(`catalogues/${currentCatalogueId}`).off();
  }
});

window.openProductModal = openProductModal;
