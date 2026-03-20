'use client'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TemplateVarPanel, { PanelTitle, VarOpBtnGroup } from '../value-panel'
import FileUploaderInAttachmentWrapper from '../base/file-uploader-in-attachment'
import s from './style.module.css'
import { AppInfoComp, EditBtn, PromptTemplate } from './massive-component'
import type { AppInfo, PromptConfig } from '@/types/app'
import Toast from '@/app/components/base/toast'
import { DEFAULT_VALUE_MAX_LEN } from '@/config'

const regex = /\{\{([^}]+)\}\}/g

export interface IWelcomeProps {
  conversationName: string
  hasSetInputs: boolean
  isPublicVersion: boolean
  siteInfo: AppInfo
  promptConfig: PromptConfig
  onStartChat: (inputs: Record<string, any>) => void
  canEditInputs: boolean
  savedInputs: Record<string, any>
  onInputsChange: (inputs: Record<string, any>) => void
}

const Welcome: FC<IWelcomeProps> = ({
  conversationName,
  hasSetInputs,
  isPublicVersion,
  siteInfo,
  promptConfig,
  onStartChat,
  canEditInputs,
  savedInputs,
  onInputsChange,
}) => {
  const { t } = useTranslation()
  const hasVar = promptConfig.prompt_variables.length > 0
  const [isFold, setIsFold] = useState<boolean>(true)

  // Rotating Tips State
  const [tipIndex, setTipIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const proTips = [
    'Vyplnění formuláře je volitelné. Můžete rovnou začít chatovat.',
    'Nahráním fotografie nemovitosti získáte přesnější text.',
    'Zmiňte specifika lokality, AI je chytře zapracuje.',
    'Specifikujte cílovou skupinu pro ideální tón.',
  ]

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setIsTyping(false)
    }, 5000)

    const switchTimer = setTimeout(() => {
      setTipIndex(prev => (prev + 1) % proTips.length)
      setIsTyping(true)
    }, 5500)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(switchTimer)
    }
  }, [tipIndex])

  // THE FIX: Strict state initialization
  const [inputs, setInputs] = useState<Record<string, any>>((() => {
    if (hasSetInputs) { return savedInputs }
    const res: Record<string, any> = {}
    if (promptConfig) {
      promptConfig.prompt_variables.forEach((item) => {
        if (item.type === 'select' && item.options && item.options.length > 0) {
          // Force it to take the Dify default OR the first option in the list. Never empty.
          res[item.key] = item.default || item.default_value || item.options[0]
        } else {
          res[item.key] = item.default || item.default_value || ''
        }
      })
    }
    return res
  })())

  useEffect(() => {
    if (!savedInputs) {
      const res: Record<string, any> = {}
      if (promptConfig) {
        promptConfig.prompt_variables.forEach((item) => {
          if (item.type === 'select' && item.options && item.options.length > 0) {
            res[item.key] = item.default || item.default_value || item.options[0]
          } else {
            res[item.key] = item.default || item.default_value || ''
          }
        })
      }
      setInputs(res)
    }
    else {
      setInputs(savedInputs)
    }
  }, [savedInputs, promptConfig])

  const highLightPromoptTemplate = (() => {
    if (!promptConfig) { return '' }
    const res = promptConfig.prompt_template.replace(regex, (match, p1) => {
      return `<span class='text-[#FFD60A] font-bold'>${inputs?.[p1] ? inputs?.[p1] : match}</span>`
    })
    return res
  })()

  const { notify } = Toast
  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const renderHeader = () => {
    return (
      <div className='absolute top-0 left-0 right-0 flex items-center justify-between border-b border-white/5 mobile:h-12 tablet:h-16 px-8 bg-transparent'>
        <div className='text-white font-medium'>{conversationName}</div>
      </div>
    )
  }

  const renderInputs = () => {
    return (
      <div className='space-y-4 w-full max-w-2xl mx-auto'>
        {promptConfig.prompt_variables.map(item => (
          <div className='flex flex-col items-start w-full space-y-1.5' key={item.key}>
            <label className={'text-xs font-semibold text-gray-400 tracking-wider uppercase ml-1'}>
              {item.name} {!item.required && <span className="text-gray-600 lowercase">(Volitelné)</span>}
            </label>

            {/* THE FIX: Clean select box with no disabled ghosts */}
            {item.type === 'select' && (
              <select
                className='w-full py-3 px-3 box-border rounded-lg bg-[#0c0e12]/80 border border-white/5 hover:border-white/10 text-white text-sm focus:border-[#FFD60A]/50 focus:ring-1 focus:ring-[#FFD60A]/50 transition-all outline-none shadow-sm cursor-pointer appearance-none'
                value={inputs?.[item.key] || ''}
                onChange={(e) => { setInputs({ ...inputs, [item.key]: e.target.value }) }}
                style={{
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1em',
                }}
              >
                {(item.options || []).map(option => (
                  <option key={option} value={option} className="bg-[#1a1d24] text-white">
                    {option}
                  </option>
                ))}
              </select>
            )}

            {item.type === 'string' && (
              <input
                placeholder={`${item.name} ${!item.required ? '(Volitelné)' : ''}`}
                value={inputs?.[item.key] || ''}
                onChange={(e) => { setInputs({ ...inputs, [item.key]: e.target.value }) }}
                className={'w-full py-3 px-3 box-border rounded-lg bg-[#0c0e12]/80 border border-white/5 hover:border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#FFD60A]/50 focus:ring-1 focus:ring-[#FFD60A]/50 transition-all outline-none shadow-sm'}
                maxLength={item.max_length || DEFAULT_VALUE_MAX_LEN}
              />
            )}
            {item.type === 'paragraph' && (
              <textarea
                className="w-full h-[90px] py-2.5 px-3 box-border rounded-lg bg-[#0c0e12]/80 border border-white/5 hover:border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#FFD60A]/50 focus:ring-1 focus:ring-[#FFD60A]/50 transition-all outline-none shadow-sm resize-none"
                placeholder={`${item.name} ${!item.required ? '(Volitelné)' : ''}`}
                value={inputs?.[item.key] || ''}
                onChange={(e) => { setInputs({ ...inputs, [item.key]: e.target.value }) }}
              />
            )}
            {item.type === 'number' && (
              <input
                type="number"
                className="w-full py-2.5 px-3 box-border rounded-lg bg-[#0c0e12]/80 border border-white/5 hover:border-white/10 text-white text-sm placeholder-gray-600 focus:border-[#FFD60A]/50 focus:ring-1 focus:ring-[#FFD60A]/50 transition-all outline-none shadow-sm"
                placeholder={`${item.name} ${!item.required ? '(Volitelné)' : ''}`}
                value={inputs[item.key]}
                onChange={(e) => { onInputsChange({ ...inputs, [item.key]: e.target.value }) }}
              />
            )}
            {item.type === 'file' && (
              <FileUploaderInAttachmentWrapper
                fileConfig={{
                  allowed_file_types: item.allowed_file_types,
                  allowed_file_extensions: item.allowed_file_extensions,
                  allowed_file_upload_methods: item.allowed_file_upload_methods!,
                  number_limits: 1,
                  fileUploadConfig: {} as any,
                }}
                onChange={(files) => { setInputs({ ...inputs, [item.key]: files[0] }) }}
                value={inputs?.[item.key] || []}
              />
            )}
            {item.type === 'file-list' && (
              <FileUploaderInAttachmentWrapper
                fileConfig={{
                  allowed_file_types: item.allowed_file_types,
                  allowed_file_extensions: item.allowed_file_extensions,
                  allowed_file_upload_methods: item.allowed_file_upload_methods!,
                  number_limits: item.max_length,
                  fileUploadConfig: {} as any,
                }}
                onChange={(files) => { setInputs({ ...inputs, [item.key]: files }) }}
                value={inputs?.[item.key] || []}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const canChat = () => {
    const emptyInput = Object.entries(inputs).filter(([k, v]) => {
      const isRequired = promptConfig.prompt_variables.find(item => item.key === k)?.required ?? true
      return isRequired && (v === '' || v === undefined)
    }).length > 0

    if (emptyInput) {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  const handleChat = () => {
    if (!canChat()) { return }
    onStartChat(inputs)
  }

  const renderLuxuryHub = () => (
    <div className="w-full flex justify-center pb-12">
      <div className={`${s.floatingCard} w-full max-w-3xl flex flex-col items-center`}>
        <AppInfoComp siteInfo={siteInfo} />
        <div className={`${s.floatingCardInner} relative w-full overflow-hidden bg-[#1a1d24]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 tablet:p-10 shadow-2xl flex flex-col items-center`}>
          <style>{`
            .typewriter-text {
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              border-right: 2px solid #FFD60A;
            }
            .typing {
              animation: typing 0.8s steps(40, end), blink-caret .75s step-end infinite;
              max-width: 100%;
            }
            .erasing {
              animation: erasing 0.3s steps(40, end) forwards;
              max-width: 0;
            }
            @keyframes typing {
              from { max-width: 0 }
              to { max-width: 100% }
            }
            @keyframes erasing {
              from { max-width: 100% }
              to { max-width: 0 }
            }
            @keyframes blink-caret {
              from, to { border-color: transparent }
              50% { border-color: #FFD60A; }
            }
          `}</style>
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Upřesněte detaily <span className="text-gray-500 font-normal text-lg">(Volitelné)</span>
            </h2>
            <div className="h-6 flex items-center justify-center w-full mt-2">
              <span className="text-[#FFD60A] mr-2">💡</span>
              <div className={`typewriter-text text-sm text-gray-400 ${isTyping ? 'typing' : 'erasing'}`}>
                {proTips[tipIndex]}
              </div>
            </div>
          </div>
          <div className="relative z-10 w-full flex flex-col items-center">
            {hasVar ? renderInputs() : (isPublicVersion && <PromptTemplate html={highLightPromoptTemplate} />)}
            <div className="mt-8 flex justify-center w-full">
              <div onClick={handleChat} className="cursor-pointer bg-[#FFD60A] text-black w-full max-w-sm py-3.5 rounded-xl flex items-center justify-center font-bold text-base shadow-[0_0_15px_rgba(255,214,10,0.15)] hover:shadow-[0_0_25px_rgba(255,214,10,0.3)] hover:bg-[#e5c009] transition-all duration-300 hover:scale-[1.02]">
                Spustit AI Dopisaře
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderVarOpBtnGroup = () => {
    return (
      <VarOpBtnGroup
        onConfirm={() => {
          if (!canChat()) { return }
          onInputsChange(inputs)
          setIsFold(true)
        }}
        onCancel={() => {
          setInputs(savedInputs)
          setIsFold(true)
        }}
      />
    )
  }

  const renderHasSetInputsPublic = () => {
    if (!canEditInputs) {
      return (
        <TemplateVarPanel isFold={false} header={<><PanelTitle title={t('app.chat.publicPromptConfigTitle')} className='mb-1' /><PromptTemplate html={highLightPromoptTemplate} /></>} />
      )
    }
    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <>
            <PanelTitle title={t('app.chat.publicPromptConfigTitle')} className='mb-1' />
            <PromptTemplate html={highLightPromoptTemplate} />
            {isFold && (
              <div className='flex items-center justify-between mt-3 border-t border-white/10 pt-4 text-xs text-[#9F89FF]'>
                <span className='text-gray-400'>{t('app.chat.configStatusDes')}</span>
                <EditBtn onClick={() => setIsFold(false)} />
              </div>
            )}
          </>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    )
  }

  const renderHasSetInputsPrivate = () => {
    if (!canEditInputs || !hasVar) { return null }
    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <div className='flex items-center justify-between text-[#9F89FF]'>
            <PanelTitle title={!isFold ? t('app.chat.privatePromptConfigTitle') : t('app.chat.configStatusDes')} />
            {isFold && <EditBtn onClick={() => setIsFold(false)} />}
          </div>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    )
  }

  const renderHasSetInputs = () => {
    if ((!isPublicVersion && !canEditInputs) || !hasVar) { return null }
    return <div className='pt-[88px] mb-5'>{isPublicVersion ? renderHasSetInputsPublic() : renderHasSetInputsPrivate()}</div>
  }

  return (
    <div className='relative mobile:min-h-[48px] tablet:min-h-[64px]'>
      {hasSetInputs && renderHeader()}
      <div className='mx-auto pc:w-[800px] max-w-full mobile:w-full px-3.5'>
        {!hasSetInputs && (
          <div className='mobile:pt-[40px] tablet:pt-[80px] pc:pt-[100px]'>
            {renderLuxuryHub()}
          </div>
        )}
        {hasSetInputs && renderHasSetInputs()}
        {!hasSetInputs && (
          <div className='mt-6 flex justify-between items-center h-8 text-xs text-gray-500'>
            {siteInfo.privacy_policy
              ? (
                <div>{t('app.chat.privacyPolicyLeft')}
                  <a className='text-gray-400 hover:text-[#FFD60A] transition-colors mx-1' href={siteInfo.privacy_policy} target='_blank' rel="noopener noreferrer">
                    {t('app.chat.privacyPolicyMiddle')}
                  </a>
                  {t('app.chat.privacyPolicyRight')}
                </div>
              )
              : <div />}
            <a
              className='flex items-center pr-3 opacity-40 hover:opacity-100 hover:text-[#FFD60A] transition-all duration-300 tracking-wider'
              href="https://tvoje-stranka.cz"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vytvořil Michael Hudetz
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(Welcome)
