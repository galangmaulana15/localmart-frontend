/* eslint-disable */
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Store, Search, X, Send, Phone, User,
  Package, ChevronLeft, Clock, CheckCheck, Smile
} from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

const conversations = [
  {
    id: 1, customer: 'Sarah Wijaya', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', lastMessage: 'Baik, terima kasih kak!', time: '2 menit lalu', unread: 2, online: true, product: 'Kemeja Flanel Premium',
    messages: [
      { from: 'customer', text: 'Halo kak, apakah kemeja flanel merah masih ada?', time: '10:30' },
      { from: 'seller', text: 'Halo kak, masih ada stok ya ☺️', time: '10:31' },
      { from: 'customer', text: 'Ukuran L tersedia?', time: '10:32' },
      { from: 'seller', text: 'Ada kak. Size L ready!', time: '10:33' },
      { from: 'customer', text: 'Baik, terima kasih kak!', time: '10:34' },
    ],
  },
  {
    id: 2, customer: 'Budi Santoso', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', lastMessage: 'Oke siap, makasih', time: '1 jam lalu', unread: 0, online: false, product: 'Tas Ransel Wanita',
    messages: [
      { from: 'customer', text: 'Kak, saya mau tanya soal tas ransel yang warna hitam', time: '09:00' },
      { from: 'seller', text: 'Silakan kak, ada yang bisa dibantu?', time: '09:05' },
      { from: 'customer', text: 'Kapasitasnya gede ga? Buat laptop 14 inch', time: '09:06' },
      { from: 'seller', text: 'Bisa kak, muat sampe 15.6 inch', time: '09:10' },
      { from: 'customer', text: 'Oke siap, makasih', time: '09:15' },
    ],
  },
  {
    id: 3, customer: 'Ayu Lestari', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'Sudah sampai kak, terima kasih!', time: '3 jam lalu', unread: 0, online: true, product: 'Sepatu Sneakers Casual',
    messages: [
      { from: 'customer', text: 'Kak, sepatunya sudah sampai!', time: '14:00' },
      { from: 'seller', text: 'Alhamdulillah, senang mendengarnya kak ☺️', time: '14:05' },
      { from: 'customer', text: 'Sudah sampai kak, terima kasih!', time: '14:10' },
    ],
  },
  {
    id: 4, customer: 'Rizki Pratama', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', lastMessage: 'Apakah sudah dikirim?', time: '5 jam lalu', unread: 1, online: false, product: 'Jam Tangan Analog',
    messages: [
      { from: 'customer', text: 'Apakah sudah dikirim?', time: '08:00' },
    ],
  },
]

export default function SellerChat() {
  const { user } = useAuth()
  const [activeChat, setActiveChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState(conversations)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat])

  const filteredChats = chats.filter(c =>
    !searchQuery || c.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConversation = chats.find(c => c.id === activeChat)

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return
    setChats(prev => prev.map(c => {
      if (c.id !== activeChat) return c
      return {
        ...c,
        messages: [...c.messages, { from: 'seller', text: message.trim(), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }],
        lastMessage: message.trim(),
        time: 'Baru saja',
      }
    }))
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const totalUnread = chats.reduce((acc, c) => acc + (c.unread || 0), 0)

  if (!user || user.role_id !== 2) {
    return (
      <div className="bg-light min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center panel rounded-3xl p-12 max-w-md">
          <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Akses Terbatas</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk Seller.</p>
          <Link to="/register" className="gradient-bg text-white px-8 py-3 rounded-xl font-semibold inline-block hover:shadow-xl transition-all">Daftar Seller</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-primary text-xs font-semibold">Inbox</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">Chat Pelanggan</h1>
          <p className="text-gray-500 mt-1">{totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : 'Semua pesan sudah dibaca'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <label className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-primary transition-all">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari pelanggan..." className="bg-transparent outline-none text-sm w-full" />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X className="h-4 w-4 text-gray-400" /></button>}
              </label>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Tidak ada chat</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex items-start gap-3 ${activeChat === chat.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={chat.avatar} alt={chat.customer} className="w-11 h-11 rounded-full object-cover" />
                      {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-secondary truncate">{chat.customer}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate">{chat.product}</span>
                        {chat.unread > 0 && <span className="bg-primary text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{chat.unread}</span>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={activeConversation.avatar} alt={activeConversation.customer} className="w-10 h-10 rounded-full object-cover" />
                      {activeConversation.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary text-sm">{activeConversation.customer}</p>
                      <p className="text-xs text-gray-400">{activeConversation.online ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Phone className="h-4 w-4" /></button>
                    <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Package className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConversation.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'seller' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.from === 'seller' ? 'gradient-bg text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${msg.from === 'seller' ? 'text-white/70' : 'text-gray-400'}`}>
                          <span className="text-[10px]">{msg.time}</span>
                          {msg.from === 'seller' && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all flex-shrink-0"><Smile className="h-4 w-4 text-gray-500" /></button>
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-primary transition-all flex items-center">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pesan..."
                        className="flex-1 bg-transparent outline-none py-2.5 px-4 text-sm resize-none"
                        rows={1}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white disabled:opacity-50 hover:shadow-lg transition-all flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-5">
                    <MessageSquare className="h-10 w-10 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Pilih Percakapan</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Pilih chat dari pelanggan untuk mulai membalas pesan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
