"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { TicketOut } from "@team-up-main/api-client";
import { apis } from "@/lib/api";
import { Plus, Calendar, Clock, Activity } from "lucide-react";

export default function TicketsPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketOut[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        apis.tickets
            .listTickets()
            .then((data) => {
                setTickets(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p>Please log in to view tickets.</p>
            </div>
        );
    }

    const formatDate = (date: Date | string) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
                <Link
                    href="/tickets/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No tickets found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="bg-white rounded-lg shadow border border-gray-200 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === "matched"
                                            ? "bg-green-100 text-green-800"
                                            : ticket.status === "expired"
                                                ? "bg-gray-100 text-gray-800"
                                                : "bg-blue-100 text-blue-800"
                                        }`}
                                >
                                    {ticket.status.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {formatDate(ticket.createdAt)}
                                </span>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {ticket.sportType}
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatDate(ticket.date)}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {ticket.startTime}
                                </div>
                                <div className="flex items-center">
                                    <Activity className="w-4 h-4 mr-2" />
                                    {ticket.intensity}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
