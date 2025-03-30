import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const MAX_LENGTH = 250;

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    try {
      if (trimmedMessage && trimmedMessage.length <= MAX_LENGTH) {
        onSendMessage(trimmedMessage);
        setMessage('');
        
        // メッセージ送信イベントをNewRelicに記録
        if (typeof window !== 'undefined' && window.newrelic) {
          window.newrelic.addPageAction('send_message', {
            messageLength: trimmedMessage.length
          });
        }
      } else if (trimmedMessage.length > MAX_LENGTH) {
        const error = new Error(`Message exceeds maximum length (${trimmedMessage.length}/${MAX_LENGTH})`);
        
        // 文字数制限エラーをNewRelicに報告
        if (typeof window !== 'undefined' && window.newrelic) {
          window.newrelic.noticeError(error, {
            errorType: 'message_length_exceeded',
            actualLength: trimmedMessage.length,
            maxLength: MAX_LENGTH
          });
        }
        
        alert(`メッセージは${MAX_LENGTH}文字以内で入力してください`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // メッセージ送信エラーをNewRelicに報告
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(error, {
          errorType: 'message_send_error'
        });
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 border rounded resize-none h-[40px] min-h-[40px]"
            placeholder="メッセージを入力（250文字以内）"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={MAX_LENGTH}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleSubmit}
          >
            送信
          </button>
        </div>
        <div className="text-right text-sm text-gray-500">
          {message.length}/{MAX_LENGTH}文字
        </div>
      </div>
    </div>
  );
}
