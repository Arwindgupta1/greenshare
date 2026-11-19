// The library only accepts bookings for these three days.
export const borrowingDays = [
	{ value: "2027-02-01", label: "1 February 2027" },
	{ value: "2027-02-02", label: "2 February 2027" },
	{ value: "2027-02-03", label: "3 February 2027" },
];

// Equipment is split into two groups.
export const equipmentGroups = [
	{ value: "tool", label: "Tool" },
	{ value: "sustainability", label: "Sustainability Equipment" },
];

// Check whether the selected date is allowed.
export function isBorrowingDay(date) {
	for (const day of borrowingDays) {
		if (day.value === date) {
			return true;
		}
	}

	return false;
}

// Check whether the equipment group is valid.
export function isEquipmentGroup(group) {
	for (const item of equipmentGroups) {
		if (item.value === group) {
			return true;
		}
	}

	return false;
}
