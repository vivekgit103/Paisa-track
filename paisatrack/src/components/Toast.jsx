import React, { useEffect } from 'react';

export default function Toast({ message, emoji, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      {emoji} {message}
    </div>
  );
}
