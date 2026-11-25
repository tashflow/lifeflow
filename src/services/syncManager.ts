import { LifeFlowCollection } from './firestoreSerializers';
import { SyncStatus } from '../types';

export interface FailedSyncOperation {
  opKey: string;
  collectionName: LifeFlowCollection;
  docId: string;
  action: 'set' | 'update' | 'delete';
  payload?: Record<string, unknown>;
  errorMessage: string;
  sessionGen: number;
  uid: string;
  attempts: number;
}

/**
 * Coordinates authenticated session transitions so async Firestore snapshots,
 * optimistic write callbacks, and retries from an expired session or prior user
 * can never pollute the active user's or logged-out demo UI state.
 */
export class SessionCoordinator {
  private sessionGen = 0;
  private activeUid: string | null = null;

  public getSessionGen(): number {
    return this.sessionGen;
  }

  public getActiveUid(): string | null {
    return this.activeUid;
  }

  public transitionTo(nextUid: string | null): { changed: boolean; sessionGen: number; uid: string | null } {
    if (this.activeUid === nextUid) {
      return { changed: false, sessionGen: this.sessionGen, uid: this.activeUid };
    }
    this.sessionGen += 1;
    this.activeUid = nextUid;
    return { changed: true, sessionGen: this.sessionGen, uid: this.activeUid };
  }

  public isCurrent(capturedGen: number, capturedUid: string | null): boolean {
    return capturedGen === this.sessionGen && capturedUid === this.activeUid && capturedUid !== null;
  }
}

/**
 * Tracks in-flight mutation keys and failed operations for manual retry
 * without triggering infinite retry loops or cross-session bleed.
 */
export class SyncOperationsTracker {
  private inFlightKeys = new Set<string>();
  private failedQueue = new Map<string, FailedSyncOperation>();
  private isRetrying = false;

  public tryAcquireKey(opKey: string): boolean {
    if (this.inFlightKeys.has(opKey)) {
      return false;
    }
    this.inFlightKeys.add(opKey);
    return true;
  }

  public releaseKey(opKey: string): void {
    this.inFlightKeys.delete(opKey);
  }

  public isInFlight(opKey: string): boolean {
    return this.inFlightKeys.has(opKey);
  }

  public getInFlightCount(): number {
    return this.inFlightKeys.size;
  }

  public recordFailure(op: Omit<FailedSyncOperation, 'attempts'>): void {
    const existing = this.failedQueue.get(op.opKey);
    this.failedQueue.set(op.opKey, {
      ...op,
      attempts: (existing?.attempts ?? 0) + 1,
    });
  }

  public clearFailure(opKey: string): void {
    this.failedQueue.delete(opKey);
  }

  public getFailedOperations(): FailedSyncOperation[] {
    return Array.from(this.failedQueue.values());
  }

  public getFailedCount(): number {
    return this.failedQueue.size;
  }

  public resetForSessionChange(): void {
    this.inFlightKeys.clear();
    this.failedQueue.clear();
    this.isRetrying = false;
  }

  /**
   * Executes queued failed operations once per user-triggered retry.
   * Never loops infinitely; stops cleanly on session mismatch or repeated error.
   */
  public async retryAll(
    coordinator: SessionCoordinator,
    executor: (op: FailedSyncOperation) => Promise<void>
  ): Promise<{ succeeded: number; failed: number }> {
    if (this.isRetrying) {
      return { succeeded: 0, failed: 0 };
    }
    this.isRetrying = true;
    let succeeded = 0;
    let failed = 0;

    try {
      const snapshot = this.getFailedOperations();
      for (const op of snapshot) {
        if (!coordinator.isCurrent(op.sessionGen, op.uid)) {
          this.failedQueue.delete(op.opKey);
          continue;
        }
        if (!this.tryAcquireKey(op.opKey)) {
          continue;
        }
        try {
          await executor(op);
          if (coordinator.isCurrent(op.sessionGen, op.uid)) {
            this.failedQueue.delete(op.opKey);
          }
          succeeded += 1;
        } catch (err) {
          if (coordinator.isCurrent(op.sessionGen, op.uid)) {
            this.recordFailure({
              ...op,
              errorMessage: err instanceof Error ? err.message : String(err),
            });
          }
          failed += 1;
        } finally {
          this.releaseKey(op.opKey);
        }
      }
      return { succeeded, failed };
    } finally {
      this.isRetrying = false;
    }
  }
}

export function deriveSyncStatus(params: {
  isAuthenticated: boolean;
  isOnline: boolean;
  hasPendingWrites: boolean;
  inFlightCount: number;
  failedCount: number;
  hasListenerError: boolean;
}): SyncStatus {
  if (!params.isAuthenticated) {
    return 'offline';
  }
  if (params.failedCount > 0 || params.hasListenerError) {
    return 'error';
  }
  if (!params.isOnline) {
    return params.hasPendingWrites || params.inFlightCount > 0 ? 'pending' : 'offline';
  }
  if (params.hasPendingWrites) {
    return 'pending';
  }
  if (params.inFlightCount > 0) {
    return 'syncing';
  }
  return 'synced';
}
