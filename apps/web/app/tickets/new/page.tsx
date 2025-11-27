"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { apis } from "@/lib/api";

export default function NewTicketPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        durationMinutes: 60,
        sportType: "basketball",
        intensity: "Medium",
        currency: "USD",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError("");

        try {
            await apis.tickets.createTicket({
                ticketCreateIn: {
                    ...formData,
                    date: new Date(formData.date), // Convert string to Date
                    intensity: formData.intensity as any, // Cast to enum
                }
            });
            router.push("/tickets");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                            type="time"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input
                            type="number"
                            required
                            min="30"
                            step="30"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sport Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.sportType}
                            onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                        >
                            <option value="basketball">Basketball</option>
                            <option value="badminton">Badminton</option>
                            <option value="tennis">Tennis</option>
                            <option value="volleyball">Volleyball</option>
                            <option value="soccer">Soccer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Intensity</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.intensity}
                            onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Ticket"}
                    </button>
                </div>
            </form>
        </div>
    );
}
