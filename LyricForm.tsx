import React, { useState, useCallback, useRef } from 'react';
import type { FormData } from '../types';
import { LANGUAGE_OPTIONS, GENRE_OPTIONS, MOOD_OPTIONS, AUDIENCE_OPTIONS, RHYME_OPTIONS } from '../constants';
import { SettingsIcon, ChevronDownIcon, MusicIcon, LoadingSpinnerIcon, UploadIcon, FileIcon, CloseIcon } from './Icons';

interface LyricFormProps {
    formData: FormData;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    uploadedFile: File | null;
    filePreview: string | null;
    onFileChange: (file: File) => void;
    onRemoveFile: () => void;
    isFileLoading: boolean;
}

const FileUpload: React.FC<{ onFileChange: (file: File) => void, isLoading: boolean }> = ({ onFileChange, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            onFileChange(files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-rs-text">Inspiration (Optional)</label>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-32 p-4 text-center bg-rs-input-bg border-2 border-dashed rounded-lg cursor-pointer border-rs-input-border hover:border-rs-orange transition-colors ${isDragging ? 'border-rs-orange' : ''} ${isLoading ? 'cursor-wait' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={isLoading}
                />
                <UploadIcon />
                <p className="text-sm text-gray-400 mt-2">
                    <span className="font-semibold text-rs-orange">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Image or Text file</p>
            </div>
        </div>
    );
};

const FilePreview: React.FC<{ file: File; previewData: string | null; onRemove: () => void; }> = ({ file, previewData, onRemove }) => {
    const renderPreview = () => {
        if (file.type.startsWith('image/')) {
            return <img src={previewData || ''} alt={file.name} className="max-h-32 rounded-md object-cover" />;
        }
        if (previewData && previewData !== 'generic') {
            return (
                <pre className="w-full max-h-32 p-2 overflow-y-auto text-xs bg-rs-dark-bg rounded-md font-mono whitespace-pre-wrap">
                    <code>{previewData}</code>
                </pre>
            );
        }
        return (
            <div className="flex items-center space-x-3 p-2">
                <FileIcon />
                <span className="text-sm text-gray-300 truncate">{file.name}</span>
            </div>
        );
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-rs-text">Inspiration File</label>
            <div className="relative p-3 rounded-lg bg-rs-input-bg border border-rs-input-border">
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rs-dark-bg/50 hover:bg-rs-dark-bg transition-colors"
                    aria-label="Remove file"
                >
                    <CloseIcon />
                </button>
                {renderPreview()}
            </div>
        </div>
    );
};


const LyricForm: React.FC<LyricFormProps> = ({ formData, onFormChange, onSubmit, isLoading, uploadedFile, filePreview, onFileChange, onRemoveFile, isFileLoading }) => {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    return (
        <form onSubmit={onSubmit}>
            <div className="relative">
                {isFileLoading && (
                    <div className="absolute inset-0 bg-rs-card-bg/80 flex flex-col items-center justify-center z-10 rounded-xl">
                        <LoadingSpinnerIcon />
                        <p className="text-sm text-gray-400 mt-2">Analyzing inspiration...</p>
                    </div>
                )}
                {!uploadedFile ? (
                    <FileUpload onFileChange={onFileChange} isLoading={isLoading} />
                ) : (
                    <FilePreview file={uploadedFile} previewData={filePreview} onRemove={onRemoveFile} />
                )}
            </div>

            <div className="mb-6">
                <label htmlFor="theme" className="block text-sm font-semibold mb-2 text-rs-text">Theme / Story / Emotion (Required)</label>
                <textarea id="theme" name="theme" rows={4} required value={formData.theme} onChange={onFormChange} disabled={isFileLoading}
                    className="w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange placeholder-gray-500 text-rs-text transition-colors disabled:opacity-70"
                    placeholder="E.g., A vibrant celebration of a traditional Indian festival with modern beats." />
            </div>

            <div className="mb-6">
                <label htmlFor="language" className="block text-sm font-semibold mb-2 text-rs-text">Target Language</label>
                <div className="relative">
                    <select id="language" name="language" required value={formData.language} onChange={onFormChange} className="custom-select w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange text-rs-text transition-colors">
                        {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-8 border-t border-gray-700 pt-4">
                <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex justify-between items-center w-full text-left py-2 font-bold text-rs-orange hover:text-white transition-colors">
                    <span className="flex items-center">
                        <SettingsIcon />
                        Advanced Options (Optional)
                    </span>
                    <span className={`transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon />
                    </span>
                </button>

                {isAdvancedOpen && (
                    <div className="space-y-4 mt-3">
                        {/* Genre, Mood, Audience, Rhyme, Artist Style, Additional Notes */}
                        {/* Genre */}
                        <div>
                            <label htmlFor="genre" className="block text-sm font-semibold mb-2 text-rs-text">Genre</label>
                            <div className="relative">
                                <select id="genre" name="genre" value={formData.genre} onChange={onFormChange} className="custom-select w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange text-rs-text">
                                    {GENRE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Mood */}
                        <div>
                            <label htmlFor="mood" className="block text-sm font-semibold mb-2 text-rs-text">Mood / Tone</label>
                            <div className="relative">
                                <select id="mood" name="mood" value={formData.mood} onChange={onFormChange} className="custom-select w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange text-rs-text">
                                     {MOOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Audience */}
                        <div>
                            <label htmlFor="audience" className="block text-sm font-semibold mb-2 text-rs-text">Target Audience</label>
                            <div className="relative">
                                <select id="audience" name="audience" value={formData.audience} onChange={onFormChange} className="custom-select w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange text-rs-text">
                                     {AUDIENCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Rhyme */}
                         <div>
                            <label htmlFor="rhyme" className="block text-sm font-semibold mb-2 text-rs-text">Overall Rhyme Scheme / Style</label>
                            <div className="relative">
                                <select id="rhyme" name="rhyme" value={formData.rhyme} onChange={onFormChange} className="custom-select w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange text-rs-text">
                                     {RHYME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Artist Style */}
                        <div>
                            <label htmlFor="artistStyle" className="block text-sm font-semibold mb-2 text-rs-text">Artist Style (e.g., A.R. Rahman, Drake, Taylor Swift)</label>
                            <input type="text" id="artistStyle" name="artistStyle" value={formData.artistStyle} onChange={onFormChange}
                                className="w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange placeholder-gray-500 text-rs-text transition-colors"
                                placeholder="E.g., Inspired by the poetic flow of Gulzar..."/>
                        </div>
                        {/* Additional Notes */}
                        <div>
                            <label htmlFor="additionalNotes" className="block text-sm font-semibold mb-2 text-rs-text">Additional Notes / Instructions</label>
                            <textarea id="additionalNotes" name="additionalNotes" rows={2} value={formData.additionalNotes} onChange={onFormChange}
                                className="w-full p-3 rounded-lg bg-rs-input-bg border border-rs-input-border focus:border-rs-orange focus:ring-1 focus:ring-rs-orange placeholder-gray-500 text-rs-text transition-colors"
                                placeholder="E.g., Keep the chorus catchy, 8 lines max."/>
                        </div>
                    </div>
                )}
            </div>

            <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-xl bg-rs-orange text-rs-dark-bg font-extrabold text-lg shadow-lg shadow-rs-orange/50 hover:bg-white hover:text-rs-dark-bg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {!isLoading && !isFileLoading && <MusicIcon />}
                <span>{isLoading ? (isFileLoading ? 'Analyzing...' : 'Generating...') : 'Generate Lyrics'}</span>
            </button>

            {isLoading && !isFileLoading && (
                <div className="mt-4 text-center">
                    <LoadingSpinnerIcon />
                    <p className="text-sm text-gray-400 mt-2">Harmonizing the verses...</p>
                </div>
            )}
        </form>
    );
};

export default LyricForm;
