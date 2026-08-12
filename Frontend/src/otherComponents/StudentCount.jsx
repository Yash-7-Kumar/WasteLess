import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form"
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import api from "@urlServices.js";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snack", label: "Snack" },
  { key: "dinner", label: "Dinner" },
];

const formSchema = z.object({
  breakfast: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high — double check"),
  lunch: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high — double check"),
  snack: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high — double check"),
  dinner: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Can't be negative")
    .max(300, "That seems too high — double check"),
});


function StudentCount() {

    const [predictions, setPredictions] = useState(null);
    const [apiError, setApiError] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { breakfast: "", lunch: "", snack: "", dinner: "" },
    });

    const onSubmit = async (values) => {
        setApiError(null);
        setPredictions(null);
        try {
            const res = await api.post("/predict", values);
            setPredictions(res.data);
        } catch (err) {
            setApiError(err.response?.data?.detail || "Something went wrong. Please try again.");
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-10 shadow-sm">
        <CardHeader>
            <CardTitle className="text-xl font-bold">Yesterday's Headcount</CardTitle>
            <CardDescription>
            Enter the actual consumption numbers from yesterday to generate today's forecast.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {MEAL_TYPES.map(({ key, label }) => (
                <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                        <Input
                            type="number"
                            placeholder="e.g. 450"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                ))}

                <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                >
                <Calculator className="w-4 h-4" />
                {form.formState.isSubmitting ? "Predicting..." : "Predict Today's Count"}
                </Button>
            </form>
            </Form>

            {apiError && (
            <p className="text-sm text-red-500 mt-4 text-center">{apiError}</p>
            )}

            {predictions && (
            <div className="mt-6 pt-4 border-t space-y-1.5">
                <h3 className="font-medium text-gray-900">Predicted counts for today:</h3>
                {Object.entries(predictions).map(([meal, count]) => (
                <p key={meal} className="capitalize text-gray-700">
                    {meal}: <span className="font-semibold">{count}</span>
                </p>
                ))}
            </div>
            )}
        </CardContent>
        </Card>
    );
}

export default StudentCount;
