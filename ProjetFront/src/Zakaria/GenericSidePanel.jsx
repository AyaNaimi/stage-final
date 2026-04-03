import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GenericSidePanel = ({ isOpen, onClose, children, defaultWidth = 30, title, footer, displayMode = 'fixed', showHeader = true }) => {
    const [panelWidth, setPanelWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPanelWidth(defaultWidth);
        }
    }, [isOpen, defaultWidth]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX;
        const startWidth = panelWidth;

        const handleMouseMove = (moveEvent) => {
            const screenWidth = window.innerWidth;
            const delta = startX - moveEvent.clientX;
            const newWidth = startWidth + (delta / screenWidth * 100);

            if (newWidth > 15 && newWidth < 85) {
                setPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                width: `${panelWidth}%`,
                position: displayMode === 'inline' ? 'relative' : 'fixed',
                right: displayMode === 'inline' ? 'auto' : 0,
                top: displayMode === 'inline' ? 'auto' : 0,
                bottom: displayMode === 'inline' ? 'auto' : 0,
                backgroundColor: 'white',
                boxShadow: displayMode === 'inline' ? 'none' : '-10px 0 30px rgba(0,0,0,0.1)',
                zIndex: 2000,
                transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #e2e8f0',
                height: '100%',
                flexShrink: 0
            }}
        >
            {/* Resizer Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: '-5px',
                    top: 0,
                    bottom: 0,
                    width: '10px',
                    cursor: 'ew-resize',
                    zIndex: 2001,
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '40px',
                    width: '2px',
                    backgroundColor: isResizing ? '#2c767c' : '#e2e8f0',
                    borderRadius: '1px'
                }} />
            </div>

            {/* Header */}
            {showHeader && (
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <h5 style={{ margin: 0, fontWeight: 700, color: '#4b5563', fontSize: '1.1rem' }}>{title}</h5>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            padding: '5px',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Body */}
            <div
                className="scrollbar-teal"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}
            >
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: 'white'
                }}>
                    {footer}
                </div>
            )}

            <style>
                {`
                .scrollbar-teal::-webkit-scrollbar { width: 5px; }
                .scrollbar-teal::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .scrollbar-teal::-webkit-scrollbar-thumb { background: #3a8a90; border-radius: 10px; }
                `}
            </style>
        </div>
    );
};

export default GenericSidePanel;
