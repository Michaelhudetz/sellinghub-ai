'use client'
import type { FC } from 'react'
import type { FeedbackFunc } from '../type'
import type { ChatItem, MessageRating, VisionFile } from '@/types/app'
import type { Emoji } from '@/types/tools'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/app/components/base/button'
import StreamdownMarkdown from '@/app/components/base/streamdown-markdown'
import Tooltip from '@/app/components/base/tooltip'
import WorkflowProcess from '@/app/components/workflow/workflow-process'
import { randomString } from '@/utils/string'
import ImageGallery from '../../base/image-gallery'
import LoadingAnim from '../loading-anim'
import Thought from '../thought'

function OperationBtn({ innerContent, onClick, className }: { innerContent: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <div
      className={`relative box-border flex items-center justify-center h-11 w-11 p-2 rounded-lg bg-[#1a1d24]/60 backdrop-blur-md border border-white/5 cursor-pointer text-gray-400 hover:text-[#FFD60A] hover:border-[#FFD60A]/30 transition-all ${className ?? ''}`}
      onClick={onClick && onClick}
    >
      {innerContent}
    </div>
  )
}

const RatingIcon: FC<{ isLike: boolean }> = ({ isLike }) => {
  return isLike ? <HandThumbUpIcon className="w-4 h-4" /> : <HandThumbDownIcon className="w-4 h-4" />
}

const IconWrapper: FC<{ children: React.ReactNode | string }> = ({ children }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      {children}
    </div>
  )
}

interface IAnswerProps {
  item: ChatItem
  feedbackDisabled: boolean
  onFeedback?: FeedbackFunc
  isResponding?: boolean
  allToolIcons?: Record<string, string | Emoji>
  suggestionClick?: (suggestion: string) => void
}

const Answer: FC<IAnswerProps> = ({
  item,
  feedbackDisabled = false,
  onFeedback,
  isResponding,
  allToolIcons,
  suggestionClick = () => { },
}) => {
  const { id, content, feedback, agent_thoughts, workflowProcess, suggestedQuestions = [] } = item
  const isAgentMode = !!agent_thoughts && agent_thoughts.length > 0
  const { t } = useTranslation()

  const renderFeedbackRating = (rating: MessageRating | undefined) => {
    if (!rating) { return null }
    const isLike = rating === 'like'
    const ratingColor = isLike ? 'text-[#FFD60A] bg-[#FFD60A]/10 border-[#FFD60A]/30' : 'text-red-400 bg-red-400/10 border-red-400/30'

    return (
      <Tooltip selector={`user-feedback-${randomString(16)}`} content={isLike ? 'Zrušit hodnocení' : 'Zrušit hodnocení'}>
        <div
          className={`relative box-border flex items-center justify-center h-11 w-11 p-2 rounded-lg border cursor-pointer transition-all ${ratingColor}`}
          onClick={async () => { await onFeedback?.(id, { rating: null }) }}
        >
          <div className={'rounded-lg h-6 w-6 flex items-center justify-center'}>
            <RatingIcon isLike={isLike} />
          </div>
        </div>
      </Tooltip>
    )
  }

  const renderItemOperation = () => {
    const userOperation = () => {
      return feedback?.rating
        ? null
        : (
          <div className="flex gap-2 opacity-60 pc:opacity-0 pc:group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip selector={`user-feedback-${randomString(16)}`} content={t('common.operation.like') as string}>
              {OperationBtn({ innerContent: <IconWrapper><RatingIcon isLike={true} /></IconWrapper>, onClick: () => onFeedback?.(id, { rating: 'like' }) })}
            </Tooltip>
            <Tooltip selector={`user-feedback-${randomString(16)}`} content={t('common.operation.dislike') as string}>
              {OperationBtn({ innerContent: <IconWrapper><RatingIcon isLike={false} /></IconWrapper>, onClick: () => onFeedback?.(id, { rating: 'dislike' }) })}
            </Tooltip>
          </div>
        )
    }
    return (
      <div className={'flex gap-2 mt-2'}>
        {userOperation()}
      </div>
    )
  }

  const getImgs = (list?: VisionFile[]) => {
    if (!list) { return [] }
    return list.filter(file => file.type === 'image' && file.belongs_to === 'assistant')
  }

  const agentModeAnswer = (
    <div className="space-y-4">
      {agent_thoughts?.map((item, index) => (
        <div key={index}>
          {item.thought && <StreamdownMarkdown content={item.thought} />}
          {!!item.tool && (
            <Thought thought={item} allToolIcons={allToolIcons || {}} isFinished={!!item.observation || !isResponding} />
          )}
          {getImgs(item.message_files).length > 0 && (
            <ImageGallery srcs={getImgs(item.message_files).map(item => item.url)} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div key={id} className="mb-10 w-full group">
      <div className="flex items-start w-full">

        {/* The Custom Circular AI Avatar */}
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full border border-white/10 shadow-lg relative overflow-hidden mt-1 bg-[#0c0e12]">
          {isResponding && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <LoadingAnim type="avatar" />
            </div>
          )}
          <img src="/assets/Sellinghub-AI-icon.png" alt="Sellinghub AI" className="w-full h-full object-cover" />
        </div>

        {/* The Text Body */}
        <div className="ml-4 max-w-[calc(100%-3rem)] flex-grow">
          <div className="relative text-[15px] text-gray-200 font-light tracking-wide leading-relaxed">

            <div className="py-1 w-full min-w-0">
              {workflowProcess && <WorkflowProcess data={workflowProcess} hideInfo />}

              {(isResponding && (isAgentMode ? (!content && (agent_thoughts || []).filter(item => !!item.thought || !!item.tool).length === 0) : !content))
                ? (
                  <div className="flex items-center justify-start w-6 h-6 mt-1 opacity-50">
                    <LoadingAnim type="text" />
                  </div>
                )
                : (isAgentMode ? agentModeAnswer : <StreamdownMarkdown content={content} />)
              }

              {suggestedQuestions.length > 0 && (
                <div className="mt-5">
                  <div className="flex gap-2 flex-wrap">
                    {suggestedQuestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center">
                        <Button className="text-sm bg-transparent border border-white/10 text-[#FFD60A] hover:bg-[#FFD60A]/10 transition-colors" type="default" onClick={() => suggestionClick(suggestion)}>
                          {suggestion}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="flex flex-row items-center justify-start gap-2 mt-1 h-8">
              {!feedbackDisabled && !item.feedbackDisabled && renderItemOperation()}
              {!feedbackDisabled && renderFeedbackRating(feedback?.rating)}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(Answer)
