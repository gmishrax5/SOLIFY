'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import NavBar from '@/components/NavBar';
import { useSolifyProgram, findUserProfilePDA, findTrackPDA } from '@/utils/solana';

export default function AddTrackPage() {
  const { publicKey, connected } = useWallet();
  const [title, setTitle] = useState('');
  const [uri, setUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Get the Solify program
  const program = useSolifyProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !uri.trim() || !publicKey || !program) {
      console.log('Missing requirements to add track:', { 
        title: !!title.trim(), 
        uri: !!uri.trim(),
        publicKey: !!publicKey, 
        program: !!program 
      });
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Adding track with title:', title, 'and URI:', uri);
      
      // Find the user profile PDA
      const [userProfilePda] = await findUserProfilePDA(publicKey);
      console.log('User profile PDA:', userProfilePda.toString());
      
      try {
        // Fetch the user profile to get the track count
        console.log('Fetching user profile...');
        const userProfile = await program.account.userProfile.fetch(userProfilePda);
        console.log('User profile found:', userProfile);
        const trackCount = userProfile.trackCount.toNumber();
        console.log('Current track count:', trackCount);
        
        // Find the track PDA
        const [trackPda] = await findTrackPDA(publicKey, trackCount);
        console.log('Track PDA:', trackPda.toString());
        
        // Call the add_track instruction
        console.log('Calling addTrack instruction...');
        const tx = await program.methods
          .addTrack(uri, title)
          .accounts({
            authority: publicKey,
            userProfile: userProfilePda,
            track: trackPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log('Transaction signature:', tx);
        console.log('Transaction submitted, waiting for confirmation...');
        
        // Wait for confirmation
        const confirmation = await program.provider.connection.confirmTransaction(tx);
        console.log('Transaction confirmed:', confirmation);
        
        // Update state
        console.log('Track added successfully!');
        setIsSuccess(true);
        setTitle('');
        setUri('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } catch (profileError) {
        console.error('Error with user profile:', profileError);
        setError('User profile not found. Please create a profile first.');
      }
    } catch (err) {
      console.error('Error adding track:', err);
      setError('Failed to add track: ' + (err.message || 'Unknown error. See console for details.'));
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
            <h1 className="text-3xl font-bold mb-4">Add Track</h1>
            <p className="mb-8">Please connect your wallet to add a track.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Add a New Track</h1>
        
        {isSuccess && (
          <div className="bg-green-800 text-white p-4 rounded-lg mb-6">
            Track added successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-800 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Track Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter track title"
                maxLength={64}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="uri" className="block text-sm font-medium mb-1">
                Track URI
              </label>
              <input
                type="url"
                id="uri"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/your-track.mp3"
                maxLength={200}
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Link to your audio file (MP3, WAV, etc.) hosted on a service like SoundCloud, IPFS, or any other hosting provider.
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Track'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
