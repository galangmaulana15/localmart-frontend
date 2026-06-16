import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, MessageCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/useToast'
import { buildChatThreadId, getChatMessages, getChats, getUserDisplayName, saveChatMessage } from '../utils/demoStore'

const getCustomerKey = (user = {}) => String(user?.id || user?.email || 'guest')

const buildThreadFromParams = (params, user) => {
  const rawThreadId = params.get('thread')
  const productId = params.get('productId')
  const orderId = params.get('orderId')
  const contextTitle = params.get('context') || (orderId ? `Pesanan ${orderId}` : params.get('productName') || '')
  const threadId = rawThreadId || buildChatThreadId({ productId, orderId, customerKey: getCustomerKey(user), kind: 'seller' })

  return {
    threadId,
    contextTitle,
    productId,
    productName: params.get('productName') || '',
    storeName: params.get('storeName') || 'Penjual LocalMart',
    initialMessage: params.get('message') || 'Halo, saya ingin bertanya tentang produk ini.',
  }
}

export default function CustomerChatPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [activeThread, setActiveThread] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [chatVersion, setChatVersion] = useState(0)
  const customerKey = getCustomerKey(user)

  const threads = (() => {
    void chatVersion
    const map = new Map()
    getChats()
      .filter((message) => message.customer_key === customerKey || message.customer_name === getUserDisplayName(user))
      .forEach((message) => {
        const current = map.get(message.thread_id)
        if (!current || new Date(message.created_at) > new Date(current.created_at)) {
          map.set(message.thread_id, message)
        }
      })
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })()

  useEffect(() => {
    const target = buildThreadFromParams(searchParams, user)
    if (!searchParams.toString()) {
      const firstThread = getChats()
        .filter((message) => message.customer_key === customerKey || message.customer_name === getUserDisplayName(user))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.thread_id || ''
      queueMicrotask(() => {
        setActiveThread(firstThread)
        setMessages(firstThread ? getChatMessages(firstThread) : [])
      })
      return
    }

    const existingMessages = getChatMessages(target.threadId)
    if (existingMessages.length === 0) {
      saveChatMessage({
        thread_id: target.threadId,
        type: 'seller',
        customer_key: customerKey,
        customer_name: getUserDisplayName(user),
        sender_role: 'customer',
        sender_name: getUserDisplayName(user),
        product_id: target.productId,
        product_name: target.productName,
        store_name: target.storeName,
        context_title: target.contextTitle,
        message: target.initialMessage,
      })
    }

    queueMicrotask(() => {
      setActiveThread(target.threadId)
      setMessages(getChatMessages(target.threadId))
      setChatVersion((current) => current + 1)
    })
  }, [customerKey, searchParams, user])

  useEffect(() => {
    const refreshThread = () => {
      if (!activeThread) return
      setMessages(getChatMessages(activeThread))
      setChatVersion((current) => current + 1)
    }

    window.addEventListener('demo-chats-updated', refreshThread)
    return () => window.removeEventListener('demo-chats-updated', refreshThread)
  }, [activeThread])

  useEffect(() => {
    const refreshThreads = () => {
      setChatVersion((current) => current + 1)
    }

    window.addEventListener('demo-chats-updated', refreshThreads)
    return () => window.removeEventListener('demo-chats-updated', refreshThreads)
  }, [])

  const openThread = (threadId) => {
    setActiveThread(threadId)
    setMessages(getChatMessages(threadId))
    setChatVersion((current) => current + 1)
  }

  const sendMessage = (event) => {
    event.preventDefault()
    if (!activeThread || !text.trim()) return

    const firstMessage = getChatMessages(activeThread)[0] || {}
    saveChatMessage({
      thread_id: activeThread,
      type: 'seller',
      customer_key: customerKey,
      customer_name: getUserDisplayName(user),
      sender_role: 'customer',
      sender_name: getUserDisplayName(user),
      product_id: firstMessage.product_id,
      product_name: firstMessage.product_name,
      store_name: firstMessage.store_name,
      context_title: firstMessage.context_title,
      message: text.trim(),
    })
    setText('')
    setMessages(getChatMessages(activeThread))
    setChatVersion((current) => current + 1)
    toast.success('Pesan berhasil dikirim.')
  }

  const activeMeta = messages[0] || threads.find((thread) => thread.thread_id === activeThread) || null

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <p className="text-primary font-semibold">Chat Saya</p>
          <h1 className="text-3xl font-bold text-secondary">Percakapan LocalMart</h1>
          <p className="text-gray-500">Chat dengan penjual terkait produk dan pesanan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="panel rounded-3xl p-4">
            <div className="mb-3 flex items-center gap-2 px-2 text-sm font-semibold text-gray-500">
              <MessageCircle className="h-4 w-4" />
              Daftar Percakapan
            </div>
            {threads.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                <p className="font-semibold text-secondary">Belum ada pesan</p>
                <p className="mt-1 text-sm">Mulai percakapan dari halaman produk.</p>
              </div>
            ) : (
              threads.map((thread) => (
                <button key={thread.thread_id} onClick={() => openThread(thread.thread_id)} className={`mb-2 w-full rounded-2xl p-4 text-left ${activeThread === thread.thread_id ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-secondary'}`}>
                  <p className="font-semibold">Chat Penjual</p>
                  <p className="text-xs text-gray-400">{thread.context_title || thread.product_name || thread.store_name || 'Percakapan LocalMart'}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{thread.message}</p>
                </button>
              ))
            )}
          </aside>

          <section className="lg:col-span-2 panel rounded-3xl p-6">
            <div className="mb-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-secondary">Chat Penjual</h2>
              <p className="text-sm text-gray-500">{activeMeta?.context_title || activeMeta?.product_name || activeMeta?.store_name || 'Mulai percakapan'}</p>
            </div>
            <ChatMessages messages={messages} />
            <form onSubmit={sendMessage} className="mt-4 flex gap-3">
              <input value={text} onChange={(event) => setText(event.target.value)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="Tulis pesan..." />
              <button className="gradient-bg inline-flex items-center gap-2 rounded-xl px-5 font-semibold text-white">
                <Send className="h-5 w-5" />
                Kirim
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function ChatMessages({ messages }) {
  if (messages.length === 0) {
    return <div className="rounded-2xl bg-gray-50 p-10 text-center text-gray-500">Belum ada pesan</div>
  }

  return (
    <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl bg-gray-50 p-4">
      {messages.map((message) => {
        const own = message.sender_role === 'customer'
        return (
          <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${own ? 'bg-primary text-white' : 'bg-white text-secondary shadow-sm'}`}>
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
