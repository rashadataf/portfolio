export default function Loading() {
    return (
        <div className="fixed inset-0 bg-secondary z-50 flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
    );
}