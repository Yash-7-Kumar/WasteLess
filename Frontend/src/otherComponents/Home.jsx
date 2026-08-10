import { ArrowRight, BarChart3, TrendingDown } from 'lucide-react';

function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-2xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
          <TrendingDown className="w-4 h-4" />
          <span>Optimize purchasing. Reduce waste.</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-balance">
          Smarter forecasting for your mess hall.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
          Predict daily meal demand with high accuracy to minimize food waste, cut operational costs, and serve your students better.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">

          <a
            href=""
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all"
          >
            Learn more
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;