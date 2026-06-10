import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { useAuth } from '../contexts/AuthContext';
import { useTaskContext } from '../contexts/TaskContext';
import { getWeeksForMonth } from '../data/utils';
import DayCell from './DayCell';
import { formatMonthKey, formatWeekKey } from '../data/utils';

interface Props {
  year: number;
  month: number;
  onBack: () => void;
  onNavigate: (year: number, month: number) => void;
}

const DAY_HEADERS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function MonthlyView({ year, month, onBack, onNavigate }: Props) {
  const { isAdmin } = useAuth();
  const { monthTitles, setMonthTitle, weekTitles, setWeekTitle } = useTaskContext();
  const [openWeeks, setOpenWeeks] = useState<string[]>([`week-0`]);

  const weeks = getWeeksForMonth(year, month);
  const monthKey = formatMonthKey(year, month);

  const canGoPrev = year > 2026 || (year === 2026 && month > 5);
  const canGoNext = year < 2027 || (year === 2027 && month < 5);

  const handlePrev = () => {
    if (!canGoPrev) return;
    const d = new Date(year, month - 1, 1);
    onNavigate(d.getFullYear(), d.getMonth());
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const d = new Date(year, month + 1, 1);
    onNavigate(d.getFullYear(), d.getMonth());
  };

  const monthName = format(new Date(year, month, 1), 'MMMM', { locale: es });
  const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Volver a vista anual
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`p-1 rounded transition cursor-pointer ${
                canGoPrev ? 'text-white hover:bg-white/20' : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="text-lg font-bold">{monthNameCapitalized} {year}</h2>

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-1 rounded transition cursor-pointer ${
                canGoNext ? 'text-white hover:bg-white/20' : 'text-white/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {isAdmin && (
            <input
              value={monthTitles[monthKey] || ''}
              onChange={e => setMonthTitle(monthKey, e.target.value)}
              placeholder="Título del mes..."
              className="px-2 py-1 text-xs text-gray-800 bg-white rounded border border-gray-300 focus:ring-1 focus:ring-indigo-400 outline-none w-40"
            />
          )}
          {!isAdmin && <div className="w-40" />}
        </div>
      </header>

      <div className="p-4">
        <Accordion.Root
          type="multiple"
          value={openWeeks}
          onValueChange={setOpenWeeks}
          className="space-y-2"
        >
          {weeks.map((week, idx) => {
            const weekStart = week[0];
            const weekEnd = week[6];
            const weekKey = formatWeekKey(year, month, idx + 1);
            const weekTitle = weekTitles[weekKey] || '';

            return (
              <Accordion.Item
                key={`week-${idx}`}
                value={`week-${idx}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <ChevronDown size={16} className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                      <span className="font-semibold text-sm text-gray-700">
                        Semana {idx + 1}:{' '}
                        {format(weekStart, 'dd MMM', { locale: es })} –{' '}
                        {format(weekEnd, 'dd MMM', { locale: es })}
                      </span>
                      {isAdmin && (
                        <input
                          value={weekTitle}
                          onChange={e => setWeekTitle(weekKey, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          placeholder="Título de la semana..."
                          className="px-2 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-400 outline-none w-36"
                        />
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {week.filter(d => d.getMonth() === month).length} días
                    </span>
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                  <div className="p-3 border-t border-gray-100">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAY_HEADERS.map((header, i) => (
                        <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">
                          {header}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {week.map((day, i) => (
                        <DayCell
                          key={i}
                          date={day}
                          isCurrentMonth={day.getMonth() === month}
                        />
                      ))}
                    </div>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </div>
    </div>
  );
}
