interface MessageBubbleProps {
  remetente: 'cliente' | 'bot' | 'atendente'
  conteudo: string
  enviadaEm: string
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ remetente, conteudo, enviadaEm }: MessageBubbleProps) {
  if (remetente === 'atendente') {
    return (
      <div className="flex justify-end mb-2">
        <div
          className="max-w-[72%] rounded-2xl rounded-br-sm px-4 py-2.5"
          style={{ background: '#C45C3C' }}
        >
          <p className="text-sm text-white leading-relaxed">{conteudo}</p>
          <p className="text-[10px] text-white/60 mt-1 text-right">{formatarHora(enviadaEm)}</p>
        </div>
      </div>
    )
  }

  if (remetente === 'bot') {
    return (
      <div className="flex justify-start mb-2">
        <div className="max-w-[72%]">
          <p className="text-[10px] text-muted mb-1 ml-1">Sofia ✦</p>
          <div className="rounded-2xl rounded-bl-sm px-4 py-2.5" style={{ background: '#1F2520' }}>
            <p className="text-sm text-foreground leading-relaxed">{conteudo}</p>
            <p className="text-[10px] text-muted mt-1">{formatarHora(enviadaEm)}</p>
          </div>
        </div>
      </div>
    )
  }

  // cliente
  return (
    <div className="flex justify-start mb-2">
      <div
        className="max-w-[72%] rounded-2xl rounded-bl-sm px-4 py-2.5"
        style={{ background: '#2A1F1F' }}
      >
        <p className="text-sm text-foreground leading-relaxed">{conteudo}</p>
        <p className="text-[10px] text-muted mt-1">{formatarHora(enviadaEm)}</p>
      </div>
    </div>
  )
}
