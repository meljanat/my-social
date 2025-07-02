"use client";
import AuthForm from '../components/AuthForm';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EventCard from "../components/EventCard";

export default function EventPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const eventId = searchParams.get('event');
    const groupId = searchParams.get('id');

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("http://localhost:8404/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(data);
                }
            } catch (error) {
                console.log("Error checking login status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, [isLoggedIn]);

    useEffect(() => {
        async function fetchEvent(group_id, event_id) {
            try {
                const response = await fetch(`http://localhost:8404/event?event_id=${event_id}&group_id=${group_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to retrieve event data");
                }

                const data = await response.json();
                console.log("Event data:", data);
                
                setEvent(data);
            } catch (error) {
                console.error("Failed to fetch event:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEvent(groupId, eventId);
    }, [groupId, eventId]);

    const handleGoBack = () => {
        router.back();
    }

    if (!isLoggedIn) {
        return <AuthForm onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!event) {
        return (
            <>
                <div>Event not found</div>
                <button onClick={handleGoBack}>Go Back</button>
            </>
        );
    }

    return (
        <div >
            <EventCard key={event.event_id} event={event} />
        </div>
    );
}