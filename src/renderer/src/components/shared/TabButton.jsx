import React from 'react'
import { useApp } from '../../context/AppContext'

function TabButton({ children, active, onClick }) {
  const { darkMode } = useApp()
  
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md transition-all
        ${active 
          ? darkMode 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-500 text-white'
          : darkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }
      `}
    >
      {children}
    </button>
  )
}

export default TabButton