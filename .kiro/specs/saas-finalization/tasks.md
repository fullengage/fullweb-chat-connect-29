# Implementation Plan - Finalização do SaaS

## Fase 1: Correções Críticas (Prioridade Alta)

- [ ] 1. Corrigir Sistema Kanban no Dashboard


  - Debugar hook `useChatwootConversations` para verificar estrutura de dados
  - Corrigir mapeamento de status no componente `KanbanBoard`
  - Implementar drag-and-drop funcional com atualização de status via proxy
  - Adicionar logs para debug da resposta da API
  - Testar agrupamento de conversas por status (open, pending, resolved)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Implementar Sistema de Anexos no Chat
  - Criar componente `FileUploadButton` com seletor de arquivos
  - Implementar hook `useFileUpload` com FormData para multipart upload
  - Criar componente `AttachmentPreview` para exibir imagens e documentos
  - Implementar visualização de anexos em mensagens existentes
  - Adicionar validação de tipos e tamanhos de arquivo
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Implementar Mensagens Privadas
  - Adicionar toggle/checkbox para marcar mensagem como privada
  - Atualizar hook `useChatwootMessages` para incluir flag `private: true`
  - Criar componente `PrivateMessageIndicator` para destacar mensagens privadas
  - Implementar filtro visual para diferenciar mensagens públicas/privadas
  - Testar envio e recebimento de mensagens privadas
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Fase 2: Funcionalidades de Gestão (Prioridade Alta)

- [ ] 4. Implementar Atribuição de Agentes
  - Criar componente `AgentAssignmentDropdown` com lista de agentes
  - Implementar hook `useConversationAssignment` para PATCH de atribuição
  - Adicionar indicador visual de agente atribuído nas conversas
  - Implementar reatribuição de conversas entre agentes
  - Adicionar tratamento de erro para falhas de atribuição
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Implementar Sistema de Etiquetas (Labels)
  - Criar hook `useConversationLabels` para gerenciar etiquetas
  - Implementar componente `LabelSelector` para adicionar/remover etiquetas
  - Criar componente `LabelBadge` para exibir etiquetas nas conversas
  - Implementar endpoint de labels via proxy (/conversations/:id/labels)
  - Adicionar filtros por etiquetas na interface
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## Fase 3: Autenticação e Multi-Tenancy (Prioridade Crítica)

- [ ] 6. Implementar Autenticação Multi-Tenant
  - Criar `AuthContext` com suporte a múltiplos account_id
  - Atualizar todos os hooks para usar account_id dinâmico do contexto
  - Implementar isolamento de dados por empresa/conta
  - Criar sistema de roles (agent, supervisor, administrator)
  - Implementar controle de acesso baseado em permissões
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Implementar Controle de Acesso por Roles
  - Criar hook `usePermissions` para verificar acesso a funcionalidades
  - Implementar filtros de conversa baseados no role do usuário
  - Criar componentes condicionais baseados em permissões
  - Implementar redirecionamento baseado em role após login
  - Adicionar logs de tentativas de acesso não autorizado
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Fase 4: Funcionalidades Avançadas (Prioridade Média)

- [ ] 8. Implementar Sistema de Chatbot
  - Criar hook `useChatbot` para integração com automação
  - Implementar componente `ChatbotConfig` para configurações
  - Integrar com n8n via webhooks para respostas automáticas
  - Criar indicadores visuais para mensagens de bot
  - Implementar transferência de bot para agente humano
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Melhorar Dashboard de Métricas
  - Implementar cálculo de métricas em tempo real
  - Criar componentes de gráficos para analytics
  - Implementar filtros de data para relatórios
  - Adicionar exportação de relatórios em PDF/Excel
  - Criar dashboard específico por role de usuário
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Implementar Sistema de Notificações
  - Criar hook `useNotifications` para gerenciar notificações
  - Implementar notificações visuais para novas mensagens
  - Adicionar contador de mensagens não lidas
  - Implementar notificações por email para agentes offline
  - Criar sistema de priorização de notificações urgentes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

## Fase 5: Testes e Qualidade (Prioridade Alta)

