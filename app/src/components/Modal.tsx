interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-main bg-opacity-5 overflow-y-auto h-full w-full z-30" onClick={onClose}>
            <div className="relative top-1/2 -translate-y-1/2 mx-auto p-5 border w-3/4 lg:w-1/2 shadow-lg rounded-md bg-primary text-main" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
