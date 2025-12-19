"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
    targetdate: z.date({
        required_error: "A date is required.",
    }),
    message: z.string().min(2, {
        message: "Message must be at least 2 characters.",
    }),
})


export default function SetNewLeftDays() {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            message: "",
        },
    })

    async function onSubmit(data) {
        try {
            const response = await fetch('/api/targets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: data.targetdate.toLocaleDateString(),
                    message: data.message
                })
            });
            const result = await response.json();
            if (result.success && result.id) {
                toast({
                    title: "Target date added",
                    description: "Your target date has been added successfully.",
                });
            } else {
                toast({
                    title: "Failed to add target date",
                    description: "An error occurred while adding your target date. Please try again later.",
                    status: "error",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to add target date",
                description: "An error occurred while adding your target date. Please try again later.",
                status: "error",
            });
        }
        router.refresh();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row items-center justify-center space-x-2">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Message" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="targetdate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-fit md:w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <span>Pick a date</span>
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Add</Button>
            </form>
        </Form>
    )
}
