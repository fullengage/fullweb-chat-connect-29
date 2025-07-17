# Requirements Document - Finalização do SaaS de Atendimento ao Cliente

## Introduction

Este documento define os requisitos para finalizar o desenvolvimento do SaaS de atendimento ao cliente baseado no Chatwoot. O sistema será vendido como assinatura para empresas, permitindo gestão completa de conversas, agentes, contatos e análises através de uma interface moderna e intuitiva.

## Requirements

### Requirement 1 - Sistema Kanban Funcional

**User Story:** Como um gestor de atendimento, eu quero visualizar as conversas em formato Kanban organizadas por status, para que eu possa gerenciar o fluxo de trabalho de forma visual e eficiente.

#### Acceptance Criteria

1. WHEN o usuário acessa o Dashboard THEN o sistema SHALL exibir um board Kanban com colunas para cada status de conversa (Abertas, Pendentes, Resolvidas)
2. WHEN uma conversa muda de status THEN o sistema SHALL mover automaticamente o card para a coluna correspondente
3. WHEN o usuário arrasta um card entre colunas THEN o sistema SHALL atualizar o status da conversa no Chatwoot via proxy
4. WHEN há conversas em cada status THEN o sistema SHALL exibir cards com informações do contato, última mensagem e tempo decorrido
5. WHEN não há conversas em um status THEN o sistema SHALL exibir uma mensagem informativa na coluna vazia

### Requirement 2 - Suporte a Anexos e Imagens no Chat

**User Story:** Como um agente de atendimento, eu quero enviar e visualizar anexos (imagens, documentos) nas conversas, para que eu possa fornecer suporte completo aos clientes.

#### Acceptance Criteria

1. WHEN o usuário clica no botão de anexo THEN o sistema SHALL abrir um seletor de arquivos
2. WHEN o usuário seleciona um arquivo THEN o sistema SHALL fazer upload via proxy usando FormData
3. WHEN uma mensagem contém anexo THEN o sistema SHALL exibir preview para imagens e ícone apropriado para outros tipos
4. WHEN o usuário clica em um anexo THEN o sistema SHALL permitir download ou visualização em tela cheia
5. WHEN o upload falha THEN o sistema SHALL exibir mensagem de erro clara

### Requirement 3 - Mensagens Privadas

**User Story:** Como um agente de atendimento, eu quero enviar mensagens privadas (notas internas), para que eu possa comunicar informações sensíveis apenas para outros agentes.

#### Acceptance Criteria

1. WHEN o usuário digita uma mensagem THEN o sistema SHALL oferecer opção de marcar como privada
2. WHEN uma mensagem é marcada como privada THEN o sistema SHALL enviar com flag `private: true` via proxy
3. WHEN uma mensagem privada é exibida THEN o sistema SHALL destacá-la visualmente (cor diferente, ícone)
4. WHEN um cliente acessa a conversa THEN o sistema SHALL ocultar mensagens privadas
5. WHEN um agente visualiza a conversa THEN o sistema SHALL exibir todas as mensagens (públicas e privadas)

### Requirement 4 - Atribuição de Agentes

**User Story:** Como um supervisor, eu quero atribuir conversas a agentes específicos, para que eu possa distribuir a carga de trabalho de forma equilibrada.

#### Acceptance Criteria

1. WHEN o usuário clica em "Atribuir" em uma conversa THEN o sistema SHALL exibir lista de agentes disponíveis
2. WHEN um agente é selecionado THEN o sistema SHALL fazer request PATCH via proxy para atribuir a conversa
3. WHEN a atribuição é bem-sucedida THEN o sistema SHALL atualizar a interface mostrando o agente responsável
4. WHEN uma conversa já tem agente THEN o sistema SHALL permitir reatribuição para outro agente
5. WHEN a atribuição falha THEN o sistema SHALL exibir mensagem de erro e manter estado anterior

### Requirement 5 - Sistema de Etiquetas (Labels)

**User Story:** Como um agente de atendimento, eu quero adicionar etiquetas às conversas, para que eu possa categorizar e filtrar os atendimentos por tipo ou prioridade.

#### Acceptance Criteria

