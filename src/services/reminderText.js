export function getReminderText(task, cycle) {
  const customText = task.reminderText?.trim();
  if (customText) return customText;

  return `Time to check in: ${task.name} (Cycle ${cycle})`;
}
