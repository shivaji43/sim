'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { Home as HomeIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebarStore } from '@/stores/sidebar/store'
import { loadWorkflowState } from '@/stores/workflows/persistence'
import { useWorkflowRegistry } from '@/stores/workflows/registry/store'
import { WorkflowMetadata } from '@/stores/workflows/registry/types'
import { fetchWorkflowsFromDB } from '@/stores/workflows/sync'
import { WorkflowPreview } from '@/app/w/components/workflow-preview/workflow-preview'

interface WorkflowWithState extends WorkflowMetadata {
  state: {
    blocks: Record<string, any>
    edges: any[]
    loops: Record<string, any>
  }
}

export default function Home() {
  const params = useParams()
  const router = useRouter()
  const {
    workflows,
    activeWorkspaceId,
    setActiveWorkspace,
    isLoading: registryLoading,
  } = useWorkflowRegistry()

  const [searchQuery, setSearchQuery] = useState('')
  const [workflowsWithState, setWorkflowsWithState] = useState<WorkflowWithState[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const { mode, isExpanded } = useSidebarStore()
  const isSidebarCollapsed =
    mode === 'expanded' ? !isExpanded : mode === 'collapsed' || mode === 'hover'

  // Check if we navigated to a specific workspace ID and need to update the active workspace
  useEffect(() => {
    const paramId = params?.id as string | undefined

    // If there's a workspace ID in the URL and it's different from the active workspace ID
    if (paramId && paramId !== activeWorkspaceId && !registryLoading) {
      // Set the active workspace in the registry
      setActiveWorkspace(paramId)
    }
  }, [params, activeWorkspaceId, setActiveWorkspace, registryLoading])

  // Load workflows from current workspace
  useEffect(() => {
    if (registryLoading) {
      // Wait for registry to finish loading
      return
    }

    setIsLoading(true)

    // Make sure we have the latest workflows from the server
    const loadWorkflows = async () => {
      try {
        // Try to refresh workflows from the database first
        await fetchWorkflowsFromDB()

        // Now get the current state from the registry
        const currentWorkflows = useWorkflowRegistry.getState().workflows
        const currentWorkspaceId = useWorkflowRegistry.getState().activeWorkspaceId

        // Filter workflows by workspace
        const filteredWorkflows = Object.values(currentWorkflows).filter(
          (workflow) => workflow.workspaceId === currentWorkspaceId || !workflow.workspaceId
        )

        // Sort by last modified date (newest first)
        filteredWorkflows.sort((a, b) => {
          const dateA =
            a.lastModified instanceof Date
              ? a.lastModified.getTime()
              : new Date(a.lastModified).getTime()
          const dateB =
            b.lastModified instanceof Date
              ? b.lastModified.getTime()
              : new Date(b.lastModified).getTime()
          return dateB - dateA
        })

        // Load state for each workflow
        const workflowsWithStateData = filteredWorkflows.map((workflow) => {
          const state = loadWorkflowState(workflow.id) || { blocks: {}, edges: [], loops: {} }
          return {
            ...workflow,
            state,
          }
        })

        setWorkflowsWithState(workflowsWithStateData)
      } catch (error) {
        console.error('Error loading workflows:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflows()
  }, [registryLoading, activeWorkspaceId])

  // Filter workflows based on search query
  const filteredWorkflows = searchQuery
    ? workflowsWithState.filter(
        (workflow) =>
          workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workflowsWithState

  return (
    <div
      className={`flex flex-col h-screen transition-all duration-200 ${isSidebarCollapsed ? 'pl-14' : 'pl-60'}`}
    >
      {/* Top left home icon */}
      <div className="flex items-center pt-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted rounded-md px-[4px] py-1 cursor-pointer">
          <HomeIcon className="h-[16px] w-[16px]" />
          <span>Home</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-28">
        {/* Navigation section with title and search */}
        <div className="flex items-center justify-between pt-6 pb-6">
          <h1 className="text-2xl font-semibold">Home</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-background"
            />
          </div>
        </div>

        {/* Workflows grid */}
        <div className="pb-8">
          {isLoading || registryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col">
                  <div className="overflow-hidden rounded-lg border">
                    <Skeleton className="h-[180px] w-full" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <Skeleton className="h-3 w-3 rounded-full mr-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p>No workflows found</p>
              <p className="text-sm mt-2">
                {searchQuery ? 'Try a different search term' : 'Create a workflow to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow) => (
                <Link key={workflow.id} href={`/w/${workflow.id}`} className="block">
                  <div className="flex flex-col">
                    <div className="overflow-hidden rounded-lg border hover:shadow-md transition-shadow">
                      {/* Workflow preview area */}
                      <div className="h-[220px] bg-muted/30">
                        <WorkflowPreview
                          workflowState={workflow.state}
                          showSubBlocks={true}
                          height="220px"
                          width="100%"
                        />
                      </div>
                    </div>
                    {/* Workflow name below the card */}
                    <div className="mt-2 flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: workflow.color || '#94a3b8' }}
                      />
                      <h3 className="font-medium text-sm truncate" title={workflow.name}>
                        {workflow.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
