'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import NavBar from '@/components/NavBar';
import { useSolifyProgram, findUserProfilePDA, findPlaylistPDA } from '@/utils/solana';

interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  owner: string;
  pubkey?: string;
}

export default function PlaylistsPage() {
  const { publicKey, connected } = useWallet();
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  // Get the Solify program
  const program = useSolifyProgram();

  // Fetch user's playlists from the blockchain
  useEffect(() => {
    if (connected && publicKey && program) {
      const fetchPlaylists = async () => {
        try {
          setIsLoading(true);
          setError('');
          
          // First, find the user profile PDA
          const [userProfilePda] = await findUserProfilePDA(publicKey);
          
          // Check if user profile exists
          try {
            // Fetch user profile to verify it exists
            await program.account.userProfile.fetch(userProfilePda);
            
            // Get all program accounts of type Playlist
            const playlistAccounts = await program.account.playlist.all([
              {
                memcmp: {
                  offset: 8, // After discriminator
                  bytes: publicKey.toBase58()
                }
              }
            ]);
            
            // Map the accounts to our Playlist interface
            const userPlaylists = playlistAccounts.map(account => ({
              id: account.publicKey.toString(),
              pubkey: account.publicKey.toString(),
              name: account.account.name,
              trackCount: account.account.trackCount.toNumber(),
              owner: account.account.owner.toString()
            }));
            
            setPlaylists(userPlaylists);
          } catch (err) {
            console.log('No user profile found or error fetching playlists:', err);
            setPlaylists([]);
          }
        } catch (err) {
          console.error('Error fetching playlists:', err);
          setError('Failed to load playlists. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPlaylists();
    }
  }, [connected, publicKey, program]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim() || !publicKey || !program) {
      console.log('Missing requirements to create playlist:', { 
        name: !!playlistName.trim(), 
        publicKey: !!publicKey, 
        program: !!program 
      });
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // First, find the user profile PDA
      const [userProfilePda] = await findUserProfilePDA(publicKey);
      
      // Check if user profile exists
      try {
        await program.account.userProfile.fetch(userProfilePda);
      } catch (err) {
        setError('You need to create a profile first');
        setIsLoading(false);
        return;
      }
      
      // Find the playlist PDA
      const [playlistPda] = await findPlaylistPDA(publicKey, playlistName);
      
      console.log('Creating playlist:', playlistName);
      console.log('Playlist PDA:', playlistPda.toString());
      
      // Call the create_playlist instruction
      const tx = await program.methods
        .createPlaylist(playlistName)
        .accounts({
          authority: publicKey,
          userProfile: userProfilePda,
          playlist: playlistPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('Transaction signature:', tx);
      console.log('Waiting for confirmation...');
      
      // Wait for confirmation
      await program.provider.connection.confirmTransaction(tx);
      
      console.log('Playlist created successfully!');
      
      // Add the new playlist to the list
      const newPlaylist = {
        id: playlistPda.toString(),
        pubkey: playlistPda.toString(),
        name: playlistName,
        trackCount: 0,
        owner: publicKey.toString()
      };
      
      setPlaylists([...playlists, newPlaylist]);
      setIsSuccess(true);
      setPlaylistName('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <main>
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Playlists</h1>
            <p className="mb-8">Please connect your wallet to view and create playlists.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>
        
        {isSuccess && (
          <div className="bg-green-800 text-white p-4 rounded-lg mb-6">
            Playlist created successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist}>
                <div className="mb-4">
                  <label htmlFor="playlistName" className="block text-sm font-medium mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="playlistName"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter playlist name"
                    maxLength={32}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Playlist'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full">
              <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading...</p>
                </div>
              ) : playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playlists.map((playlist) => (
                    <div 
                      key={playlist.id}
                      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600"
                      onClick={() => setSelectedPlaylist(playlist)}
                    >
                      <h3 className="font-semibold">{playlist.name}</h3>
                      <p className="text-sm text-gray-300">{playlist.trackCount} tracks</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">You haven't created any playlists yet.</p>
                  <p className="text-gray-400">Create your first playlist to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {selectedPlaylist && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{selectedPlaylist.name}</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedPlaylist(null)}
              >
                Close
              </button>
            </div>
            
            <div className="mt-4">
              {selectedPlaylist.trackCount > 0 ? (
                <div className="space-y-2">
                  {/* Tracks would be listed here */}
                  <p>Tracks will appear here</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">This playlist is empty.</p>
                  <a
                    href="/add-track"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Tracks
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
