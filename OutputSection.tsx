
import React, { forwardRef } from 'react';
import { CopyIcon, ExportIcon } from './Icons';

interface OutputSectionProps {
    lyrics: string;
    onCopy: () => void;
    onExport: () => void;
}

const OutputSection = forwardRef<HTMLElement, OutputSectionProps>(({ lyrics, onCopy, onExport }, ref) => {
    if (!lyrics) {
        return null;
    }

    return (
        <section ref={ref} className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Generated Lyrics</h2>
            <div className="whitespace-pre-wrap p-5 rounded-xl bg-rs-card-bg border border-gray-800 shadow-xl text-rs-text leading-relaxed text-sm">
                {lyrics}
            </div>
            <div className="flex items-center space-x-3 mt-4">
                <button onClick={onCopy} className="py-2 px-4 rounded-lg bg-rs-input-bg text-rs-orange font-semibold hover:bg-rs-input-border transition-colors flex items-center space-x-2">
                    <CopyIcon />
                    <span>Copy Lyrics</span>
                </button>
                 <button onClick={onExport} className="py-2 px-4 rounded-lg bg-rs-input-bg text-rs-orange font-semibold hover:bg-rs-input-border transition-colors flex items-center space-x-2">
                    <ExportIcon />
                    <span>Export as .txt</span>
                </button>
            </div>
        </section>
    );
});

export default OutputSection;
