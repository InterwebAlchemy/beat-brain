import React from 'react'

import useChat from '../hooks/useChat'

import ChatWindow from './ChatWindow'

const SidebarView = (): React.ReactElement => {
  const { conversation } = useChat()

  return (
    <div className="chat-container">
      {conversation !== null ? (
        <ChatWindow messages={conversation.messages} />
      ) : (
        <></>
      )}
      {/* <ChatInput
        prompt={prompt}
        onPromptChange={setPrompt}
        onPromptSubmit={handleSubmit}
        conversation={conversation}
        busy={loading}
      /> */}
    </div>
  )
}

export default SidebarView
