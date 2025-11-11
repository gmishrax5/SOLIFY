# 🎵 SOLIFY : Decentralized Music Platform on Solana

![Solify Banner](https://i.imgur.com/placeholder.png)

## 🚀 Project Overview

**Solify** is a revolutionary decentralized music platform built on the Solana blockchain that empowers artists and listeners to connect directly without intermediaries. Think of it as a decentralized Spotify where artists own their content, listeners discover new music, and everyone participates in a transparent ecosystem.

### ✨ Key Features

- **🎧 Share Music**: Upload and share your tracks with the world
- **👤 User Profiles**: Create your unique artist or listener profile
- **📝 Track Management**: Add, manage, and share your music catalog
- **📋 Playlists**: Create and share curated playlists with the community
- **❤️ Like System**: Show appreciation for tracks you enjoy
- **⚡ Lightning Fast**: Built on Solana for near-instant transactions and minimal fees

## 🔍 How Solify Works

Solify leverages the power of Solana's high-performance blockchain to create a seamless music sharing experience:

1. **Create a Profile**: Connect your Solana wallet and create your unique username
2. **Share Your Music**: Add tracks with title and URI (linking to your hosted audio)
3. **Discover**: Browse tracks from other artists in the ecosystem
4. **Curate**: Create playlists to organize your favorite tracks
5. **Engage**: Like tracks to show appreciation and help others discover great music

## 🏗️ Architecture

Solify is built with a modern tech stack:

- **Backend**: Solana blockchain with Anchor framework
- **Frontend**: Next.js, React, TypeScript, and TailwindCSS
- **Wallet Integration**: Solana Wallet Adapter supporting Phantom, Solflare, and more

### Smart Contract Design

The platform uses Program Derived Addresses (PDAs) to efficiently store and retrieve data:

- **User Profiles**: Store user information and track counts
- **Tracks**: Store track metadata including URI, title, and like count
- **Playlists**: Manage collections of tracks
- **Playlist Items**: Link tracks to playlists
- **Likes**: Track user appreciation

## 📁 Repository Structure

- **`/anchor_project/solify/`**: Solana program code written with Anchor framework
- **`/frontend/solify-ui/`**: Next.js frontend application
- **`/PROJECT_DESCRIPTION.md`**: Detailed project description and implementation details
- **`/DEPLOYMENT_GUIDE.md`**: Instructions for deploying the application

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Rust and Cargo (for Anchor development)
- Solana CLI tools
- A Solana wallet (Phantom, Solflare, etc.)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solify.git
   cd solify
   ```

2. Set up the Anchor project:
   ```bash
   cd anchor_project/solify
   npm install
   ```

3. Set up the frontend:
   ```bash
   cd frontend/solify-ui
   npm install
   npm run dev
   ```

## 🌐 Deployment

See the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🧪 Testing

The Anchor program includes comprehensive tests for all instructions:

```bash
cd anchor_project/solify
anchor test
```

## 📜 License

This project is licensed under the MIT License.

---

## Original Assignment Details

### Task details
This task consists of two parts:
1. **Core of your dApp**
    - A deployed Solana program.
2. **Frontend**
    - A simple frontend to interact with the dApp.

### Requirements
- An Anchor program deployed on **Devnet** or **Mainnet**.
- The Anchor program must use a PDA (Program Derived Address).
- At least one TypeScript **test** for each Anchor program instruction. These tests should cover both **happy** and **unhappy** (intentional error-triggering) scenarios.
- A simple **frontend** deployed using your preferred provider.
- A filled out **PROJECT_DESCRIPTION.md** file.

---

Built with ❤️ for the School of Solana
