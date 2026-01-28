"use client";

import Header from "@/components/headeruser";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { QRCodeComponent } from "@/components/qrcode";
import { Briefcase } from "lucide-react";
import { BiBullseye } from "react-icons/bi";
import Footer from "@/components/footer";
import Link from "next/link";
import { EventModal } from "@/components/event-modal";
import { useEventStore } from "@/store/store";
import { toast } from "@/components/ui/use-toast";
import DonationModal from "@/components/donate-modal";
import { Event } from "@/types";

type Props = {
  serverEvents?: Event[];
};

export default function Community({ serverEvents }: Props) {
  const { events, fetchEvents } = useEventStore();

  const [translateX, setTranslateX] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [localEvents, setLocalEvents] = useState<Event[]>(
    serverEvents && serverEvents.length > 0 ? serverEvents : events
  );

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Initialize: prefer serverEvents when available, otherwise fetch from store
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        if (events.length === 0) {
          if (serverEvents && serverEvents.length > 0) {
            setLocalEvents(serverEvents);
            if (!mounted) return;
          } else {
            await fetchEvents();
          }
        } else {
          setLocalEvents(events);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch stories. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [serverEvents, events.length, fetchEvents]);

  // Sync when store events update
  useEffect(() => {
    if (events.length > 0) setLocalEvents(events);
  }, [events]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateX((prev) => prev - 0.8); // Adjustable speed that works well
    }, 16); // 60fps smooth animation

    return () => clearInterval(interval);
  }, []);

  const images = [
    "/1.png?w=400&h=600&fit=crop",
    "/2.png?w=400&h=600&fit=crop",
    "/3.png?w=400&h=600&fit=crop",
    "/4.png?w=400&h=600&fit=crop",
    "/5.png?w=400&h=600&fit=crop",
  ];

  const activeEvents = localEvents
    .filter((event) => event.status === "active")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Background Frame Image with Blur Effects */}
      <div className="absolute top-0 left-0 w-full h-[150vh] z-0 overflow-hidden">
        <Image
          src="/gridlines.png"
          alt="Background frame"
          fill
          className="object-cover"
        />
        {/* Blur overlay for entire background */}
        <div className="absolute inset-0 bg-gradient-radial from-white/60 via-white/30 to-transparent"></div>
        {/* Circular blur behind header/text area */}
        <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[1200px] h-[600px] bg-white/50 rounded-full blur-[120px]"></div>
        {/* Bottom circular blur */}
        <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[1400px] h-[400px] bg-white/60 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative px-6 max-w-[1200px] mx-auto">
        <div className="absolute w-[587px] h-[740px] top-[142px] left-[427px] rounded-[293.3px/369.87px] rotate-[-52.53deg] blur-[374.42px] opacity-[0.16]" />

        {/* Hero Section */}
        <div className="text-center pt-16 relative z-10">
          <div className="absolute w-[587px] h-[740px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#bf5925] rounded-[293.3px/369.87px] rotate-[-52.53deg] blur-[374.42px] opacity-[0.16] -z-10" />

          <h1 className="text-5xl md:text-6xl font-cormorant text-[#353336] mb-6 leading-tight">
            A Global Community of <br />{" "}
            <span className="text-[#bf5925] italic">Immigrant Women</span> and
            Allies
          </h1>
          <p className="text-lg text-[#353336] mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect, collaborate, and grow together in a space built on trust,
            truth, and shared humanity.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="https://herimmigranttalepartners.framer.website"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-[#bf5925] text-[#bf5925] hover:bg-[#bf5925] hover:text-white rounded-full px-8 py-3 bg-white"
              >
                Collaborate
              </Button>
            </Link>
            {/* <Link href="https://paystack.shop/pay/testers" target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-full px-8 py-3">Donate</Button>
                        </Link> */}
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-full px-12 py-3"
            >
              Donate
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="relative w-full h-[550px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative flex items-center justify-center"
            style={{
              perspective: "1200px",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Create multiple cycles of the same 5 images */}
            {Array.from({ length: 25 }, (_, i) => {
              const imageIndex = i % images.length;
              const image = images[imageIndex];

              // Calculate position in the original curved formation
              const totalImages = 5;
              const center = (totalImages - 1) / 2;
              const cycleOffset = Math.floor(i / totalImages) - 2; // -2 to 2 for 5 cycles
              const positionInCycle = i % totalImages;
              const offset = positionInCycle - center;

              // Apply the sliding offset to move the entire formation smoothly
              const rawSlide = translateX * -0.02;
              const slideOffset = rawSlide % 5;
              const adjustedOffset = offset - slideOffset + cycleOffset * 5;

              // Render all images to avoid pop-in/pop-out effects
              const absOffset = Math.abs(adjustedOffset);
              const spacingMultiplier = 230; // Fixed to constant to avoid jumps

              const translateXPos = adjustedOffset * spacingMultiplier;

              const rotateY = adjustedOffset * -25;
              const normalizedOffset = adjustedOffset / center;
              const translateZ =
                -200 + Math.abs(normalizedOffset * normalizedOffset * 200);

              // Smooth opacity fade for images far from center
              const opacity = Math.abs(adjustedOffset) > 4 ? 0 : 1;
              const transition =
                Math.abs(adjustedOffset) > 3 ? "opacity 0.5s ease-out" : "none";

              return (
                <div
                  key={`${image}-${i}`}
                  className="absolute w-[280px] h-[420px]"
                  style={{
                    transform: `
                                      translateX(${translateXPos}px)
                                      translateZ(${translateZ}px)
                                      rotateY(${rotateY}deg)
                                      scale(1)
                                    `,
                    opacity: opacity,
                    transition: transition,
                  }}
                >
                  <img
                    src={image}
                    alt={`Gallery image ${imageIndex + 1}`}
                    className="w-full h-full object-cover shadow-lg"
                    loading="eager"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/1.png?w=400&h=600&fit=crop";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events section with ticket-like design */}
      <section className="relative py-20 px-6 bg-white z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-cormorant text-[#353336] mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-[#353336] max-w-3xl mx-auto leading-relaxed">
              Workshops, panels, and meetups where immigrant women and allies
              connect, share stories, and spark change together
            </p>
          </div>
          {activeEvents.length === 0 ? (
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
                {activeEvents.slice(0, 3).map((event) => {
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
                            <h3 className="text-2xl font-cormorant font-semibold text-[#353336] mb-1 leading-tight">
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
                {activeEvents.slice(0, 3).map((event) => (
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
                          <div className="text-sm text-gray-600">
                            At {event.time}
                          </div>
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
                                                            className="border-[#bf5925] text-[#bf5925] hover:bg-[#bf5925]/10 bg-transparent"
                                                            onClick={() => handleEventClick(event)}
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

              <div className="text-center mt-12">
                <Link href="/community/events">
                  <Button className="bg-[#bf5925] hover:bg-[#bf5925]/90 cursor-pointer text-white px-8 py-3 rounded-full">
                    See all
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How to Get Involved section */}
      <section className="py-20 px-6 bg-[#FFF3EA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-cormorant text-[#353336] mb-4">
              How to Get Involved
            </h2>
            <p className="text-lg text-[#353336] max-w-3xl mx-auto leading-relaxed">
              Workshops, panels, and meetups where immigrant women and allies
              connect, share stories, and spark change together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Subscribe to Newsletter */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#bf5925] border-[6px] border-custom-orange-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#353336] mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get stories, opportunities, and events delivered to your inbox.
              </p>
            </div>

            {/* Collaborate on Projects */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#bf5925] border-[6px] border-custom-orange-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#353336] mb-4">
                Collaborate on Projects
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Work with us to amplify voices and create lasting impact.
              </p>
            </div>

            {/* Support the Mission */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#bf5925] border-[6px] border-custom-orange-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BiBullseye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#353336] mb-4">
                Support the Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Help sustain programs that empower immigrant women everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-[1000px] py-20 px-6 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/commbg.png"
            alt="Community background"
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center mt-[400px]">
          <h2 className="text-4xl md:text-5xl font-cormorant text-black mb-6">
            Be Part of Something Bigger
          </h2>
          <p className="text-lg text-black mb-8 max-w-2xl mx-auto leading-relaxed">
            Be part of a supportive network that celebrates diversity, shares
            stories, and creates meaningful connections across borders.
          </p>
          <Button
            onClick={(e) => {
              e.preventDefault();
              const footer = document.getElementById("footer");
              if (footer) {
                footer.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white px-8 py-3 rounded-full"
          >
            Join Now
          </Button>
        </div>
      </section>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Footer />
      <DonationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
