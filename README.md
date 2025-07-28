# Expert Notes v2 🎤📝

Uma versão melhorada e inteligente do aplicativo de notas, com **sistema de áudio adaptativo** que detecta as capacidades do seu navegador e oferece a melhor experiência possível.

## ✨ Principais Melhorias

### 🧠 **Sistema de Áudio Inteligente**
- **Chrome/Edge/Firefox**: Gravação + transcrição automática ✅
- **Opera GX/Safari**: Apenas digitação (sem botão de microfone desnecessário) ✅
- **Detecção automática**: Interface se adapta às capacidades do navegador
- **Sem frustrações**: Se não funciona, não aparece!

### 📋 **Sistema de Tarefas (To-Do)**
- Criar tarefas por voz (navegadores compatíveis) ou texto
- Marcar como concluído/pendente
- Editar tarefas existentes
- Filtros por status e tipo

### 🔍 **Busca e Filtros Avançados**
- Busca em tempo real por conteúdo
- Filtros: Todos, Notas, Tarefas, Pendentes, Concluídas
- Estatísticas visuais em tempo real
- Estado vazio com sugestões

### 🎨 **Interface Moderna**
- Design responsivo e elegante
- Feedback visual claro sobre compatibilidade
- Custom branding "expert-notes v2"
- Animações e transições suaves

## 🚀 Como Funciona

### **Navegadores Compatíveis (Chrome, Edge, Firefox):**
1. Clique no card "Criar nova nota/tarefa"
2. Use o botão 🎤 para gravar com transcrição automática
3. OU digite diretamente no campo de texto
4. Salve e organize com filtros

### **Navegadores com Limitações (Opera GX, Safari):**
1. Clique no card "Digitar tarefa/nota"
2. Interface mostra "Modo Digitação - Opera GX"
3. Campo de texto otimizado para digitação
4. **Sem botão de microfone** (evita confusão)
5. Experiência limpa e funcional

## 🛠️ Stack Tecnológica

- **React 18** + **TypeScript**
- **Vite** (build e desenvolvimento)
- **Tailwind CSS** (estilização)
- **Radix UI** (componentes acessíveis)
- **Lucide React** (ícones)
- **Sonner** (notificações)
- **Date-fns** (datas)

## 🎯 Arquitetura do Sistema de Áudio

### **Detecção Inteligente:**
```typescript
// Detecta navegadores incompatíveis
const isOperaBased = /Opera|OPR/.test(navigator.userAgent)
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
const isIncompatible = isOperaBased || isSafari

// Adapta interface baseado nas capacidades
{isIncompatible ? (
  // Modo digitação apenas
  <TextInput />
) : (
  // Modo completo com áudio
  <AudioInput />
)}
```

### **APIs Utilizadas:**
1. **SpeechRecognition API** - Para transcrição automática (Chrome/Edge/Firefox)
2. **MediaRecorder API** - Para gravação de áudio (todos os navegadores)
3. **Navigator.userAgent** - Para detecção de navegador

## 📊 Funcionalidades Implementadas

### ✅ **Notas:**
- Criar por voz ou texto
- Editar conteúdo
- Excluir notas
- Busca por conteúdo

### ✅ **Tarefas (To-Do):**
- Criar por voz ou texto
- Marcar como concluída
- Editar tarefas
- Filtrar por status

### ✅ **Interface:**
- Estatísticas em tempo real
- Filtros dinâmicos
- Busca instantânea
- Estados vazios informativos
- Responsividade completa

### ✅ **Compatibilidade:**
- Detecção automática de navegador
- Interface adaptativa
- Feedback visual claro
- Fallbacks inteligentes

## 🚀 Instalação e Execução

```bash
# Clonar repositório
git clone https://github.com/SCamposs/expert-notes-v2.git
cd expert-notes-v2

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔒 Privacidade e Dados

- ✅ **100% Local**: Todos os dados ficam no `localStorage`
- ✅ **Sem Servidor**: Nenhuma informação enviada externamente
- ✅ **Sem Cookies**: Não utiliza cookies ou tracking
- ✅ **Áudio Local**: Processamento de áudio feito no dispositivo

## 🎮 Para Usuários do Opera GX

**Mensagem especial para gamers! 🎮**

Sabemos que o Opera GX é o navegador perfeito para gaming, e por isso otimizamos especialmente para vocês:

- ✅ **Interface limpa**: Sem botões que não funcionam
- ✅ **Modo digitação**: Otimizado para rapidez
- ✅ **Sem confusão**: O que você vê é o que funciona
- ✅ **Performance**: Leve e rápido como vocês gostam

**Keep gaming!** 🚀

## 📈 Melhorias V1 → V2

| Funcionalidade | V1 (Original) | V2 (Melhorado) |
|---|---|---|
| **Áudio** | Só Chrome | Inteligente para cada navegador |
| **Interface** | Fixa | Adaptativa |
| **Tarefas** | ❌ | ✅ Sistema completo |
| **Busca** | ❌ | ✅ Busca em tempo real |
| **Filtros** | ❌ | ✅ Filtros avançados |
| **Estatísticas** | ❌ | ✅ Dashboard em tempo real |
| **Compatibilidade** | Limitada | Cross-browser inteligente |
| **UX** | Frustrante em alguns navegadores | Sempre funcional |

## 🔧 Configuração de Desenvolvimento

### **Estrutura do Projeto:**
```
src/
├── components/
│   ├── new-note-card.tsx    # Criação de notas
│   ├── new-todo-card.tsx    # Criação de tarefas
│   ├── note-card.tsx        # Exibição de notas
│   └── todo-card.tsx        # Exibição de tarefas
├── hooks/
│   ├── useAudioRecording.ts # Hook de áudio inteligente
│   └── useStorageV2.ts      # Hook de armazenamento unificado
└── app.tsx                  # Componente principal
```

### **Hooks Principais:**
- `useAudioRecording`: Gerencia gravação e transcrição
- `useStorageV2`: Gerencia notas e tarefas no localStorage

## 🤝 Contribuições

Este projeto é uma evolução do projeto original da **Rocketseat NLW Expert**, com foco em:
- Melhor compatibilidade cross-browser
- Interface mais intuitiva
- Funcionalidades expandidas
- Experiência do usuário aprimorada

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**🎯 Objetivo alcançado:** Criar um sistema de notas que funciona perfeitamente em qualquer navegador, sem frustrações ou funcionalidades falsas!