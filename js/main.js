// Main page JavaScript

let catalogues = [];

// Initialize main page
document.addEventListener('DOMContentLoaded', async () => {
  await loadCatalogues();
  setupEventListeners();
});

// Load catalogues from Firebase
async function loadCatalogues() {
  try {
    showSkeleton('catalogues-grid', 3);
    
    const snapshot = await db.ref('catalogues').once('value');
    catalogues = [];
    
    snapshot.forEach(childSnapshot => {
      catalogues.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    renderCatalogues();
  } catch (error) {
    console.error('Error loading catalogues:', error);
    showToast('Error loading catalogues. Please check your Firebase configuration.', 'error');
    document.getElementById('catalogues-grid').innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500">Error loading catalogues. Please check your Firebase configuration.</p>
      </div>
    `;
  }
}

// Render catalogues grid
function renderCatalogues() {
  const container = document.getElementById('catalogues-grid');
  
  if (catalogues.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M19 11H9a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-2 8H11v-4h6v4zm9-8v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2zm10 2v-4h-6v4h6z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No catalogues available</h3>
        <p class="mt-1 text-sm text-gray-500">Catalogues will appear here once they are created in the admin panel.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = catalogues.map(catalogue => {
    const imageCount = catalogue.images ? catalogue.images.length : 0;
    const views = catalogue.views || 0;
    const totalClicks = catalogue.images ? 
      catalogue.images.reduce((sum, img) => sum + (img.clicks || 0), 0) : 0;
    
    // Get a sample image for the card
    const sampleImage = catalogue.images && catalogue.images.length > 0 ? 
      catalogue.images[0].url : 'https://images.pexels.com/photos/3965543/pexels-photo-3965543.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1';
    
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div class="h-48 bg-gray-200 relative">
          <img src="${sampleImage}" alt="${catalogue.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <a href="${catalogue.id}.html" class="bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
              View Catalogue
            </a>
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">${catalogue.title}</h3>
          <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
              </svg>
              ${imageCount} items
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              ${formatNumber(views)} views
            </div>
          </div>
          <div class="flex justify-between items-center">
            <a href="${catalogue.id}.html" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Browse Products →
            </a>
            <div class="text-xs text-gray-400">
              ${formatNumber(totalClicks)} total clicks
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Listen for real-time updates
  db.ref('catalogues').on('value', (snapshot) => {
    catalogues = [];
    snapshot.forEach(childSnapshot => {
      catalogues.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    renderCatalogues();
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}