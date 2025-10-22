
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center mb-8 pt-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
                <img src="https://placehold.co/112x112/FF8A00/0F0F0F?text=RS" alt="RemasterShadhi Logo" className="rounded-full w-16 h-16 shadow-lg" />
                <h1 className="text-4xl font-extrabold tracking-tight">
                    <span className="text-white">REMASTER</span>
                    <span className="text-rs-orange italic">Shadhi</span>
                </h1>
            </div>
            <p className="text-sm text-gray-400">AI Multi-Language Lyric Generator</p>
        </header>
    );
};

export default Header;
