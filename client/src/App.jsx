import { useState } from 'react'
import './App.css'
import Chat from '../src/components/Chat'
import UsernameForm from './components/UsernameForm'

function App() {

  const [username, setUsername] = useState('');

  return (
    <div className="App">
      {!username ? (
        <UsernameForm setUsername={setUsername} /> 
      ) : (
        <Chat username={username} />
      )}
    </div>
  );
}


export default App
