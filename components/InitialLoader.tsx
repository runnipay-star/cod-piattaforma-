import React from 'react';

interface InitialLoaderProps {
    message: string;
}

const InitialLoader: React.FC<InitialLoaderProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
            <div className="w-12 h-12 border-4 border-indigo-600 border-b-transparent rounded-full inline-block box-border animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">{message}</p>
        </div>
    );
};

export default InitialLoader;
