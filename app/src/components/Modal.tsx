interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-secondary bg-opacity-5 overflow-y-auto h-full w-full z-50" onClick={onClose} aria-modal="true" role="dialog">
            <div className="relative top-20 mx-auto p-5 border w-3/4 lg:w-1/2 shadow-lg rounded-md bg-primary text-main" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-secondary hover:text-accent focus:outline-none"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <title>X mark</title>
                        <desc>an icon that indicates to the action of closing the modal</desc>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
};

