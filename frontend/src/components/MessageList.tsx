import { useEffect, useRef } from 'react';
import { Message } from '../types/message';

interface MessageListProps {
  messages: Message[];
  currentUserName: string;
}

export default function MessageList({ messages, currentUserName }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    try {
      scrollToBottom();
      
      // メッセージリストの更新をNewRelicに記録
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.addPageAction('messages_updated', {
          messageCount: messages.length
        });
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
      
      // スクロールエラーをNewRelicに報告
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(error, {
          errorType: 'scroll_to_bottom_error'
        });
      }
    }
  }, [messages]);

  return (
    <div className="h-[500px] overflow-y-auto p-4">
      <div className="flex flex-col">
        {messages.map((message) => {
          const isCurrentUser = message.userName === currentUserName;
          try {
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[70%] ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                      : 'bg-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg'
                  } p-3 shadow`}
                >
                  <div className={`text-sm ${isCurrentUser ? 'text-blue-100' : 'text-gray-600'} mb-1`}>
                    {message.userName}
                  </div>
                  <div className="break-words">{message.content}</div>
                  <div className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering message:', error, message);
            
            // メッセージレンダリングエラーをNewRelicに報告
            if (typeof window !== 'undefined' && window.newrelic) {
              window.newrelic.noticeError(error, {
                errorType: 'message_render_error',
                messageId: message.id,
                messageData: JSON.stringify(message)
              });
            }
            
            // エラーが発生した場合でも、最低限のメッセージを表示
            return (
              <div key={message.id || 'error'} className="p-2 m-2 bg-red-100 text-red-800 rounded">
                メッセージの表示中にエラーが発生しました
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
