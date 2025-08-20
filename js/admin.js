// Admin panel JavaScript

let catalogues = [];
let currentCatalogueId = null;
let currentProducts = [];
let editingProductIndex = -1;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
});

// Check authentication state
function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      showAdminPanel();
      loadCatalogues();
      setupEventListeners();
    } else {
      // User is signed out
      showLoginScreen();
    }
  });
}

// Show login screen
function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.body.style.display = 'block';
  
  // Setup login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Show admin panel
function showAdminPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.body.style.display = 'block';
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('login-btn');
  const errorDiv = document.getElementById('login-error');
  
  // Show loading state
  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;
  errorDiv.classList.add('hidden');
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Success - auth state change will handle the rest
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = getAuthErrorMessage(error.code);
    errorDiv.classList.remove('hidden');
  } finally {
    loginBtn.textContent = 'Sign in';
    loginBtn.disabled = false;
  }
}

// Handle logout
async function handleLogout() {
  try {
    await auth.signOut();
    showToast('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error logging out', 'error');
  }
}

// Get user-friendly auth error messages
function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return 'Authentication failed. Please try again';
  }
}

// Load catalogues from Firebase
async function loadCatalogues() {
  try {
    const loadingContainer = document.getElementById('loading-skeleton');
    const cataloguesContainer = document.getElementById('catalogues-grid');
    const emptyState = document.getElementById('empty-state');
    
    loadingContainer.style.display = 'grid';
    cataloguesContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
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
  } catch (error) {
    console.error('Error loading catalogues:', error);
    showToast('Error loading catalogues. Please check your Firebase configuration.', 'error');
  }
}

