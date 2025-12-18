import { useState, useEffect, useRef } from 'react';
import { User, Bot, Send, Plus } from 'lucide-react';
import { sendMessage } from '../services/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface Conversation {
  id: string;
  timestamp: number;
  messages: Message[];
  roomId: number;
}

function ChatPage() {
  const [roomId] = useState<number>(() => Math.floor(Math.random() * 900000) + 100000);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  };

  const saveConversation = () => {
    if (messages.length > 0) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        messages,
        roomId,
      };
      const updated = [newConversation, ...conversations];
      setConversations(updated);
      localStorage.setItem('conversations', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content }]);

    try {
      const aiResponse = await sendMessage(roomId, content);

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      if (aiResponse.includes('游戏已结束')) {
        setIsGameEnded(true);
      }

      if (!isGameStarted && content === '开始') {
        setIsGameStarted(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'ai', content: '发送失败，请重试' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleStart = () => {
    if (!isGameStarted) {
      handleSendMessage('开始');
    }
  };

  const handleEnd = () => {
    if (!isGameEnded) {
      handleSendMessage('结束');
      setTimeout(() => {
        saveConversation();
      }, 500);
    }
  };

  const handleNewGame = () => {
    saveConversation();
    setMessages([]);
    setInputValue('');
    setIsGameStarted(false);
    setIsGameEnded(false);
    setCurrentConversationId(null);
  };

  const handleViewConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isViewingHistory = currentConversationId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI 脑筋急转弯</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isViewingHistory ? '查看历史对话' : `房间号: ${roomId}`}
            </p>
          </div>
          {isViewingHistory && (
            <button
              onClick={handleNewGame}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <Plus size={18} />
              <span>新游戏</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">历史对话</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                暂无对话记录
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {conversations.map((conversation, index) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleViewConversation(conversation)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      currentConversationId === conversation.id
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-medium">对话 {index + 1}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(conversation.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === 'ai'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {message.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'ai'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {!isViewingHistory && (
            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleStart}
                  disabled={isGameStarted || isSending}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isGameStarted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  开始游戏
                </button>
                <button
                  onClick={handleEnd}
                  disabled={isGameEnded || isSending || !isGameStarted}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isGameEnded || !isGameStarted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  结束游戏
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入内容"
                  disabled={isSending}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <span>发送</span>
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
