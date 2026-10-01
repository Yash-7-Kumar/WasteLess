import { useState, useEffect, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calculator,
  CheckCircle2,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import api from "../urlServices.js";

const formatDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, hint: "Morning meal" },
  { key: "lunch", label: "Lunch", icon: UtensilsCrossed, hint: "Afternoon meal" },
  { key: "snack", label: "Snack", icon: Cookie, hint: "Evening snacks" },
  { key: "dinner", label: "Dinner", icon: Moon, hint: "Night meal" },
];

export const getMeal = (key) => MEAL_TYPES.find((m) => m.key === key);

const ALL_FIELDS = MEAL_TYPES.map((m) => m.key);

const MEAL_CONFIG = {
  breakfast: { todayEndpoint: "/predict/breakfast/today", predictEndpoint: "/predict/breakfast", fields: ["breakfast"] },
  lunch:     { todayEndpoint: "/predict/lunch/today",     predictEndpoint: "/predict/lunch",     fields: ["lunch"] },
  snack:     { todayEndpoint: "/predict/snack/today",     predictEndpoint: "/predict/snack",     fields: ["snack"] },
  dinner:    { todayEndpoint: "/predict/dinner/today",    predictEndpoint: "/predict/dinner",    fields: ["dinner"] },
};

const countField = z
  .string()
  .trim()
  .min(1, "This field is required")
  .transform((val) => Number(val))
  .pipe(
    z
      .number({ invalid_type_error: "Enter a valid number" })
      .int("Must be a whole number")
      .min(10, "Can't be less than 10")
      .max(12000, "That seems too high"),
  );

const PageShell = ({ children }) => (
  <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4 py-12">
    {children}
  </div>
);

const BackButton = () => (
  <Link
    to="/predict"
    className="mb-2 inline-flex w-fit items-center gap-1 justify-self-start text-sm font-medium text-gray-500 hover:text-gray-900"
  >
    <ArrowLeft className="h-4 w-4" />
    Change meal
  </Link>
);

const FoodLoader = () => (
  <Card className="w-full max-w-lg shadow-md flex items-center justify-center min-h-[350px]">
    <CardContent className="p-0">
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-base font-medium text-gray-500">
          Checking tomorrow's prediction...
        </p>
      </div>
    </CardContent>
  </Card>
);

const MealResultCard = ({ meal, count }) => {
  const Icon = meal.icon;
  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardHeader className="text-center space-y-3">
        <div className="text-left">
          <BackButton />
        </div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Tomorrow's {meal.label} Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-8">
          <Icon className="h-6 w-6 text-emerald-600" />
          <span className="text-sm font-medium text-gray-500">
            {meal.label}
          </span>
          <span className="text-5xl font-bold text-gray-900">{count}</span>
          <span className="text-xs text-gray-500">
            students expected on {formatDate(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

function MealCountForm({
  onSubmit,
  apiError,
  submitLabel = "Predict Tomorrow's Count",
  fields = ALL_FIELDS,
}) {
  const visibleMeals = MEAL_TYPES.filter((m) => fields.includes(m.key));

  const schema = useMemo(
    () => z.object(Object.fromEntries(fields.map((k) => [k, countField]))),
    [fields.join(",")], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: Object.fromEntries(fields.map((k) => [k, ""])),
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          {visibleMeals.map(({ key, label, icon: Icon }) => (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={key}
                    className="flex items-center gap-2 text-base font-medium"
                  >
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {label}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={key}
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 120"
                    className="h-11 text-base"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}

          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            <Calculator className="w-4 h-4" />
            {formState.isSubmitting ? "Predicting..." : submitLabel}
          </Button>
        </FieldGroup>
      </form>

      {apiError && (
        <p className="text-sm text-red-500 mt-4 text-center">{apiError}</p>
      )}
    </>
  );
}

function MealPage({ mealKey, todayEndpoint, predictEndpoint, fields }) {
  const meal = getMeal(mealKey);

  const [prediction, setPrediction] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.get(todayEndpoint);
        if (res.data.exists) setPrediction(res.data);
      } catch (err) {
        console.error("Failed to check tomorrow's prediction", err);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [todayEndpoint]);

  const onSubmit = async (values) => {
    setApiError(null);
    try {
      const res = await api.post(predictEndpoint, values);
      if (res.data.error) return setApiError(res.data.error);
      setPrediction(res.data);
    } catch (err) {
      setApiError(
        err.response?.data?.detail || "Something went wrong. Please try again.",
      );
    }
  };

  if (checking)
    return (
      <PageShell>
        <FoodLoader />
      </PageShell>
    );

  if (prediction)
    return (
      <PageShell>
        <MealResultCard meal={meal} count={prediction[meal.key]} />
      </PageShell>
    );

  return (
    <PageShell>
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <BackButton />
          <CardTitle className="text-2xl font-bold">
            Headcount for {formatDate()}
          </CardTitle>
          <CardDescription>
            Enter today's actual {meal.label.toLowerCase()} count to generate
            tomorrow's forecast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MealCountForm
            onSubmit={onSubmit}
            apiError={apiError}
            fields={fields}
            submitLabel={`Predict ${meal.label} Count`}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

export default function StudentCount() {
  const { meal } = useParams();
  const config = MEAL_CONFIG[meal];

  if (!config) return <Navigate to="/predict" replace />;

  return <MealPage key={meal} mealKey={meal} {...config} />;
}