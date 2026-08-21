export const TASK_ACTIVITY_READER = Symbol('TASK_ACTIVITY_READER');

// Narrow cross-module read port; consumers do not depend on task persistence details.
export interface TaskActivityReader {
  findDealIdsWithOpenTasks(tenantId: string, dealIds: string[]): Promise<Set<string>>;
}
