// Task lifecycle states.
export enum TaskStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  DONE = 'Done',
  CANCELLED = 'Cancelled'
}

// Task priority levels.
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}
