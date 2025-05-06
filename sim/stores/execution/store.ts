import { create } from 'zustand'
import { ExecutionActions, ExecutionState, initialState } from './types'

export const useExecutionStore = create<ExecutionState & ExecutionActions>()((set, get) => ({
  ...initialState,

  setActiveBlocks: (blockIds) => set({ activeBlockIds: new Set(blockIds) }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setIsDebugging: (isDebugging) => set({ isDebugging }),
  setIsCancellationRequested: (isCancellationRequested) => set({ isCancellationRequested }),
  setPendingBlocks: (pendingBlocks) => set({ pendingBlocks }),
  setExecutor: (executor) => set({ executor }),
  setDebugContext: (debugContext) => set({ debugContext }),
  addCancelledExecutionId: (executionId) => set((state) => ({
    cancelledExecutionIds: new Set([...state.cancelledExecutionIds, executionId])
  })),
  isExecutionCancelled: (executionId) => get().cancelledExecutionIds.has(executionId),
  reset: () => set(initialState),
}))
