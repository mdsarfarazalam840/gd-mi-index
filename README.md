# Google Drive Index

A modern, feature-rich Google Drive index application built with Next.js 15, TypeScript, and Tailwind CSS. Browse, search, preview, and download files from Google Drive with a beautiful, responsive interface.

![GD-Index](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

## ✨ Features

### 🗂️ File Management
- **Browse Folders**: Navigate through your Google Drive folder structure with breadcrumb navigation
- **Multiple View Modes**: Switch between Grid, List, and Details views
- **Smart Search**: Real-time search across all your files and folders
- **Advanced Filtering**: Filter by file type (images, videos, documents, etc.)
- **Flexible Sorting**: Sort by name, size, or date (ascending/descending)

### 🖼️ Media Viewing
- **Image Viewer**: Full-screen lightbox with zoom, pan, and gallery navigation
- **Video Player**: Custom video player with playback controls, volume, and fullscreen
- **Smooth Streaming**: No buffering issues with optimized video delivery
- **Keyboard Shortcuts**: Navigate efficiently with keyboard controls

### ⬇️ Downloads
- **Direct Downloads**: Download any file with a single click
- **Batch Downloads**: Select multiple files (coming soon)
- **Download Progress**: Track download status (coming soon)

### 🎨 User Experience
- **Dark/Light Mode**: Beautiful themes for day and night
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions and micro-interactions
- **Glassmorphism UI**: Modern, premium design aesthetic

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Custom CSS variables
- **State Management**: Zustand
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: Vercel (zero-config)
- **Video Player**: Native HTML5 video
- **Image Viewer**: Custom lightbox implementation

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm 9+
- Google Cloud Project with Drive API enabled (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gd-index
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Google Drive API Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API

### Step 2: Configure OAuth Consent Screen

1. Navigate to "OAuth consent screen"
2. Select "External" user type
3. Fill in the required information
4. Add the following scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

### Step 3: Create OAuth 2.0 Credentials

1. Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
2. Select "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback` (development)
   - `https://your-domain.vercel.app/api/auth/callback` (production)
4. Save your Client ID and Client Secret

### Step 4: Update Environment Variables

Add your credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 🌐 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/gd-index)

### Manual Deployment

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure project settings (default settings work fine)

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Set for Production, Preview, and Development environments

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables for Vercel

Required environment variables:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_generated_secret
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 📁 Project Structure

```
gd-index/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── files/        # List files endpoint
│   │   │   ├── search/       # Search endpoint
│   │   │   ├── download/     # Download endpoint
│   │   │   └── stream/       # Video streaming endpoint
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main application page
│   ├── components/           # React components
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── ViewToggle.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── FileCard.tsx
│   │   ├── FileGrid.tsx
│   │   ├── FileList.tsx
│   │   ├── ImageViewer.tsx
│   │   └── VideoPlayer.tsx
│   ├── lib/
│   │   ├── google-drive.ts   # Google Drive API client
│   │   └── utils.ts          # Utility functions
│   ├── store/                # Zustand stores
│   │   ├── useFileStore.ts
│   │   └── useUIStore.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Helper functions
│       ├── constants.ts
│       └── fileHelpers.ts
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel deployment config
└── package.json              # Dependencies
```

## 🎯 Usage

### Navigation
- Click on folders to navigate into them
- Use breadcrumbs to navigate back to parent folders
- Click "Home" icon to return to root

### Search
- Type in the search bar to filter files in real-time
- Search works across file names

### Filtering & Sorting
- Click "Filters" button to open filter panel
- Select file type to filter (images, videos, documents, etc.)
- Choose sorting options (name, size, date)

### Viewing Media
- **Images**: Click on any image to open the lightbox viewer
  - Use arrow keys or navigation buttons to browse
  - Zoom in/out with zoom controls
  - Download from the viewer
- **Videos**: Click on any video to open the player
  - Full playback controls
  - Volume control
  - Fullscreen mode
  - Download option

### Downloading
- Click the download button on any file
- Files will download directly to your device

### Keyboard Shortcuts

#### Image Viewer
- `Esc`: Close viewer
- `←`: Previous image
- `→`: Next image

#### Video Player
- `Space` or `K`: Play/Pause
- `M`: Mute/Unmute
- `F`: Fullscreen
- `Esc`: Close player (when not in fullscreen)

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
theme: {
  extend: {
    colors: {
      primary: 'your-color',
      // ... other colors
    }
  }
}
```

### Modifying File Type Icons

Edit `src/utils/constants.ts` to change file type icons and categories.

## 🐛 Troubleshooting

### Application not loading
- Check if all environment variables are set correctly
- Verify Google Drive API is enabled
- Check browser console for errors

### Authentication issues
- Verify OAuth redirect URIs match exactly
- Check if Google Cloud Project has correct scopes
- Ensure credentials are valid

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

## 📝 Development Notes

### Current Implementation
- Uses mock data for initial development and testing
- Ready for Google Drive API integration
- All UI components are fully functional

### Production Considerations
- Replace mock Google Drive client with real API implementation
- Add authentication flow
- Implement proper error handling
- Add rate limiting
- Set up caching strategy (Redis recommended)
- Implement pagination for large directories

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for seamless deployment
- Radix UI for accessible components
- Unsplash for sample images

---

**Made with ❤️ using Next.js and TypeScript**
