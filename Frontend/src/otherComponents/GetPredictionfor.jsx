import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Coffee, UtensilsCrossed, Cookie, Moon } from "lucide-react";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, hint: "Morning meal" },
  { key: "lunch", label: "Lunch", icon: UtensilsCrossed, hint: "Afternoon meal" },
  { key: "snack", label: "Snack", icon: Cookie, hint: "Evening snacks" },
  { key: "dinner", label: "Dinner", icon: Moon, hint: "Night meal" },
];

const getMeal = (key) => MEAL_TYPES.find((m) => m.key === key);

export default function MealSelect() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Which meal do you need?
          </CardTitle>
          <CardDescription>
            Select a meal to get today's predicted headcount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            {MEAL_TYPES.map(({ key, label, icon: Icon, hint }) => (
              <Link
                key={key}
                to={`/predict/${key}`}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 transition
                           hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {label}
                </span>
                <span className="flex items-center text-xs text-gray-500">
                  {hint}
                  <ChevronRight className="h-3 w-3 ml-0.5 opacity-0 group-hover:opacity-100 transition" />
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}