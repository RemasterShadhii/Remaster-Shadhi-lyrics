
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import LyricForm from './components/LyricForm';
import OutputSection from './components/OutputSection';
import MessageBox from './components/MessageBox';
import { generateLyrics, generateImageDescription } from './services/geminiService';
import type { FormData, Message } from './types';

const TEXT_MIMES = ['text/plain', 'text/markdown', 'text/csv', 'text/html', 'application/javascript', 'application/json'];
const TEXT_EXTS = ['.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.md', '.txt', '.csv', '.json'];

const isTextFile = (file: File): boolean => {
    if (TEXT_MIMES.includes(file.type)) return true;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return TEXT_EXTS.includes(extension);
}


const App: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        theme: "A vibrant celebration of a traditional Indian festival with modern beats",
        language: "English",
        genre: "",
        mood: "",
        audience: "",
        rhyme: "",
        artistStyle: "",
        additionalNotes: "",
    });
    const [lyrics, setLyrics] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<Message | null>(null);
    const outputSectionRef = useRef<HTMLElement>(null);
    
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null); // dataURL for images, text content for text files
    const [isFileLoading, setIsFileLoading] = useState<boolean>(false);


    const handleFileChange = useCallback(async (file: File | null) => {
        if (!file) {
            setUploadedFile(null);
            setFilePreview(null);
            return;
        }

        setUploadedFile(file);
        setFilePreview(null);
        setLyrics('');
        
        if (file.type.startsWith('image/')) {
            setIsFileLoading(true);
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result as string);
            reader.readAsDataURL(file);

            try {
                const description = await generateImageDescription(file);
                setFormData(prev => ({ ...prev, theme: description }));
            } catch (error: unknown) {
                 const errorMessage = error instanceof Error ? error.message : "Could not describe the image.";
                 setMessage({ title: "Image Analysis Error", content: errorMessage });
            } finally {
                setIsFileLoading(false);
            }
        } else if (isTextFile(file)) {
            const content = await file.text();
            setFilePreview(content);
            setFormData(prev => ({ ...prev, theme: content }));
        } else {
            // Generic file, no preview content
            setFilePreview('generic');
        }

    }, []);

    const handleRemoveFile = useCallback(() => {
        setUploadedFile(null);
        setFilePreview(null);
    }, []);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLyrics('');
        setMessage(null);
        try {
            const result = await generateLyrics(formData);
            setLyrics(result);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessage({ title: "API Error", content: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = useCallback(() => {
        if (!lyrics) return;
        navigator.clipboard.writeText(lyrics).then(() => {
            setMessage({ title: "Copied!", content: "Lyrics successfully copied to your clipboard." });
        }).catch(() => {
            setMessage({ title: "Copy Error", content: "Could not copy text. Please select it manually." });
        });
    }, [lyrics]);

    const handleExport = useCallback(() => {
        if (!lyrics) return;

        const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'remastershadhi-lyrics.txt';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);

        setMessage({ title: "Exported!", content: "Your lyrics have been downloaded as a .txt file." });
    }, [lyrics]);

    const closeMessage = useCallback(() => {
        setMessage(null);
    }, []);

    useEffect(() => {
        if (lyrics && outputSectionRef.current) {
            outputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [lyrics]);

    return (
        <div className="max-w-lg mx-auto p-4 md:p-6">
            <Header />
            <main className="bg-rs-card-bg p-6 rounded-xl shadow-2xl border border-gray-800">
                <LyricForm
                    formData={formData}
                    onFormChange={handleFormChange}
                    onSubmit={handleSubmit}
                    isLoading={isLoading || isFileLoading}
                    uploadedFile={uploadedFile}
                    filePreview={filePreview}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveFile}
                    isFileLoading={isFileLoading}
                />
            </main>
            <OutputSection ref={outputSectionRef} lyrics={lyrics} onCopy={handleCopy} onExport={handleExport} />
            {message && <MessageBox message={message} onClose={closeMessage} />}
        </div>
    );
};

export default App;
