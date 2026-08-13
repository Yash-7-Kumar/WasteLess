// src/otherComponents/StudentCount.jsx
import { useState, useEffect } from "react";
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
  Loader2
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

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { key: "snack", label: "Snack", icon: Cookie },
  { key: "dinner", label: "Dinner", icon: Moon },
];

const formSchema = z.object({
  breakfast: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high"),
  lunch: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high"),
  snack: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high"),
  dinner: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high"),
});

const FoodLoader = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
    <p className="text-base font-medium text-gray-500">
      Checking today's prediction...
    </p>
  </div>
);

export default function StudentCount() {
  const [predictions, setPredictions] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { breakfast: "", lunch: "", snack: "", dinner: "" },
  });

  useEffect(() => {
    const checkTodaysPrediction = async () => {
      try {
        const res = await api.get("/predict/today");
        if (res.data.exists) setPredictions(res.data);
      } catch (err) {
        console.error("Failed to check today's prediction", err);
      } finally {
        setCheckingExisting(false);
      }
    };
    checkTodaysPrediction();
  }, []);

  const onSubmit = async (values) => {
    setApiError(null);
    try {
      const res = await api.post("/predict", values);
      if (res.data.error) {
        setApiError(res.data.error);
        return;
      }
      setPredictions(res.data);
    } catch (err) {
      setApiError(
        err.response?.data?.detail || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4 py-12">
      {checkingExisting ? (
        <Card className="w-full max-w-lg shadow-md flex items-center justify-center min-h-[350px]">
          <CardContent className="p-0">
            <FoodLoader />
          </CardContent>
        </Card>
      ) : predictions ? (
        <Card className="w-full max-w-lg shadow-md">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Today's Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
              {MEAL_TYPES.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6"
                >
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-500">
                    {label}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {predictions[key]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Yesterday's Headcount
            </CardTitle>
            <CardDescription>
              Enter the actual consumption numbers from yesterday to generate
              today's forecast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="gap-5">
                {MEAL_TYPES.map(({ key, label, icon: Icon }) => (
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
                  {formState.isSubmitting
                    ? "Predicting..."
                    : "Predict Today's Count"}
                </Button>
              </FieldGroup>
            </form>

            {apiError && (
              <p className="text-sm text-red-500 mt-4 text-center">
                {apiError}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
