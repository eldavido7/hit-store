"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { BsTwitterX } from "react-icons/bs";
import { useState } from "react";
import DonationModal from "@/components/donate-modal";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Thanks for subscribing! Check your email to confirm.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white" id="footer">
      {/* Newsletter Section */}
      <div className="px-6 py-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-cormorant mb-2">
                Join Our Newsletter to
              </h2>
              <h3 className="text-3xl lg:text-4xl font-cormorant">
                Keep Up to Date With Us!
              </h3>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col items-end gap-4 w-full lg:w-auto"
            >
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-gray-400"
                    >
                      <path
                        d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                    className="pl-12 pr-4 py-6 bg-[#2a2a2a] border-[#404040] text-white placeholder-gray-400 rounded-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-[#bf5925] hover:bg-[#bf5925]/90 text-white rounded-full px-8 py-6 disabled:opacity-50"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {message && (
                <p
                  className={`text-sm ${
                    status === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-6 py-12 border-t border-[#404040]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo2.svg"
                  alt="HIT Logo"
                  width={200}
                  height={120}
                  className="object-contain"
                  priority
                />
              </div>
              <h4 className="text-2xl font-cormorant  mb-4">
                Her Immigrant Tales
              </h4>
              <p className="text-gray-300 mb-6 leading-relaxed">
                HIT celebrates immigrant women worldwide by sharing their
                stories, building community, and inspiring change
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <Link
                  href="https://web.facebook.com/profile.php?id=61575319437919"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaFacebookF />
                  </span>
                </Link>
                <Link
                  href="https://www.tiktok.com/@herimmigranttales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaTiktok />
                  </span>
                </Link>
                <Link
                  href="https://x.com/HIT_Champions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <BsTwitterX />
                  </span>
                </Link>

                <Link
                  href="https://t.me/+GLmIjvoo75Q0MWYx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaTelegram />
                  </span>
                </Link>

                {/* <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-gray-400 font-bold text-lg">
                    <FaSpotify />
                  </span>
                </Link> */}
                <Link
                  href="https://www.instagram.com/herimmigranttales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaInstagram />
                  </span>
                </Link>
                <Link
                  href="https://www.threads.com/@herimmigranttales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaThreads />
                  </span>
                </Link>
                <Link
                  href="https://www.youtube.com/@herimmigranttales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="text-gray-400 font-bold text-lg">
                    <FaYoutube />
                  </span>
                </Link>
              </div>
            </div>

            {/* Navigation Columns */}
            <div>
              <h5 className="text-gray-400 font-medium mb-4">Explore</h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stories"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Stories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community/events"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-gray-400 font-medium mb-4">Learn</h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                {/* <li>
                  <Link href="/stories" className="text-gray-300 hover:text-white transition-colors">
                    Store
                  </Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h5 className="text-gray-400 font-medium mb-4">Get Involved</h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="https://herimmigranttalepartners.framer.website"
                    target="_blank"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Collaborate
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Donate
                  </button>
                  <DonationModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                  />
                </li>
                {/* <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                    Join Our Newsletter
                  </Link>
                </li> */}
              </ul>

              <h5 className="text-gray-400 font-medium mb-4 mt-8">
                Contact Info
              </h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="mailto:hello@herimmigranttales.com"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    hello@herimmigranttales.com
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:hello@herimmigranttales.org"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    hello@herimmigranttales.org
                  </Link>
                </li>
                <li>
                  <Link
                    href="tel:+14378817400"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +1 (437) 881-7400
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="px-6 py-6 border-t border-[#404040]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Her Immigrant Tales Org. All
            rights reserved
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
