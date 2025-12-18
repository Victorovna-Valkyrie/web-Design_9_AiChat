import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800 mb-16">
          AI 脑筋急转弯
        </h1>
        <button
          onClick={handleStartGame}
          className="px-16 py-6 text-2xl font-medium text-slate-700 bg-white border-4 border-slate-700 rounded-3xl hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          开始游戏
        </button>
      </div>
    </div>
  );
}

export default HomePage;
