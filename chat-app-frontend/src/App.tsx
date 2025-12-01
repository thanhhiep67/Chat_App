import * as React from 'react';
import Chat from './components/Chat';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import './App.css';

const App: React.FC = () => {
  const [userName, setUsername] = React.useState<string>("");
  const[isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const handleKeydown = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter' && userName.trim() !== ''){
      setIsLoggedIn(true);
    }
  }
  const handleLogout  = () => {
    setIsLoggedIn (false);
    setUsername("");
  }

  if(!isLoggedIn){
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='p-8 bg-white rounded shadow-md w-full sm:w-96'>
      
        <h1 className='text-3xl font-semibold text-center mb-6 flex items-center justify-center space-x-2'>
          <ChatBubbleLeftRightIcon className='w-8 h-8 text-blue-500'/>
          <span className='text-xl'>Welcome to Chat App</span>
        </h1>

        <input 
          className='w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-300'
          type="text" 
          placeholder="Inter your username" 
          value={userName} 
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeydown}
         />
        <button
          disabled={!userName.trim()}
          onClick={() => setIsLoggedIn(true)}
          className='w-full  bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer disabled:bg-gray-400'
          >
          Vao chat
          </button>
        </div>
      </div>
      
    );
  }

  return <Chat userName={userName} onLogout={handleLogout} />;
}

export default App;


//nhap username => vao cua chat  