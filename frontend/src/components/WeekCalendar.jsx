function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDay(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function WeekCalendar({ selectedDay, onSelectDay, plannedCountsByDate = {} }) {
  const start = (() => {
    const d = new Date(selectedDay);
    const day = d.getDay(); // 0 Sun..6 Sat
    const mondayOffset = ((day + 6) % 7); // make Monday start
    return addDays(d, -mondayOffset);
  })();

  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="text-sm font-medium text-gray-900 mb-2">This Week</div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isActive = d.toDateString() === selectedDay.toDateString();
          const key = d.toISOString().slice(0,10);
          const plannedCount = plannedCountsByDate[key] || 0;
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelectDay(d)}
              className={`px-2 py-3 rounded-md text-xs text-center border transition-colors ${
                isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {formatDay(d)}
              {plannedCount > 0 && (
                <div className="mt-1 text-[10px] text-indigo-700">{plannedCount} planned</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WeekCalendar;


