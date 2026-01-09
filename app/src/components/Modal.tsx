import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            aria-labelledby="modal-dialog"
            slotProps={{
                backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } },
                paper: { sx: { p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: 24 } },
            }}
        >
            <DialogContent>
                <div style={{ position: "relative" }}>
                    <IconButton
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