- [ ] 11. Implementar Testes Unitários
  - Criar testes para todos os hooks personalizados (useChatwoot*)
  - Implementar testes para componentes críticos (Kanban, Chat, etc.)
  - Adicionar testes para funções utilitárias e validações
  - Configurar coverage mínimo de 80%
  - Integrar testes no pipeline CI/CD
  - _Testing Strategy: Unit Tests_

- [ ] 12. Implementar Testes de Integração
  - Criar testes para fluxo completo de envio de mensagem
  - Testar integração de atribuição de agentes
  - Implementar testes de upload de arquivos
  - Testar autenticação multi-tenant end-to-end
  - Configurar MSW para mock de APIs
  - _Testing Strategy: Integration Tests_

- [ ] 13. Implementar Testes E2E
  - Criar cenários de teste para jornada completa do agente
  - Implementar testes de fluxo de atendimento ao cliente
  - Testar funcionalidades específicas de supervisor
  - Criar testes para configurações de administrador
  - Configurar Playwright ou Cypress para automação
  - _Testing Strategy: E2E Tests_

## Fase 6: Performance e Segurança (Prioridade Média)

- [ ] 14. Implementar Otimizações de Performance
  - Adicionar lazy loading para componentes pesados
  - Implementar React.memo em componentes que re-renderizam frequentemente
  - Criar virtual scrolling para listas grandes de conversas
  - Adicionar debouncing em campos de busca e filtros
  - Implementar cache inteligente para dados do Chatwoot
  - _Performance Considerations_

- [ ] 15. Implementar Medidas de Segurança
  - Configurar CORS adequadamente no proxy
  - Implementar tokens CSRF em formulários críticos
  - Adicionar sanitização de conteúdo para prevenir XSS
  - Implementar validação rigorosa de upload de arquivos
  - Configurar rate limiting para prevenir abuso
  - _Security Considerations_

- [ ] 16. Implementar Monitoramento e Logs
  - Configurar tracking de Web Vitals
  - Implementar error tracking com Sentry
  - Adicionar monitoramento de performance de APIs
  - Configurar logs estruturados para debug
  - Implementar alertas para erros críticos
  - _Performance Monitoring_

## Fase 7: Deploy e Produção (Prioridade Alta)

- [ ] 17. Configurar Ambientes de Deploy
  - Configurar ambiente de staging com dados de teste
  - Implementar pipeline CI/CD automatizado
  - Configurar variáveis de ambiente para diferentes ambientes
  - Implementar health checks e monitoring pós-deploy
  - Criar documentação de deploy e rollback
  - _Deployment Strategy_

- [ ] 18. Preparar Documentação Final
  - Criar documentação técnica completa da API
  - Documentar fluxos de trabalho para diferentes roles
  - Criar guia de troubleshooting para problemas comuns
  - Documentar processo de onboarding de novas empresas
  - Criar manual de configuração do sistema
  - _Documentation_

## Cronograma Estimado

### Semana 1-2: Fase 1 (Correções Críticas)
- Foco em Kanban, Anexos e Mensagens Privadas
- Essencial para funcionalidade básica do sistema

### Semana 3-4: Fase 2 (Funcionalidades de Gestão)
- Atribuição de agentes e sistema de etiquetas
- Funcionalidades core para gestão de atendimento

### Semana 5-6: Fase 3 (Autenticação Multi-Tenant)
- Implementação crítica para SaaS multi-empresa
- Base para escalabilidade do sistema

### Semana 7-8: Fase 4 (Funcionalidades Avançadas)
- Chatbot, métricas avançadas e notificações
- Diferenciais competitivos do produto

### Semana 9-10: Fase 5 (Testes e Qualidade)
- Cobertura completa de testes
- Garantia de qualidade para produção

### Semana 11-12: Fase 6-7 (Performance, Segurança e Deploy)
- Otimizações finais e preparação para produção
- Deploy e documentação final

## Critérios de Aceitação Geral

- ✅ Todos os testes passando com cobertura mínima de 80%
- ✅ Performance adequada (< 3s para carregamento inicial)
- ✅ Segurança validada (sem vulnerabilidades críticas)
- ✅ Multi-tenancy funcionando corretamente
- ✅ Todas as funcionalidades críticas implementadas
- ✅ Documentação completa e atualizada
- ✅ Deploy automatizado funcionando
- ✅ Monitoramento e alertas configurados