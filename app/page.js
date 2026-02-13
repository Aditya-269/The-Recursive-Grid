export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="grid grid-cols-3 gap-4 p-4">
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-semibold text-xl hover:bg-gray-100 transition-colors"
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
