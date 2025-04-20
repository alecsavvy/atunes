# aTunes - iTunes-Style Audius Client

https://atunes.me

aTunes is a modern web application that provides an iTunes-like interface for the Audius music streaming platform. It combines the familiar iTunes aesthetic with the decentralized music streaming capabilities of Audius.

## Features

- 🎵 **iTunes-Style Interface**: Classic brushed metal design with familiar controls and layout
- 🎧 **Music Streaming**: Stream music directly from Audius
- 🔍 **Music Discovery**: Browse trending, underground, and feeling lucky tracks
- 📚 **Library Management**: Access your favorites, uploads, and playlists
- 🎨 **Dark Mode**: Toggle between light and dark themes
- 🔄 **Queue Management**: Add tracks to queue, reorder, and manage playback
- 🎮 **Playback Controls**: Play/pause, next/previous, volume control, and scrubbing
- 🔀 **Playback Modes**: Loop and shuffle functionality
- 👤 **User Authentication**: Login with Audius account
- 📱 **Responsive Design**: Works across different screen sizes

## Technical Stack

- **Frontend**: React with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Audio Player**: react-h5-audio-player
- **API Integration**: Audius SDK

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

- `src/App.tsx`: Main application component
- `src/store.ts`: Global state management
- `src/sdk.ts`: Audius API integration
- `src/components/`: Reusable UI components
- `src/assets/`: Static assets

## Features in Detail

### Music Discovery

- Browse trending tracks
- Explore underground music
- Get random recommendations with "Feeling Lucky"
- View best new releases

### Library Management

- Access your favorite tracks
- View your uploads
- Manage playlists
- Track your recently played songs

### Playback Features

- Queue management with drag-and-drop reordering
- Loop and shuffle modes
- Volume control
- Track scrubbing
- Play/pause and skip controls

### User Experience

- Dark/light theme toggle
- Responsive design
- Context menu for track actions
- Track information display
- Album artwork support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
