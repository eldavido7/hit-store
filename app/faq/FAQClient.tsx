"use client";

import Footer from "@/components/footer";
import Header from "@/components/headeruser";
import Image from "next/image";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// Type for FAQ items
type FAQ = {
  question: string;
  answer: string;
};

// Props to receive hardcoded FAQs from server
type Props = {
  faqs: FAQ[];
};

export default function FAQClient({ faqs }: Props) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="text-center relative h-[400px]">
        <div className="absolute top-0 left-0 w-full h-full z-10 overflow-hidden">
          <Image
            src="/eventsbg.png"
            alt="Background frame"
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-20 max-w-2xl mx-auto pt-24">
          <h1 className="text-5xl md:text-6xl font-cormorant text-[#353336] mb-6 leading-tight">
            Your Questions,{" "}
            <span className="text-[#bf5925] italic">Answered</span>
          </h1>
          <p className="text-lg text-[#353336] mb-8 md:max-w-2xl md:px-0 px-6 mx-auto leading-relaxed">
            Clear guidance for immigrant women and supporters of HIT — all in
            one place. If you still can't find what you need, we're just a
            message away.
          </p>
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#bf5925] text-lg font-medium mb-4">
              Frequently Asked Questions
            </h2>
            <h3 className="text-4xl md:text-5xl font-cormorant text-[#353336] leading-tight">
              Got Any Questions?
              <br />
              We've Got Answers
            </h3>
          </div>

          <div className="space-y-6 md:px-0 px-2">
            {faqs.map((faq, index) => {
              const isOpen = openFAQ === index;
              return (
                <div
                  key={index}
                  className={`transition-colors rounded-lg ${
                    isOpen ? "bg-gray-50" : ""
                  }`}
                >
                  {/* Question */}
                  <button
                    className={`w-full cursor-pointer flex justify-between items-center text-left ${
                      isOpen ? "px-6 py-6" : "px-0 py-0"
                    }`}
                    onClick={() => setOpenFAQ(isOpen ? null : index)}
                  >
                    <span className="text-lg font-medium text-[#353336] pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="w-6 h-6 text-[#353336] flex-shrink-0" />
                    ) : (
                      <Plus className="w-6 h-6 text-[#353336] flex-shrink-0" />
                    )}
                  </button>

                  {/* Answer */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? "500px" : "0" }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
