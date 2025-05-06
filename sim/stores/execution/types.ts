import { Executor } from '@/executor'
import { ExecutionContext } from '@/executor/types'

export interface ExecutionState {
  activeBlockIds: Set<string>
  isExecuting: boolean
  isDebugging: boolean
  /**
   * Indicates that a cancellation has been requested for the current workflow execution.  
   * When this flag becomes true the executor should abort as soon as possible and   
   * callers must ensure that no logs are persisted for the cancelled run.
   */
  isCancellationRequested: boolean
  pendingBlocks: string[]
  executor: Executor | null
  debugContext: ExecutionContext | null
  /**
   * Keeps track of execution IDs that have been cancelled
   * Used to prevent entries from cancelled executions appearing in the console
   */
  cancelledExecutionIds: Set<string>
}

export interface ExecutionActions {
  setActiveBlocks: (blockIds: Set<string>) => void
  setIsExecuting: (isExecuting: boolean) => void
  setIsDebugging: (isDebugging: boolean) => void
  /**
   * Sets the cancellation flag signalling any executors to abort execution.
   */
  setIsCancellationRequested: (isCancellationRequested: boolean) => void
  setPendingBlocks: (blockIds: string[]) => void
  setExecutor: (executor: Executor | null) => void
  setDebugContext: (context: ExecutionContext | null) => void
  /**
   * Adds an execution ID to the cancelled executions list
   */
  addCancelledExecutionId: (executionId: string) => void
  /**
   * Checks if an execution ID has been cancelled
   */
  isExecutionCancelled: (executionId: string) => boolean
  reset: () => void
}

export const initialState: ExecutionState = {
  activeBlockIds: new Set(),
  isExecuting: false,
  isDebugging: false,
  isCancellationRequested: false,
  pendingBlocks: [],
  executor: null,
  debugContext: null,
  cancelledExecutionIds: new Set(),
}
