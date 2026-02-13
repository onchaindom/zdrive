'use client';

import { useState, useEffect } from 'react';

export const CYCLING_PHRASES = [
  'field recordings',
  '3D horse sculpture',
  'esoteric system prompt',
  'point cloud of an oldsmobile',
  'note about notetaking',
  'voice memo from 3am',
  'zine about moss',
  'firmware for a lamp',
  '+++!!!???',
];

export function Typewriter({
  texts,
  initialWord,
  initialDelay = 2500,
  speed = 50,
  deleteSpeed = 30,
  waitTime = 2000,
  className = '',
}: {
  texts: string[];
  initialWord?: string;
  initialDelay?: number;
  speed?: number;
  deleteSpeed?: number;
  waitTime?: number;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(initialWord || '');
  const [charIndex, setCharIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(!initialWord);

  useEffect(() => {
    if (initialWord && !started) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
        setStarted(true);
      }, initialDelay);
      return () => clearTimeout(timeout);
    }
  }, [initialWord, initialDelay, started]);

  useEffect(() => {
    if (!started) return;

    const current = texts[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCharIndex(0);
      } else {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deleteSpeed);
      }
    } else {
      if (charIndex < current.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + current[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, speed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, waitTime);
      }
    }

    return () => clearTimeout(timeout);
  }, [started, charIndex, displayText, isDeleting, speed, deleteSpeed, waitTime, texts, textIndex]);

  return (
    <span className={className}>
      {displayText}
      <span
        className="inline-block w-[2px] h-[0.9em] bg-current align-middle ml-[1px]"
        style={{ animation: 'cursor-blink 0.8s step-end infinite' }}
      />
    </span>
  );
}
