// src/otherComponents/Home.jsx
import { ArrowRight, TrendingDown, BarChart3} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom";

function Home() {

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-2xl text-center space-y-6">
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <TrendingDown className="w-4 h-4" />
          Optimize purchasing. Reduce waste.
        </Badge>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          ML-Powered Meal Demand Forecasting for College Messes
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
          Predict daily meal demand with high accuracy to minimize food waste.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/predict"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white")}
          >
            <BarChart3 className="w-4 h-4" />
            Get Prediction
          </Link>

          <a
            href="https://github.com/Yash-7-Kumar/WasteLess"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto gap-2 border-2" }))}
          >
            View on GitHub
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;