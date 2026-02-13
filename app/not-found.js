import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50 text-gray-900">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-8">Page Not Found</h2>
            <p className="text-lg mb-8 text-center max-w-md text-gray-600">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                id="go-back-home-link"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
                Go back home
            </Link>
        </div>
    );
}
