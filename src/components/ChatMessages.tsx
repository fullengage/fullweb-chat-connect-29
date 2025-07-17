
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Conversation } from "@/types"

interface ChatUser {
  id: number | string
  name: string
  avatar_url?: string
}

interface ChatMessagesProps {
  conversation: Conversation
  currentUser: any
  users: ChatUser[]
}

export const ChatMessages = ({ conversation, currentUser, users }: ChatMessagesProps) => {
  const messages = conversation.messages || []

  const formatMessageDate = (dateString: string) => {
    console.log('🔍 Data original:', dateString)
    
    // Tentar diferentes formatos de data
    let date: Date
    
    if (!dateString) {
      date = new Date()
    } else if (typeof dateString === 'number') {
      // Se for timestamp
      date = new Date(dateString * 1000) // Multiplicar por 1000 se for timestamp em segundos
    } else if (typeof dateString === 'string') {
      // Se for string, tentar parsear
      date = new Date(dateString)
      
      // Se a data for inválida ou muito antiga (1970), usar data atual
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        console.log('🔍 Data inválida, usando data atual')
        date = new Date()
      }
    } else {
      date = new Date()
    }
    
    console.log('🔍 Data processada:', date)
    
    if (isToday(date)) {
      return format(date, "HH:mm")
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, "HH:mm")}`
    } else {
      return format(date, "dd/MM/yyyy HH:mm")
    }
  }

  const getDateSeparator = (dateString: string) => {
    const date = new Date(dateString)
    
    if (isToday(date)) {
      return "Hoje"
    } else if (isYesterday(date)) {
      return "Ontem"
    } else {
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    }
  }

  const shouldShowDateSeparator = (currentIndex: number, messages: any[]) => {
    if (currentIndex === 0) return true
    
    const currentDate = new Date(messages[currentIndex].created_at).toDateString()
    const previousDate = new Date(messages[currentIndex - 1].created_at).toDateString()
    
    return currentDate !== previousDate
  }

  const getSenderInfo = (message: any) => {
    console.log('🔍 Analisando mensagem completa:', JSON.stringify(message, null, 2))
    console.log('🔍 Sender type:', message.sender_type)
    console.log('🔍 Message type:', message.message_type)
    console.log('🔍 Sender:', message.sender)
    console.log('🔍 Attachments:', message.attachments)
    console.log('🔍 Conversation contact:', conversation.contact)
    
    // Lógica mais simples e direta baseada no que vemos na imagem
    // As mensagens parecem ser todas do cliente (Juju), então vamos assumir isso
    
    // Se não tem sender_type ou message_type definidos, assumir que é do cliente
    if (!message.sender_type && !message.message_type) {
      console.log('🔍 Sem tipo definido - assumindo cliente')
      return {
        name: conversation.contact?.name || 'Cliente',
        avatar: conversation.contact?.avatar_url,
        isCurrentUser: false
      }
    }
    
    // Verificar se é mensagem do contato/cliente
    if (message.sender_type === 'contact' || 
        message.message_type === 'incoming' ||
        message.sender_type === 'user' ||
        !message.sender_type) {
      
      const contactName = conversation.contact?.name || 
                         message.sender?.name || 
                         message.contact?.name || 
                         'Cliente'
      
      console.log('🔍 Mensagem do cliente:', contactName)
      
      return {
        name: contactName,
        avatar: conversation.contact?.avatar_url || message.sender?.avatar_url,
        isCurrentUser: false
      }
    } 
    // Verificar se é mensagem do agente
    else if (message.sender_type === 'agent' || message.message_type === 'outgoing') {
      
      let agentName = 'Agente'
      let agentAvatar = undefined
      
      if (message.sender?.name) {
        agentName = message.sender.name
        agentAvatar = message.sender.avatar_url
      } else if (currentUser?.name) {
        agentName = currentUser.name
        agentAvatar = currentUser.avatar_url
      }
      
      console.log('🔍 Mensagem do agente:', agentName)
      
      return {
        name: agentName,
        avatar: agentAvatar,
        isCurrentUser: true
      }
    } 
    else {
      console.log('🔍 Tipo desconhecido - assumindo cliente')
      
      return {
        name: conversation.contact?.name || 'Cliente',
        avatar: conversation.contact?.avatar_url,
        isCurrentUser: false
      }
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p>Nenhuma mensagem ainda</p>
          <p className="text-sm mt-1">Seja o primeiro a enviar uma mensagem!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const senderInfo = getSenderInfo(message)
        const showDateSeparator = shouldShowDateSeparator(index, messages)
        
        return (
          <div key={message.id || index}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {getDateSeparator(message.created_at)}
                </span>
              </div>
            )}

            {message.sender_type === 'system' ? (
              <div className="flex justify-center my-2">
                <span className="text-gray-500 text-sm italic">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex ${senderInfo.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${senderInfo.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={senderInfo.avatar} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {senderInfo.name && senderInfo.name.length > 0 ? senderInfo.name.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`mx-2 ${senderInfo.isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        senderInfo.isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {/* Renderizar anexos se existirem */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((attachment: any, attachIndex: number) => (
                            <div key={attachIndex}>
                              {attachment.file_type?.startsWith('image/') ? (
                                // Renderizar imagem
                                <div className="relative">
                                  <img
                                    src={attachment.data_url}
                                    alt="Anexo"
                                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{ maxWidth: '250px', maxHeight: '200px' }}
                                    onClick={() => window.open(attachment.data_url, '_blank')}
                                  />
                                  {attachment.file_size && (
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                      {(attachment.file_size / 1024).toFixed(1)}KB
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // Renderizar outros tipos de arquivo
                                <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                  <div className="w-8 h-8 bg-white bg-opacity-30 rounded flex items-center justify-center">
                                    <span className="text-xs">📎</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {attachment.file_name || 'Arquivo'}
                                    </p>
                                    {attachment.file_size && (
                                      <p className="text-xs opacity-75">
                                        {(attachment.file_size / 1024).toFixed(1)}KB
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => window.open(attachment.data_url, '_blank')}
                                    className="text-xs underline opacity-75 hover:opacity-100"
                                  >
                                    Baixar
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Renderizar texto da mensagem se existir */}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    <div className={`mt-1 text-xs text-gray-500 ${senderInfo.isCurrentUser ? 'text-right' : 'text-left'}`}>
                      <span>{senderInfo.name}</span>
                      <span className="mx-1">•</span>
                      <span>{formatMessageDate(message.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
