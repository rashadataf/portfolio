export const Loader = () => {
    return (
        <div className="fixed inset-0 bg-secondary-color z-50 flex justify-center items-center" aria-label="Content is loading">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-color"></div>
            <span className="sr-only">Loading, please wait...</span>
        </div>
    )
}