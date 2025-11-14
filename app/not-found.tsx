const Error404: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">Page Not Found</p>
            <a href="/" className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                Go Back Home
            </a>
        </div>
    );
};
export default Error404;
