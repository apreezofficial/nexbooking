"use client";

import { useState } from "react";
import Icon from "./Icon";

type Props =
  | { mode: "carousel" }
  | { mode: "faq"; questions: string[][] };

const topics = [
  { name: "All", icon: "spark", questions: [0, 1, 2, 3, 4] },
  { name: "General", icon: "info", questions: [0, 1] },
  { name: "Bookings & Reschedules", icon: "calendar", questions: [1, 4] },
  { name: "Payments & Invoices", icon: "card", questions: [2] },
  { name: "Daily Tools", icon: "mic", questions: [3] },
];

export default function LandingControls(props: Props) {
  const [topic, setTopic] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (props.mode === "carousel") {
    function move(direction: number) {
      const track = document.getElementById("business-cards");
      const card = track?.firstElementChild;
      if (track && card) {
        track.scrollBy({ left: direction * (card.getBoundingClientRect().width + 20) });
      }
    }

    return (
      <div className="carousel-controls">
        <button type="button" aria-label="Previous recommendation" onClick={() => move(-1)}>
          ‹
        </button>
        <button type="button" aria-label="Next recommendation" onClick={() => move(1)}>
          ›
        </button>
      </div>
    );
  }

  const currentQuestions = topics[topic].questions;

  return (
    <div className="modern-faq-container">
      {/* Aceternity pill topic filter bar */}
      <div className="modern-faq-tabs" role="tablist" aria-label="Filter questions">
        {topics.map((item, index) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={topic === index}
            className={`modern-faq-tab ${topic === index ? "active" : ""}`}
            onClick={() => {
              setTopic(index);
              setOpenIndex(0); // open first question of newly selected topic
            }}
          >
            <Icon name={item.icon} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Accordion List with Card Hover & Expansion Animation */}
      <div className="modern-faq-accordion" key={topic}>
        {currentQuestions.map((qIdx, index) => {
          const [question, answer] = props.questions[qIdx];
          const isOpen = openIndex === index;

          return (
            <div
              key={question}
              className={`modern-faq-item ${isOpen ? "is-expanded" : ""}`}
            >
              <button
                type="button"
                className="modern-faq-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="faq-question-text">{question}</span>
                <span className="faq-icon-bubble" aria-hidden="true">
                  <Icon name="chevron" className={`faq-chevron ${isOpen ? "rotate" : ""}`} />
                </span>
              </button>
              <div
                className="modern-faq-collapse"
                style={{
                  maxHeight: isOpen ? "300px" : "0px",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="faq-answer-inner">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
