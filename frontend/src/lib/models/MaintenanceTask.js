export class MaintenanceTask {
  constructor({
    taskName,
    description = "",
    intervalDays = null,
    lastCompletedDate = null,
  }) {
    this.taskName = taskName;
    this.description = description;
    this.intervalDays = intervalDays;
    this.lastCompletedDate = lastCompletedDate
      ? new Date(lastCompletedDate)
      : null;
  }

  markComplete() {
    this.lastCompletedDate = new Date();
  }

  nextDueDate() {
    if (!this.intervalDays) return null;
    if (!this.lastCompletedDate) return null;

    const next = new Date(this.lastCompletedDate);
    next.setDate(next.getDate() + this.intervalDays);
    return next;
  }

  isOverdue() {
    const due = this.nextDueDate();
    if (!due) return false;
    return new Date() > due;
  }

  daysUntilDue() {
    const due = this.nextDueDate();
    if (!due) return null;

    const diff = due - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    // helpful for sending to backend
    return {
      taskName: this.taskName,
      description: this.description,
      intervalDays: this.intervalDays,
      lastCompletedDate: this.lastCompletedDate,
    };
  }
}
