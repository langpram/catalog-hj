
import React from 'react';

interface SyncModalProps {
  isOpen: boolean;
  progress: number;
  message: string;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, progress, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all scale-100 border border-white/20">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <span className="text-4xl animate-spin inline-block">⟳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Syncing Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
