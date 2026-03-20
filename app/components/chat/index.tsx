'use client'
import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import FileUploaderInAttachmentWrapper from '@/app/components/base/file-uploader-in-attachment'
import type { FileEntity, FileUpload } from '@/app/components/base/file-uploader-in-attachment/types'
import { getProcessedFiles } from '@/app/components/base/file-uploader-in-attachment/utils'

export interface IChatProps {
  chatList: ChatItem[]
  feedbackDisabled?: boolean
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
  fileConfig?: FileUpload
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
  controlClearQuery,
  visionConfig,
  fileConfig,
}) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const isUseInputMethod = useRef(false)

  const [query, setQuery] = React.useState('')
  const queryRef = useRef('')

  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
    queryRef.current = value
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = () => {
    const query = queryRef.current
    if (!query || query.trim() === '') {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery) {
      setQuery('')
      queryRef.current = ''
    }
  }, [controlClearQuery])
  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const [attachmentFiles, setAttachmentFiles] = React.useState<FileEntity[]>([])

  const handleSend = () => {
    if (!valid() || (checkCanSend && !checkCanSend())) { return }
    const imageFiles: VisionFile[] = files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    }))
    const docAndOtherFiles: VisionFile[] = getProcessedFiles(attachmentFiles)
    const combinedFiles: VisionFile[] = [...imageFiles, ...docAndOtherFiles]
    onSend(queryRef.current, combinedFiles)

    // Original stable clearing logic
    if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
      if (files.length) { onClear() }
      if (!isResponding) {
        setQuery('')
        queryRef.current = ''
      }
    }
    if (!attachmentFiles.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)) { setAttachmentFiles([]) }
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      if (!e.shiftKey && !isUseInputMethod.current) { handleSend() }
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      const result = query.replace(/\n$/, '')
      setQuery(result)
      queryRef.current = result
      e.preventDefault()
    }
  }

  const suggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    queryRef.current = suggestion
    handleSend()
  }

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'h-full pb-32')}>
      {/* Chat List */}
      <div className="h-full space-y-[30px]">
        {chatList.map((item) => {
          if (item.isAnswer) {
            const isLast = item.id === chatList[chatList.length - 1].id
            return <Answer
              key={item.id}
              item={item}
              feedbackDisabled={feedbackDisabled}
              onFeedback={onFeedback}
              isResponding={isResponding && isLast}
              suggestionClick={suggestionClick}
            />
          }
          return (
            <Question
              key={item.id}
              id={item.id}
              content={item.content}
              useCurrentUserAvatar={useCurrentUserAvatar}
              imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
            />
          )
        })}
      </div>

      {/* --- PREMIUM GEMINI-STYLE CANVAS --- */}
      {
        !isHideSendInput && (
          <div className='fixed z-20 bottom-8 left-1/2 transform -translate-x-1/2 pc:ml-[122px] tablet:ml-[96px] mobile:ml-0 pc:w-[794px] tablet:w-[794px] max-w-full mobile:w-full px-4'>

            <div className='relative flex flex-col p-2 pl-4 pr-2 bg-[#1a1d24]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.5)] transition-all'>

              <style>{`
                /* Borderless Canvas Text Area */
                .textarea-canvas {
                   background: transparent !important;
                   border: none !important;
                   box-shadow: none !important;
                   scrollbar-width: none;
                }
                .textarea-canvas::-webkit-scrollbar {
                   display: none;
                }
                .textarea-canvas:focus {
                   outline: none !important;
                   box-shadow: none !important;
                }
              `}</style>

              {/* Top Row: File Lists */}
              <div className="w-full flex flex-col uploader-zone">
                <div className="flex items-center gap-1 pt-1">
                  {visionConfig?.enabled && (
                    <ChatImageUploader settings={visionConfig} onUpload={onUpload} disabled={files.length >= visionConfig.number_limits} />
                  )}
                  {fileConfig?.enabled && (
                    <FileUploaderInAttachmentWrapper fileConfig={fileConfig} value={attachmentFiles} onChange={setAttachmentFiles} />
                  )}
                </div>

                {/* Dify's ImageList */}
                {files.length > 0 && (
                  <div className='mt-2'>
                    <ImageList list={files} onRemove={onRemove} onReUpload={onReUpload} onImageLinkLoadSuccess={onImageLinkLoadSuccess} onImageLinkLoadError={onImageLinkLoadError} />
                  </div>
                )}
              </div>

              {/* Bottom Row: Seamless Text Area & Send Button */}
              <div className="flex items-end gap-2 mt-1">
                <Textarea
                  className='textarea-canvas flex-grow block w-full py-2 text-[15px] leading-relaxed max-h-[150px] overflow-y-auto text-gray-100 placeholder-gray-500 resize-none'
                  placeholder="Zadejte svůj požadavek..."
                  value={query}
                  onChange={handleContentChange}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyDown}
                  autoSize
                />

                <div className="pb-1 pr-1 flex items-center shrink-0">
                  <Tooltip selector='send-tip' htmlContent={<div className="text-xs"><div>Odeslat: <span className="font-bold text-[#FFD60A]">Enter</span></div></div>}>
                    <div className={`w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-[#FFD60A] hover:bg-[#e5c009] text-black shadow-lg transition-transform transform hover:scale-105 ${!query.trim() && files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleSend}>
                      {/* Custom Paper Airplane Icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '-2px', marginTop: '1px' }}>
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </div>
                  </Tooltip>
                </div>
              </div>

            </div>
          </div>
        )
      }
    </div>
  )
}

export default React.memo(Chat)
