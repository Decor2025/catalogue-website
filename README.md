# Virtual Product Catalogue

A fully interactive virtual product catalogue site with Firebase backend, Cloudinary image management, and comprehensive admin panel.

## Features

- **Multi-catalogue System**: Dynamic routing for different product categories (/pvc, /wooden, etc.)
- **Real-time Updates**: Firebase Firestore with snapshot listeners for live updates
- **Image Management**: Direct browser upload to Cloudinary with unsigned upload preset
- **Admin Panel**: Rich admin interface with modal-based catalogue management
- **Analytics**: Live view counts, click tracking, and per-catalogue statistics
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Professional UX**: Skeleton loading, toast notifications, and smooth transitions

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Add your admin user in the Users tab
4. Enable Realtime Database:
   - Go to Realtime Database
   - Create database in test mode (or production mode with proper rules)
   - Choose your preferred location
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app"
   - Copy the configuration object
6. Update `js/firebase-config.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

7. Configure Realtime Database Rules (optional, for production):
   - Go to Realtime Database > Rules
   - Update rules as needed for your security requirements

### 2. Cloudinary Setup

1. Sign up for [Cloudinary](https://cloudinary.com/) (free tier available)
2. Go to your Cloudinary Dashboard
3. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set Signing Mode to "Unsigned"
   - Configure folder, transformations, etc. as needed
   - Save the preset
4. Update `js/firebase-config.js` with your Cloudinary config:

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Found in your dashboard
  uploadPreset: 'your-upload-preset' // The preset you just created
};
```

### 3. Netlify Deployment

1. The `netlify.toml` file is included for proper configuration
2. Deploy to Netlify:
   - Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your GitHub repository for continuous deployment
3. The configuration handles dynamic routing for `/catalogue/:id` URLs

## File Structure

```
├── index.html              # Main landing page
├── catalogue.html         # Dynamic catalogue page
├── admin.html             # Admin panel
├── netlify.toml          # Netlify configuration
├── styles/
│   └── main.css          # Custom styles and animations
├── js/
│   ├── firebase-config.js # Firebase and Cloudinary configuration
│   ├── utils.js          # Utility functions
│   ├── main.js           # Main page logic
│   ├── dynamic-catalogue.js # Dynamic catalogue page logic
│   └── admin.js          # Admin panel logic
└── README.md             # This file
```

## Usage

### Admin Panel

1. Visit `/admin.html` to access the admin panel
2. Sign in with your Firebase Authentication credentials
3. Create new catalogues using the "Create Catalogue" button
4. Manage existing catalogues by clicking "Manage" on catalogue cards
5. Add products by uploading images and entering metadata
6. Monitor analytics including views, clicks, and most popular items

### Dynamic Catalogue System

Catalogues are now completely dynamic:
- URLs follow the pattern `/catalogue/:id` (e.g., `/catalogue/pvc`, `/catalogue/wooden`)
- Navigation is automatically generated from Firebase data
- No need to create separate HTML files for each catalogue
- All catalogues use the same `catalogue.html` template

### Security

- Admin panel is protected by Firebase Authentication
- Admin button is removed from public interface
- Only authenticated users can access admin functions
- Automatic logout and session management
### Realtime Database Data Structure

```
catalogues: {
  pvc: {
    - title: "PVC Products"
    - views: 1234
    - images: {
        0: {
          id: "unique-id",
          title: "Product Title",
          code: "PROD-001",
          description: "Product description",
          url: "https://res.cloudinary.com/...",
          clicks: 56,
          createdAt: 1640995200000
        },
        1: { ... }
      }
  },
  wooden: {
    - title: "Wooden Products"
    - views: 987
    - images: { ... }
  }
}
```

## Customization

### Styling
- Modify `styles/main.css` for custom styles
- Update Tailwind classes in HTML files for layout changes

### Functionality
- Extend `js/utils.js` for additional utility functions
- Modify admin panel in `js/admin.js` for new features
- Update catalogue logic in `js/catalogue.js` for custom behavior

## Browser Support

- Modern browsers with ES6+ support
- Firefox, Chrome, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- Firebase SDK 9.22.2 (loaded via CDN)
- Tailwind CSS (loaded via CDN)
- No build process required - works with static hosting

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase configuration in `js/firebase-config.js`
- Check Firestore rules if data isn't loading
- Ensure your project ID is correct

### Authentication Issues
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that admin user is created in Firebase Authentication > Users
- Verify authentication configuration in Firebase settings
### Cloudinary Upload Issues  
- Verify your cloud name and upload preset
- Ensure upload preset is set to "Unsigned"
- Check file size limits in your Cloudinary settings

### Real-time Updates Not Working
- Check browser console for JavaScript errors
- Verify Firebase configuration
- Ensure you're not hitting Realtime Database quotas
- Check Realtime Database rules for read/write permissions

## License

This project is open source and available under the [MIT License](LICENSE).