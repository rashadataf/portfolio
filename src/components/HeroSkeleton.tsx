export const HeroSkeleton = () => {
    return (
        <div role="status" className="relative w-full h-screen mx-auto animate-pulse">
            <div className="absolute inset-0 top-[120px] max-w-7xl mx-auto sm:px-16 px-6">
                <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <div className="h-12 mt-4 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};