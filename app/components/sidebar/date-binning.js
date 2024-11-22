import { format, isAfter, isThisWeek, isThisYear, isToday, isYesterday, subDays } from 'date-fns';
export function binDates(_list) {
    const list = _list.toSorted((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const binLookup = {};
    const bins = [];
    list.forEach((item) => {
        const category = dateCategory(new Date(item.timestamp));
        if (!(category in binLookup)) {
            const bin = {
                category,
                items: [item],
            };
            binLookup[category] = bin;
            bins.push(bin);
        }
        else {
            binLookup[category].items.push(item);
        }
    });
    return bins;
}
function dateCategory(date) {
    if (isToday(date)) {
        return 'Today';
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    if (isThisWeek(date)) {
        // e.g., "Monday"
        return format(date, 'eeee');
    }
    const thirtyDaysAgo = subDays(new Date(), 30);
    if (isAfter(date, thirtyDaysAgo)) {
        return 'Last 30 Days';
    }
    if (isThisYear(date)) {
        // e.g., "July"
        return format(date, 'MMMM');
    }
    // e.g., "July 2023"
    return format(date, 'MMMM yyyy');
}
