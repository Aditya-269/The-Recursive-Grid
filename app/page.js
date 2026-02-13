export default function Home() {
  const getCellStyle = (value) => {
    // Locked: value >= 15
    if (value >= 15) {
      return {
        backgroundColor: '#ff0000',
        color: '#ffffff'
      };
    }
    // Even numbers
    if (value % 2 === 0) {
      return {
        backgroundColor: '#e0e0e0',
        color: '#000000'
      };
    }
    // Odd numbers
    return {
      backgroundColor: '#1a237e',
      color: '#ffffff'
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="grid grid-cols-3 gap-4 p-4">
        {[...Array(9)].map((_, index) => {
          const value = index + 1;
          const cellStyle = getCellStyle(value);

          return (
            <div
              key={index}
              className="w-24 h-24 flex items-center justify-center font-semibold text-xl"
              style={{
                ...cellStyle,
                borderRadius: '4px',
                boxShadow: '2px 2px 0px black'
              }}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}
