import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    fallbackPath?: string;
    label?: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ fallbackPath = '/', label, className = '' }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`flex items-center text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20 ${className}`}
            aria-label="Go back"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {label && <span className="ml-2 font-medium">{label}</span>}
        </button>
    );
};

export default BackButton;
