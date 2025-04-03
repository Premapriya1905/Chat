import React, { useState } from 'react';
import UsernameForm from './components/UsernameForm';
import Chat from './components/Chat';

function Data() {
  const [username, setUsername] = useState('');

  return (
    <div className="Data">
      {!username ? (
        <UsernameForm setUsername={setUsername} />
      ) : (
        <Chat username={username} />
      )}
    </div>
  );
}

export default Data;