// Utility functions for the product catalogue

// Show toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  toast.className = `toast ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

// Show loading skeleton
function showSkeleton(containerId, count = 8) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'animate-pulse';
    skeleton.innerHTML = `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="h-48 bg-gray-200 skeleton"></div>
        <div class="p-4">
          <div class="h-4 bg-gray-200 skeleton rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 skeleton rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-200 skeleton rounded w-full"></div>
        </div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Upload image to Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Modal utilities
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('hidden');
  modal.classList.add('modal');
  document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('hidden');
  modal.classList.remove('modal');
  document.body.style.overflow = 'auto';
}

// Image lazy loading
function setupLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('loading-shimmer');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Local storage utilities
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// Export functions for global use
window.showToast = showToast;
window.showSkeleton = showSkeleton;
window.formatNumber = formatNumber;
window.uploadToCloudinary = uploadToCloudinary;
window.generateId = generateId;
window.debounce = debounce;
window.showModal = showModal;
window.hideModal = hideModal;
window.setupLazyLoading = setupLazyLoading;
window.saveToStorage = saveToStorage;
window.getFromStorage = getFromStorage;