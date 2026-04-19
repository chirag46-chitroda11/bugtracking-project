import React, { useEffect, useState } from 'react';
import { Zap, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-[32px] border border-white shadow-2xl shadow-purple-500/20 p-8 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-[22px] flex items-center justify-center mb-5 shadow-inner">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Zap size={24} className="text-white fill-white/20" />
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 font-semibold leading-relaxed mb-6 text-sm px-2">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-6 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 px-6 rounded-2xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5 transition-all active:scale-95 text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        div { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
