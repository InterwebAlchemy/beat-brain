import React from 'react'
import { useLoading, Oval } from '@agney/react-loading'

import InputArea from './InputArea'
import IconButton from './IconButton'

import type { Conversation } from '../services/conversation/conversation'

export interface ChatInputProps {
  prompt: string
  onPromptChange: React.Dispatch<React.SetStateAction<string>>
  onPromptSubmit: (event: React.FormEvent) => void
  conversation: Conversation | null
  busy?: boolean
}

// create a chat interface that sends user input to the openai api via the openai package
// and displays the response from openai
const ChatInput = ({
  onPromptChange,
  onPromptSubmit,
  prompt = '',
  busy = false,
  conversation
}: ChatInputProps): React.ReactElement => {
  const { containerProps, indicatorEl } = useLoading({
    loading: busy,
    indicator: <Oval width="20" />
  })

  return (
    <form
      className="chat-form"
      onSubmit={onPromptSubmit}
      autoCapitalize="off"
      noValidate>
      <InputArea
        value={prompt}
        onChange={onPromptChange}
        countType="tokens"
        countPosition="top"
        countAlign="right"
      />
      <IconButton
        iconName="send"
        a11yText="Send"
        buttonStyle="primary"
        type="submit"
        className="chat__input__send"
        disabled={busy}
        {...containerProps}>
        {indicatorEl}
      </IconButton>
    </form>
  )
}

export default ChatInput
