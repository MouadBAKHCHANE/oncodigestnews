'use client';

import { useState, useEffect } from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import { ProseFromPortableText } from '@/lib/sanity/portableText';
import styles from './FAQAccordion.module.css';

export interface FAQItemData {
  _id: string;
  question: string;
  answer: PortableTextBlock[];
}

interface FAQAccordionProps {
  items: FAQItemData[];
  /** Section heading shown in the sticky left column. */
  heading?: string;
  /** Eyebrow tag shown above the heading (e.g. "FAQ"). */
  tag?: string;
}

/**
 * FAQ accordion — homepage section. Single-open behavior.
 *
 * Verbatim port of the .faq_* block in index.html (lines 1438-1587 + script
 * 3194-3220), including the watermark number that animates when the active
 * item changes.
 *
 * Reduced-motion: the watermark transition is disabled via CSS; the
 * accordion still works, just without the slide-in.
 */
export function FAQAccordion({
  items,
  heading = 'Vos questions, nos réponses',
  tag = 'FAQ',
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [watermarkNum, setWatermarkNum] = useState('01');
  const [watermarkChanging, setWatermarkChanging] = useState(false);

  function pad(n: number): string {
    return String(n + 1).padStart(2, '0');
  }

  function toggle(index: number) {
    setOpenIndex((prev) => {
      const next = prev === index ? null : index;
      if (next !== null && pad(next) !== watermarkNum) {
        // Animate the watermark to the new number.
        setWatermarkChanging(true);
        setTimeout(() => {
          setWatermarkNum(pad(next));
          setWatermarkChanging(false);
        }, 300);
      }
      return next;
    });
  }

  // Initialize the watermark from the first item once mounted.
  useEffect(() => {
    if (items.length > 0) setWatermarkNum('01');
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.leftInner}>
          <div className={styles.watermark}>
            <span
              className={`${styles.watermarkNum} ${watermarkChanging ? styles.changing : ''}`}
            >
              {watermarkNum}
            </span>
          </div>
          {tag ? <span className={styles.tag}>{tag}</span> : null}
          <h2 className={`${styles.heading} animate-on-scroll`}>{heading}</h2>
        </div>
      </div>

      <div className={styles.list}>
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item._id}
              className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
            >
              <button
                type="button"
                className={styles.question}
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item._id}`}
              >
                <span className={styles.num}>{pad(i)}</span>
                <span className={styles.qText}>{item.question}</span>
                <svg
                  className={styles.icon}
                  viewBox="0 0 12 18"
                  aria-hidden
                >
                  <path
                    d="M6.60449 8.39551H12V9.59473H6.60449V15H5.40527V9.59473H0V8.39551H5.40527V3H6.60449V8.39551Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <div
                id={`faq-answer-${item._id}`}
                className={styles.answer}
                role="region"
              >
                <div className={styles.answerInner}>
                  <ProseFromPortableText value={item.answer} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
