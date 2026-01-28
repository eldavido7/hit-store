"use client";

import Footer from "@/components/footer";
import Header from "@/components/headeruser";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeComponent } from "@/components/qrcode";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventModal } from "@/components/event-modal";
import { useEventStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import { Event } from "@/types"; // Make sure you import your Event type

// Props type to receive server data
type Props = {
  serverEvents: Event[];
};

// Component now accepts props from server
export default function EventsClient({ serverEvents }: Props) {
  // KEPT: Zustand store still works!
  const { events, fetchEvents } = useEventStore();

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  // Initialize with server data, can be updated from store
  const [localEvents, setLocalEvents] = useState<Event[]>(serverEvents);
  const [loading, setLoading] = useState<boolean>(
    !serverEvents || serverEvents.length === 0
  );

  // Compare helper: ensure robust descending sort by date (newest first)
  const compareByDateDesc = (a: { date?: string }, b: { date?: string }) => {
    const ta = a?.date ? new Date(a.date).getTime() : 0;
    const tb = b?.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  };

  // Filter active events from local state
  const activeEvents = localEvents
    .filter((event) => event.status === "active")
    .sort(compareByDateDesc);

  const totalPages = Math.ceil(activeEvents.length / eventsPerPage);
  const currentEvents = activeEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch from store if needed (for client-side navigation)
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we don't have server data and store is empty
      if ((!serverEvents || serverEvents.length === 0) && events.length === 0) {
        try {
          await fetchEvents();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch events. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (serverEvents && serverEvents.length > 0) {
        // We have server data, no loading needed
        setLoading(false);
      }
    };

    fetchData();
  }, [serverEvents, events.length, fetchEvents]);

  // Update from store when available (for client-side navigation)
  useEffect(() => {
    if (events.length > 0) {
      const activeStoreEvents = events.filter(
        (e: Event) => e.status === "active"
      );

      // Only update if we don't have server data
      if (!serverEvents || serverEvents.length === 0) {
        setLocalEvents(activeStoreEvents);
      }
    }
  }, [events, serverEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // KEPT: Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-[1440px] mx-auto px-4 py-16">
          {/* Hero section skeleton */}
          <div className="rounded-[50px] overflow-hidden h-[700px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse mb-16">
            <div className="p-8 h-full flex flex-col justify-end">
              <div className="max-w-2xl space-y-4">
                <div className="h-6 w-32 bg-white/30 rounded-full"></div>
                <div className="h-12 w-full bg-white/20 rounded-lg"></div>
                <div className="h-12 w-3/4 bg-white/20 rounded-lg"></div>
                <div className="flex gap-4">
                  <div className="h-8 w-24 bg-white/20 rounded-full"></div>
                  <div className="h-4 w-20 bg-white/20 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/20 rounded"></div>
                  <div className="h-4 w-2/3 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Title skeleton */}
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-12"></div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 w-full bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="text-center relative h-[500px]">
        <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden">
          <Image
            src="/eventsbg.png"
            alt="Background frame"
            fill
            className="object-cover object-center"
          />
        </div>
        {/* Breadcrumb */}
        <nav className="flex relative z-20 items-center gap-2 text-sm md:ml-24 ml-10 text-gray-600 mb-8 pt-4">
          <Link href="/community" className="hover:text-[#bf5925]">
            Community
          </Link>
          <span>&gt;</span>
          <span>Events</span>
        </nav>

        <div className="relative z-20 max-w-2xl mx-auto md:mt-20 md:px-0 px-5">
          <h1 className="text-5xl md:text-6xl font-cormorant text-[#353336] mb-6 leading-tight">
            Celebrate, Connect, and <br />{" "}
            <span className="text-[#bf5925] italic">Create Change</span>{" "}
            Together!
          </h1>
          <p className="text-lg text-[#353336] mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect, collaborate, and grow together in a space built on trust,
            truth, and shared humanity.
          </p>
        </div>
      </div>

      <section className="relative px-6 bg-white z-10 pb-20">
        <div className="max-w-6xl mx-auto">
          {currentEvents.length === 0 ? (
            <div className="text-center py-12">
              <Image
                src="/no-events.png"
                alt="No Events"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
              <div className="text-2xl font-semibold mb-4">
                No Events at the Moment.
              </div>
              <p className="text-lg max-w-md mx-auto">
                Check back soon, exciting community events are on the way!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {currentEvents.map((event) => {
                  // Parse the date string to extract day and day number
                  const eventDate = new Date(event.date);
                  const day = eventDate.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const dayNumber = eventDate.getDate();

                  return (
                    <div
                      key={event.id}
                      className="relative max-w-[1440px] mx-auto"
                    >
                      {/* Ticket Background */}
                      <div className="relative md:flex hidden">
                        <Image
                          src="/ticket.png"
                          alt="Event ticket"
                          width={1200}
                          height={400}
                          className="w-full h-auto"
                        />

                        {/* Event Content Overlay */}
                        <div className="absolute inset-0 flex items-center h-full">
                          {/* Left side - Illustration space (skip this area) */}
                          <div
                            className="flex-shrink-0"
                            style={{ width: "40px" }}
                          >
                            {/* This space contains the illustration from the ticket background */}
                          </div>

                          {/* Date Section */}
                          <div className="flex-shrink-0 mr-6 text-center w-[80px]">
                            <div className="text-2xl font-bold text-[#353336]">
                              {day}
                            </div>
                            <div className="text-3xl font-bold text-[#353336]">
                              {dayNumber}
                            </div>
                            <div className="text-2xl font-bold text-[#353336]">
                              {event.time}
                            </div>
                          </div>

                          {/* Event Details Section */}
                          <div className="flex-1 px-4 max-w-lg">
                            <div className="flex items-center gap-2 mb-1">
                              {event.featured && (
                                <span className="inline-block bg-[#bf5925]/10 border-[#bf5925] border text-[#bf5925] px-2 py-1 rounded-full text-md">
                                  Featured
                                </span>
                              )}
                              <div className="flex items-center text-md text-black">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {event.date}
                              </div>
                            </div>
                            <h3 className="text-2xl font-cormorant font-semibold text-[#353336] mb-1 leading-tight line-clamp-2">
                              {event.title}
                            </h3>
                            <div className="flex items-center text-md text-[#353336] mb-2">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {event.location}
                            </div>
                            <p className="text-[#353336] text-md leading-relaxed mb-2 line-clamp-2">
                              {event.description}
                            </p>
                            <p
                              className="text-[#bf5925] text-md font-semibold cursor-pointer hover:underline"
                              onClick={() => handleEventClick(event)}
                            >
                              Join Us
                            </p>
                          </div>

                          {/* Event Image */}
                          <div
                            className="flex-shrink-0 overflow-hidden rounded-lg mr-32"
                            style={{ width: "180px", height: "150px" }}
                          >
                            <Image
                              src={event.image}
                              alt={event.title}
                              width={180}
                              height={120}
                              className="w-full h-full rounded-3xl object-cover"
                            />
                          </div>

                          {/* Right side - QR Code only */}
                          <div className="flex-shrink-0 flex items-center justify-center w-[100px]">
                            <QRCodeComponent
                              value={event.meetingLink}
                              size={160}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Event Cards */}
              <div className="space-y-8">
                {currentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative max-w-[1440px] mx-auto"
                  >
                    {/* Add responsive grid for mobile */}
                    <div className="md:hidden bg-white rounded-3xl border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                              src={event.image}
                              alt={event.title}
                              fill
                              className="rounded-2xl object-cover"
                            />
                          </div>
                          {/* QR Code for mobile */}
                          <div className="">
                            <QRCodeComponent
                              value={event.meetingLink}
                              size={80}
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#353336] mb-1">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {event.date} • {event.location}
                          </p>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {event.description}
                          </p>

                          {/* Mobile-only buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white"
                              onClick={() => handleEventClick(event)}
                            >
                              Join
                            </Button>
                            {/* <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-[#bf5925] text-[#bf5925] hover:bg-[#bf5925]/10"
                                                        >
                                                            Details
                                                        </Button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 mb-6">
                  <Button
                    variant="outline"
                    className="border-[#bf5925] text-[#bf5925] hover:bg-[#bf5925] hover:text-white rounded-full p-2"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    className="border-[#bf5925] text-[#bf5925] hover:bg-[#bf5925] hover:text-white rounded-full p-2"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <Footer />
    </div>
  );
}
