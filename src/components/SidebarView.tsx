import React, { useEffect, useState } from 'react'

import useChat from '../hooks/useChat'

import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'

const SidebarView = (): React.ReactElement => {
  const { ready, conversation, executeConversation } = useChat()

  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const chatRequest = new AbortController()

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault()

    setLoading(true)

    setPrompt('')

    conversation?.addRequest({
      role: 'user',
      content: prompt
    })

    executeConversation({ signal: chatRequest.signal })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    return () => {
      chatRequest.abort()
    }
  }, [])

  useEffect(() => {
    setLoading(ready)
  }, [ready])

  return (
    <div className="chat-container">
      {conversation !== null ? (
        <ChatWindow messages={conversation.messages} />
      ) : (
        <></>
      )}
      <ChatInput
        prompt={prompt}
        onPromptChange={setPrompt}
        onPromptSubmit={handleSubmit}
        conversation={conversation}
        busy={loading}
      />
    </div>
  )
}

export default SidebarView
