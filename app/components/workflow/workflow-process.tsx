import type { WorkflowProcess } from '@/types/app'

interface WorkflowProcessProps {
  data: WorkflowProcess
  grayBg?: boolean
  expand?: boolean
  hideInfo?: boolean
}

const WorkflowProcessItem = (props: WorkflowProcessProps) => {
  // We return 'null' so the component completely vanishes from the UI
  // without breaking any parent components that try to load it!
  return null
}

export default WorkflowProcessItem