1. WHEN o usuário clica em "Adicionar Etiqueta" THEN o sistema SHALL exibir lista de etiquetas disponíveis
2. WHEN uma etiqueta é selecionada THEN o sistema SHALL fazer request via proxy para adicionar à conversa
3. WHEN etiquetas são adicionadas THEN o sistema SHALL exibi-las visualmente na conversa
4. WHEN o usuário remove uma etiqueta THEN o sistema SHALL fazer request via proxy para remover
5. WHEN há filtros por etiqueta THEN o sistema SHALL filtrar conversas correspondentes

### Requirement 6 - Autenticação Multi-Tenant

**User Story:** Como proprietário de uma empresa, eu quero que apenas meus agentes vejam as conversas da minha conta, para que haja isolamento completo entre diferentes empresas clientes.

#### Acceptance Criteria

1. WHEN um usuário faz login THEN o sistema SHALL identificar sua empresa/account_id
2. WHEN dados são carregados THEN o sistema SHALL usar o account_id correto em todas as requests
3. WHEN um agente acessa o sistema THEN o sistema SHALL mostrar apenas conversas de sua empresa
4. WHEN há mudança de contexto THEN o sistema SHALL atualizar todos os hooks com novo account_id
5. WHEN o login falha THEN o sistema SHALL exibir erro específico e não permitir acesso

### Requirement 7 - Chatbot Integrado

**User Story:** Como administrador do sistema, eu quero configurar respostas automáticas via chatbot, para que conversas simples sejam resolvidas automaticamente.

#### Acceptance Criteria

1. WHEN uma nova conversa é iniciada THEN o sistema SHALL verificar se há chatbot ativo
2. WHEN o chatbot está ativo THEN o sistema SHALL enviar resposta automática inicial
3. WHEN palavras-chave são detectadas THEN o sistema SHALL acionar respostas pré-configuradas
4. WHEN o chatbot não consegue responder THEN o sistema SHALL transferir para agente humano
5. WHEN há integração com n8n THEN o sistema SHALL enviar webhooks para processamento externo

### Requirement 8 - Controle de Acesso por Roles

**User Story:** Como administrador, eu quero definir diferentes níveis de acesso (agente, supervisor, admin), para que cada usuário veja apenas as funcionalidades apropriadas ao seu cargo.

#### Acceptance Criteria

1. WHEN um agente faz login THEN o sistema SHALL mostrar apenas suas conversas atribuídas
2. WHEN um supervisor faz login THEN o sistema SHALL mostrar todas as conversas da equipe
3. WHEN um admin faz login THEN o sistema SHALL ter acesso completo a configurações
4. WHEN há tentativa de acesso não autorizado THEN o sistema SHALL bloquear e registrar tentativa
5. WHEN roles são alterados THEN o sistema SHALL atualizar permissões em tempo real

### Requirement 9 - Dashboard de Métricas e Analytics

**User Story:** Como gestor, eu quero visualizar métricas de desempenho da equipe, para que eu possa tomar decisões baseadas em dados.

#### Acceptance Criteria

1. WHEN o dashboard é acessado THEN o sistema SHALL exibir métricas em tempo real
2. WHEN há dados de conversas THEN o sistema SHALL calcular tempo médio de resposta
3. WHEN há dados de agentes THEN o sistema SHALL mostrar produtividade individual
4. WHEN filtros são aplicados THEN o sistema SHALL atualizar métricas correspondentes
5. WHEN há exportação THEN o sistema SHALL gerar relatórios em PDF/Excel

### Requirement 10 - Sistema de Notificações

**User Story:** Como agente de atendimento, eu quero receber notificações de novas mensagens, para que eu possa responder rapidamente aos clientes.

#### Acceptance Criteria

1. WHEN uma nova mensagem chega THEN o sistema SHALL exibir notificação visual
2. WHEN há mensagens não lidas THEN o sistema SHALL mostrar contador na interface
3. WHEN o agente está offline THEN o sistema SHALL enviar notificação por email
4. WHEN há conversas urgentes THEN o sistema SHALL priorizar notificações
5. WHEN notificações são desabilitadas THEN o sistema SHALL respeitar preferência do usuário