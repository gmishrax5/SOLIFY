'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import NavBar from '@/components/NavBar';
import { useSolifyProgram, findUserProfilePDA } from '@/utils/solana';

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const [username, setUsername] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTracks, setUserTracks] = useState([]);

  // Import the Solify program hook
  const program = useSolifyProgram();

  // Fetch the user profile from the blockchain
  useEffect(() => {
    if (connected && publicKey && program) {
      console.log('Attempting to fetch user profile...');
      const fetchUserProfile = async () => {
        try {
          setIsLoading(true);
          // Find the user profile PDA
          const [userProfilePda] = await findUserProfilePDA(publicKey);
          console.log('User profile PDA:', userProfilePda.toString());
          
          try {
            // Fetch the user profile account
            console.log('Fetching user profile...');
            const userProfile = await program.account.userProfile.fetch(userProfilePda);
            console.log('User profile found:', userProfile);
            
            // Update state with user data
            setUsername(userProfile.username);
            setIsInitialized(true);
          } catch (fetchError) {
            console.log('User profile not found, user needs to create one:', fetchError.message);
            setIsInitialized(false);
          }
        } catch (error) {
          console.error('Error in profile fetch process:', error);
          setIsInitialized(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    } else {
      console.log('Missing requirements to fetch profile:', { 
        connected, 
        publicKey: publicKey?.toString(), 
        programAvailable: !!program 
      });
    }
  }, [connected, publicKey, program]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !publicKey || !program) {
      console.log('Missing requirements to create profile:', { 
        username: !!username.trim(), 
        publicKey: !!publicKey, 
        program: !!program 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating user profile with username:', username);
      
      // Find the user profile PDA
      const [userProfilePda] = await findUserProfilePDA(publicKey);
      console.log('User profile PDA:', userProfilePda.toString());
      
      // Call the init_user_profile instruction
      console.log('Calling initUserProfile instruction...');
      const tx = await program.methods
        .initUserProfile(username)
        .accounts({
          authority: publicKey,
          userProfile: userProfilePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('Transaction signature:', tx);
      console.log('Transaction submitted, waiting for confirmation...');
      
      // Wait for confirmation
      const confirmation = await program.provider.connection.confirmTransaction(tx);
      console.log('Transaction confirmed:', confirmation);
      
      // Update state
      console.log('Profile created successfully!');
      setIsInitialized(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      setIsLoading(false);
      alert('Failed to create profile: ' + (error.message || 'Unknown error. See console for details.'));
    }
  };

  if (!connected) {
    return (
      <main>
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            <p className="mb-8">Please connect your wallet to view your profile.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        ) : isInitialized ? (
          <div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl font-semibold mb-2">Welcome, {username}</h2>
              <p className="text-gray-300 mb-4">Wallet: {publicKey?.toString()}</p>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Your Tracks</h2>
              {userTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Track items would go here */}
                  <p>Your tracks will appear here</p>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-800 rounded-lg">
                  <p className="mb-4">You haven't added any tracks yet.</p>
                  <a
                    href="/add-track"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Your First Track
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create Your Profile</h2>
            <form onSubmit={handleCreateProfile}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter a username"
                  maxLength={32}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