// Render catalogues grid
function renderCatalogues() {
  const loadingContainer = document.getElementById('loading-skeleton');
  const cataloguesContainer = document.getElementById('catalogues-grid');
  const emptyState = document.getElementById('empty-state');
  
  loadingContainer.style.display = 'none';
  
  if (catalogues.length === 0) {
    cataloguesContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  cataloguesContainer.style.display = 'grid';
  emptyState.style.display = 'none';
  
  cataloguesContainer.innerHTML = catalogues.map(catalogue => {
    const imageCount = catalogue.images ? catalogue.images.length : 0;
    const views = catalogue.views || 0;
    const totalClicks = catalogue.images ? 
      catalogue.images.reduce((sum, img) => sum + (img.clicks || 0), 0) : 0;
    
    const mostViewed = catalogue.images && catalogue.images.length > 0 ? 
      catalogue.images.reduce((max, img) => (img.clicks || 0) > (max.clicks || 0) ? img : max) : null;
    
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="stats-card p-4">
          <h3 class="text-lg font-semibold mb-2">${catalogue.title}</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="opacity-80">Total Views</p>
              <p class="text-xl font-bold">${formatNumber(views)}</p>
            </div>
            <div>
              <p class="opacity-80">Total Images</p>
              <p class="text-xl font-bold">${imageCount}</p>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="text-sm text-gray-600 mb-4">
            <p><strong>Total Clicks:</strong> ${formatNumber(totalClicks)}</p>
            ${mostViewed ? `<p><strong>Most Viewed:</strong> ${mostViewed.title} (${formatNumber(mostViewed.clicks || 0)} clicks)</p>` : ''}
          </div>
          <div class="flex space-x-2">
            <button onclick="openCatalogueModal('${catalogue.id}')" 
                    class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Manage
            </button>
            <a href="${catalogue.id}.html" target="_blank" 
               class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors text-center">
              Preview
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Open catalogue management modal
async function openCatalogueModal(catalogueId) {
  currentCatalogueId = catalogueId;
  const catalogue = catalogues.find(c => c.id === catalogueId);
  
  if (!catalogue) return;
  
  // Update modal title and stats
  document.getElementById('catalogue-modal-title').textContent = `Manage ${catalogue.title}`;
  
  const imageCount = catalogue.images ? catalogue.images.length : 0;
  const views = catalogue.views || 0;
  const totalClicks = catalogue.images ? 
    catalogue.images.reduce((sum, img) => sum + (img.clicks || 0), 0) : 0;
  
  document.getElementById('catalogue-stats').innerHTML = `
    <div class="flex items-center">
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
      </svg>
      ${formatNumber(views)} views
    </div>
    <div class="flex items-center">
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
      </svg>
      ${imageCount} items
    </div>
    <div class="flex items-center">
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      ${formatNumber(totalClicks)} total clicks
    </div>
  `;
  
  currentProducts = catalogue.images || [];
  renderModalProducts();
  showModal('catalogue-modal');
}

// Render products in modal
function renderModalProducts() {
  const container = document.getElementById('modal-products-grid');
  
  if (currentProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="mt-2 text-sm text-gray-500">No products added yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = currentProducts.map((product, index) => `
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <img src="${product.url}" alt="${product.title}" 
           class="w-full h-32 object-cover">
      <div class="p-3">
        <h4 class="text-sm font-semibold text-gray-900 mb-1 truncate">${product.title}</h4>
        <p class="text-xs text-blue-600 font-medium mb-1">${product.code}</p>
        <p class="text-xs text-gray-600 mb-2 line-clamp-2">${product.description}</p>
        <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>${formatNumber(product.clicks || 0)} clicks</span>
        </div>
        <div class="flex space-x-2">
          <button onclick="editProduct(${index})" 
                  class="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors">
            Edit
          </button>
          <button onclick="deleteProduct(${index})" 
                  class="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Add new product
async function addProduct(formData) {
  try {
    showToast('Uploading image...', 'info');
    
    // Upload image to Cloudinary
    const imageFile = formData.get('image');
    const imageUrl = await uploadToCloudinary(imageFile);
    
    // Create product object
    const product = {
      id: generateId(),
      title: formData.get('title'),
      code: formData.get('code'),
      description: formData.get('description'),
      url: imageUrl,
      clicks: 0
    };
    
    // Add to current products array
    const updatedProducts = [...currentProducts, product];
    
    // Update in Firebase
    await db.ref(`catalogues/${currentCatalogueId}/images`).set(updatedProducts);
    
    showToast('Product added successfully!', 'success');
    hideProductUploadForm();
  } catch (error) {
    console.error('Error adding product:', error);
    showToast('Error adding product. Please try again.', 'error');
  }
}

// Edit product
function editProduct(index) {
  const product = currentProducts[index];
  editingProductIndex = index;
  
  // Populate edit form
  document.getElementById('edit-product-title').value = product.title;
  document.getElementById('edit-product-code').value = product.code;
  document.getElementById('edit-product-description').value = product.description;
  
  showModal('edit-product-modal');
}

// Update product
async function updateProduct(formData) {
  try {
    const updatedProducts = [...currentProducts];
    updatedProducts[editingProductIndex] = {
      ...updatedProducts[editingProductIndex],
      title: formData.get('title'),
      code: formData.get('code'),
      description: formData.get('description'),
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    await db.ref(`catalogues/${currentCatalogueId}/images`).set(updatedProducts);
    
    showToast('Product updated successfully!', 'success');
    hideModal('edit-product-modal');
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Error updating product. Please try again.', 'error');
  }
}

// Delete product
async function deleteProduct(index) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    const updatedProducts = currentProducts.filter((_, i) => i !== index);
    
    await db.ref(`catalogues/${currentCatalogueId}/images`).set(updatedProducts);
    
    showToast('Product deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting product:', error);
    showToast('Error deleting product. Please try again.', 'error');
  }
}

// Create new catalogue
async function createCatalogue(id, title) {
  try {
    await db.ref(`catalogues/${id}`).set({
      title: title,
      images: [],
      views: 0,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    showToast('Catalogue created successfully!', 'success');
    hideModal('create-catalogue-modal');
  } catch (error) {
    console.error('Error creating catalogue:', error);
    showToast('Error creating catalogue. Please try again.', 'error');
  }
}

// Show/hide product upload form
function showProductUploadForm() {
  document.getElementById('product-upload-form').classList.remove('hidden');
}

function hideProductUploadForm() {
  document.getElementById('product-upload-form').classList.add('hidden');
  document.getElementById('upload-form').reset();
}

// Setup event listeners
function setupEventListeners() {
  // Create catalogue modal
  document.getElementById('create-catalogue-btn').addEventListener('click', () => {
    showModal('create-catalogue-modal');
  });
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  document.getElementById('create-first-catalogue-btn').addEventListener('click', () => {
    showModal('create-catalogue-modal');
  });
  
  document.getElementById('close-create-modal').addEventListener('click', () => {
    hideModal('create-catalogue-modal');
  });
  
  document.getElementById('cancel-create').addEventListener('click', () => {
    hideModal('create-catalogue-modal');
  });
  
  // Create catalogue form
  document.getElementById('create-catalogue-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id').toLowerCase().replace(/\s+/g, '-');
    const title = formData.get('title');
    createCatalogue(id, title);
  });
  
  // Catalogue management modal
  document.getElementById('close-catalogue-modal').addEventListener('click', () => {
    hideModal('catalogue-modal');
  });
  
  // Add product button
  document.getElementById('add-product-btn').addEventListener('click', () => {
    showProductUploadForm();
  });
  
  document.getElementById('cancel-upload').addEventListener('click', () => {
    hideProductUploadForm();
  });
  
  // Upload form
  document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', document.getElementById('product-image').files[0]);
    formData.append('title', document.getElementById('product-title').value);
    formData.append('code', document.getElementById('product-code').value);
    formData.append('description', document.getElementById('product-description').value);
    addProduct(formData);
  });
  
  // Edit product modal
  document.getElementById('close-edit-modal').addEventListener('click', () => {
    hideModal('edit-product-modal');
  });
  
  document.getElementById('cancel-edit').addEventListener('click', () => {
    hideModal('edit-product-modal');
  });
  
  // Edit product form
  document.getElementById('edit-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateProduct(formData);
  });
  
  // Modal click outside to close
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
      e.target.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
}

// Export functions for global use
window.openCatalogueModal = openCatalogueModal;
window.editProduct = editProduct;
window.editProductImage = editProductImage;
window.deleteProduct = deleteProduct;