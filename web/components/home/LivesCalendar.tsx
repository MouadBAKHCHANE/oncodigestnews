'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './LivesCalendar.module.css';

export interface LiveEvent {
  _id: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  registrationUrl?: string | null;
  speakerLine?: string | null;
  description?: string | null;
}

interface LivesCalendarProps {
  /** All upcoming + recent lives, sorted oldest → newest. */
  events: LiveEvent[];
  /** Optional anchor month/year to start on. Defaults to today's month. */
  initialDate?: Date;
}

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTH_NAMES = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildMonthGrid(viewYear: number, viewMonth: number): Date[] {
  // Returns 42 dates: previous-month overflow + current month + next-month overflow.
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // Mon=1, Sun=0 → convert so week starts on Monday
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(viewYear, viewMonth, 1 - firstWeekday);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

export function LivesCalendar({ events, initialDate }: LivesCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const seed = initialDate ?? today;

  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Index events by yyyy-mm-dd for O(1) lookup per day cell.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, LiveEvent[]>();
    for (const event of events) {
      const d = startOfDay(new Date(event.startsAt));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(event);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const nextUpcoming = useMemo(() => {
    return events
      .map((e) => ({ e, t: new Date(e.startsAt).getTime() }))
      .filter(({ t }) => t >= today.getTime())
      .sort((a, b) => a.t - b.t)
      .map(({ e }) => e)[0];
  }, [events, today]);

  const eventsForDay = (d: Date): LiveEvent[] =>
    eventsByDay.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? [];

  const eventsToShow: LiveEvent[] = selectedDay
    ? eventsForDay(selectedDay)
    : nextUpcoming
      ? [nextUpcoming]
      : [];

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(null);
  }

  return (
    <div className={`${styles.calendar} animate-on-scroll`}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => shiftMonth(-1)}
          aria-label="Mois précédent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h3 className={styles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => shiftMonth(1)}
          aria-label="Mois suivant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.grid} role="grid">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={styles.weekday} aria-hidden>
            {wd}
          </div>
        ))}

        {cells.map((d, i) => {
          const inMonth = d.getMonth() === viewMonth;
          const isToday = isSameDay(d, today);
          const dayEvents = eventsForDay(d);
          const hasEvent = dayEvents.length > 0;
          const isSelected = selectedDay && isSameDay(d, selectedDay);

          const cls = [
            styles.day,
            !inMonth && styles.dayOutside,
            isToday && styles.dayToday,
            hasEvent && styles.dayHasEvent,
            isSelected && styles.daySelected,
          ]
            .filter(Boolean)
            .join(' ');

          if (!hasEvent) {
            return (
              <div
                key={i}
                className={cls}
                aria-disabled
                role="gridcell"
                aria-label={d.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              >
                <span className={styles.dayNum}>{d.getDate()}</span>
              </div>
            );
          }

          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => setSelectedDay(d)}
              aria-pressed={!!isSelected}
              aria-label={`${dayEvents.length} live${dayEvents.length > 1 ? 's' : ''} le ${d.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}`}
              role="gridcell"
            >
              <span className={styles.dayNum}>{d.getDate()}</span>
              <span className={styles.dot} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className={styles.eventsPanel}>
        {eventsToShow.length === 0 ? (
          <p className={styles.empty}>Aucun live prévu pour ce mois.</p>
        ) : (
          eventsToShow.map((event) => <LiveEventCard key={event._id} event={event} />)
        )}
      </div>
    </div>
  );
}

function LiveEventCard({ event }: { event: LiveEvent }) {
  const start = new Date(event.startsAt);
  const dateStr = start.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = start.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.eventCard}>
      <p className={styles.eventDate}>
        {dateStr} · {timeStr}
        {event.durationMinutes ? ` · ${event.durationMinutes} min` : ''}
      </p>
      <h4 className={styles.eventTitle}>{event.title}</h4>
      {event.speakerLine ? (
        <p className={styles.eventSpeaker}>{event.speakerLine}</p>
      ) : null}
      {event.description ? (
        <p className={styles.eventDescription}>{event.description}</p>
      ) : null}
      {event.registrationUrl ? (
        <Button
          href={event.registrationUrl}
          variant="dark"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.eventCta}
        >
          S&apos;inscrire au live
        </Button>
      ) : null}
    </div>
  );
}
