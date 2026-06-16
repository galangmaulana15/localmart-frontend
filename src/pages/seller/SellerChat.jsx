import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { getChatMessages, getChatThreads, getUserDisplayName, saveChatMessage } from '../../utils/demoStore'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ui/useToast'

export default function SellerChat() {
  const { user } = useAuth()
  const toast = useToast()
  const [threads, setThreads] = useState(() => getChatThreads('seller'))
  const [activeThread, setActiveThread] = useState(() => threads[0]?.thread_id || '')
  const [messages, setMessages] = useState(() => activeThread ? getChatMessages(activeThread) : [])
  const [text, setText] = useState('')

  useEffect(() => {
    const refreshThreads = () => {
      const nextThreads = getChatThreads('seller')
      setThreads(nextThreads)

      setActiveThread((current) => {
        if (current && nextThreads.some((thread) => thread.thread_id === current)) {
          setMessages(getChatMessages(current))
          return current
        }
        const nextActive = nextThreads[0]?.thread_id || ''
        setMessages(nextActive ? getChatMessages(nextActive) : [])
        return nextActive
      })
    }

    window.addEventListener('demo-chats-updated', refreshThreads)
    return () => window.removeEventListener('demo-chats-updated', refreshThreads)
  }, [])

  const openThread = (threadId) => {
    setActiveThread(threadId)
    setMessages(getChatMessages(threadId))
  }

  const sendReply = (event) => {
    event.preventDefault()
    if (!activeThread || !text.trim()) return

    saveChatMessage({
      thread_id: activeThread,
      type: 'seller',
      sender_role: 'seller',
      sender_name: getUserDisplayName(user),
      customer_name: messages[0]?.customer_name || 'Customer LocalMart',
      customer_key: messages[0]?.customer_key,
      product_id: messages[0]?.product_id,
      product_name: messages[0]?.product_name,
      store_name: messages[0]?.store_name,
      context_title: messages[0]?.context_title,
      message: text.trim(),
    })
    setText('')
    setMessages(getChatMessages(activeThread))
    setThreads(getChatThreads('seller'))
    toast.success('Balasan berhasil dikirim.')
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <p className="text-primary font-semibold">Seller Center</p>
          <h1 className="text-3xl font-bold text-secondary">Chat Customer</h1>
          <p className="text-gray-500">Balas pertanyaan customer terkait produk dan pesanan.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="panel rounded-3xl p-4">
            {threads.length === 0 ? <p className="p-6 text-center text-gray-500">Belum ada chat.</p> : threads.map((thread) => (
              <button key={thread.thread_id} onClick={() => openThread(thread.thread_id)} className={`mb-2 w-full rounded-2xl p-4 text-left ${activeThread === thread.thread_id ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-secondary'}`}>
                <p className="font-semibold">{thread.customer_name}</p>
                <p className="text-xs text-gray-400">{thread.context_title || thread.product_name || 'Percakapan customer'}</p>
                <p className="line-clamp-2 text-sm text-gray-500">{thread.message}</p>
              </button>
            ))}
          </aside>
          <section className="lg:col-span-2 panel rounded-3xl p-6">
            <ChatMessages messages={messages} currentRole="seller" />
            <form onSubmit={sendReply} className="mt-4 flex gap-3">
              <input value={text} onChange={(event) => setText(event.target.value)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="Balas customer..." />
              <button className="gradient-bg rounded-xl px-5 text-white"><Send className="h-5 w-5" /></button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function ChatMessages({ messages, currentRole }) {
  if (messages.length === 0) return <div className="rounded-2xl bg-gray-50 p-10 text-center text-gray-500">Pilih chat customer.</div>

  return (
    <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl bg-gray-50 p-4">
      {messages.map((message) => {
        const own = message.sender_role === currentRole
        return (
          <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${own ? 'bg-primary text-white' : 'bg-white text-secondary'}`}>
              <p className="text-sm font-semibold">{message.sender_name}</p>
              <p className="text-sm">{message.message}</p>
              <p className={`mt-1 text-xs ${own ? 'text-white/70' : 'text-gray-400'}`}>{new Date(message.created_at).toLocaleString('id-ID')}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
