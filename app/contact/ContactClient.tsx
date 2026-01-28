"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { BsTelegram, BsTwitterX } from "react-icons/bs";
import Footer from "@/components/footer";
import Header from "@/components/headeruser";
import Image from "next/image";
import { useRef, useState } from "react";
import { Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const socialRef = useRef(null);
  const socialInView = useInView(socialRef, {
    once: false,
    amount: 0,
    margin: "-300px 0px -300px 0px", // Lenient margin for mobile
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen ">
      <Header />

      <div className="text-center relative h-[500px]">
        <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden">
          <Image
            src="/contactbg.png"
            alt="Background frame"
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-20 max-w-2xl mx-auto pt-40">
          <h1 className="text-5xl md:text-6xl font-cormorant text-white mb-6 leading-tight">
            We’d Love to Hear from You
          </h1>
          <p className="text-lg text-white mb-8 max-w-2xl md:px-0 px-6 mx-auto leading-relaxed">
            Whether you want to collaborate, share your story, or simply
            connect, we’re here to listen.
          </p>
        </div>
      </div>

      <section className="bg-white rounded-t-[50px] -mt-16 relative z-30 py-16 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-cormorant text-gray-900 mb-4">
              Get in Touch With Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Collaborate, ask questions, or schedule a chat, reach us by form,
              Calendly, phone, or email.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Contact Form */}
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-cormorant text-gray-900 mb-4">
                Send Us an Email
              </h3>
              <p className="text-gray-600 mb-8">
                Have a question, inquiry, or suggestion? Fill out the form
                below, and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-2" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nonso"
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#bf5925] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="diobig@gmail.com"
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#bf5925] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enquiry"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#bf5925] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Write message here"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[#bf5925] focus:outline-none resize-none"
                    required
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 max-w-md mx-4 relative">
                      {/* Close button in top right */}
                      <button
                        type="button"
                        title="Close"
                        onClick={() => setSubmitStatus("idle")}
                        className="absolute md:block hidden -top-1 md:-right-16 -right-3 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="text-center">
                        <Image
                          width={32}
                          height={32}
                          alt="Success"
                          src="/thank.png"
                          className="w-48 h-48 flex items-center justify-center mx-auto mb-4"
                        />
                        <h3 className="text-3xl font-semibold text-gray-900 mb-2">
                          Thank you for reaching out!
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your message has been sent successfully. We'll get
                          back to you as soon as possible.
                        </p>
                        <Button
                          onClick={() => setSubmitStatus("idle")}
                          className="bg-[#bf5925] hover:bg-[#bf5925]/90 md:hidden text-white px-6 py-2 rounded-full"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Failed to send message. Please try again.
                  </div>
                )}

                <Button
                  type="submit"
                  className="bg-[#bf5925] hover:bg-[#bf5925]/90 cursor-pointer text-white px-8 py-3 rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </form>
            </div>

            {/* Right side - Contact Cards */}
            <div className="space-y-6">
              {/* Contact Us Card */}
              <div className="bg-[#FFF3EA] border border-[#bf5925] rounded-2xl p-8">
                <h3 className="text-2xl font-cormorant text-gray-900 mb-6">
                  Contact Us
                </h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="grid grid-cols-1 items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-[#bf5925]" />
                        <span className="font-medium text-gray-900">Email</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        hello@herimmigranttales.org
                      </p>
                    </div>
                    <div>
                      <div className="grid grid-cols-1 items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-[#bf5925]" />
                        <span className="font-medium text-gray-900">
                          Email 2
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        hello@herimmigranttales.com
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 items-center gap-3 mb-2">
                      <Phone className="w-4 h-4 text-[#bf5925]" />
                      <span className="font-medium text-gray-900">
                        Phone Number
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">+1 (437) 881-7400</p>
                  </div>
                </div>
              </div>

              {/* Book a Conversation Card */}
              <div className="bg-[url('/contactbg1.png')] bg-cover bg-center border border-[#bf5925] text-center rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-cormorant mb-4">
                  Book a Conversation with Us
                </h3>
                <p className="mb-6 opacity-90">
                  Want to discuss a project, partnership, or just chat? Schedule
                  a time that works for you.
                </p>
                <Link
                  href="https://calendly.com/herimmigranttales"
                  target="_blank"
                >
                  <Button className="bg-white text-[#bf5925] hover:bg-gray-100 px-6 py-2 rounded-full">
                    Schedule now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFF3EA] md:py-32 mb-24 px-6 mx-5 md:mx-0 rounded-[50px] relative">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-12 items-stretch">
            {/* Left side - Image */}
            <motion.div
              ref={socialRef}
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                socialInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/follow.png"
                alt="Four diverse women smiling together"
                fill
                className="rounded-[50px] object-cover"
              />
            </motion.div>

            {/* Right side - Social Media Links */}
            <div className="flex flex-col justify-center py-6 gap-6">
              <h2 className="text-4xl font-cormorant text-gray-900 mb-8">
                Follow Us on Social Media
              </h2>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaFacebookF />
                      </span>
                    </div>
                    <span className="text-gray-900">Her Immigrant Tales</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaTiktok />
                      </span>
                    </div>
                    <span className="text-gray-900">@herimmigranttales</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <BsTwitterX />
                      </span>
                    </div>
                    <span className="text-gray-900">@HIT_Champions</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaSpotify />
                      </span>
                    </div>
                    <span className="text-gray-900">@herimmigranttales</span>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaInstagram />
                      </span>
                    </div>
                    <span className="text-gray-900">@herimmigranttales</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaThreads />
                      </span>
                    </div>
                    <span className="text-gray-900">@herimmigranttales</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <FaYoutube />
                      </span>
                    </div>
                    <span className="text-gray-900">@herimmigranttales</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="md:w-10 md:h-10 w-4 h-4 md:p-0 p-5 bg-[#bf5925] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        <BsTelegram />
                      </span>
                    </div>
                    <span className="text-gray-900">
                      Her Immigrant Tales (HIT)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
