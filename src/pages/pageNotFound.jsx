import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl lg:text-8xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600 text-lg font-[cabin]">
        Page not found
      </p>

      <Link
        to="/"
        className="px-4 py-2 bg-black text-white font-[cabin] rounded-md hover:bg-gray-800"
      >
        Go Home
      </Link>
    </div>
  );
}
