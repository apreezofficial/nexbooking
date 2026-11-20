"use client";

import { useState } from "react";

type Props =
  | { mode: "carousel" }
  | { mode: "faq"; questions: string[][] };

const topics = [
  { name: "General", questions: [0, 1, 2, 3, 4] },
  { name: "Business", questions: [1, 4] },
  { name: "Payments", questions: [2] },
  { name: "Notes", questions: [3] },
];

export default function LandingControls(props: Props) {
  const [topic, setTopic] = useState(0);

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
        <button type="button" aria-label="Previous recommendation" onClick={() => move(-1)}>‹</button>
        <button type="button" aria-label="Next recommendation" onClick={() => move(1)}>›</button>
      </div>
    );
  }

  return (
    <>
      <div className="faq-topics" aria-label="Filter questions">
        {topics.map((item, index) => (
          <button key={item.name} type="button" aria-pressed={topic === index} onClick={() => setTopic(index)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="faq-list" key={topic}>
        {topics[topic].questions.map((questionIndex, index) => {
          const [question, answer] = props.questions[questionIndex];
          return (
            <details key={question} open={index === 0} name="landing-faq">
              <summary>{question}<span aria-hidden="true">⌄</span></summary>
              <p>{answer}</p>
            </details>
          );
        })}
      </div>
    </>
  );
}
