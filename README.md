# **WhaTicket SaaS | Gold Edition**

Uma plataforma de atendimento robusta baseada no **Whaticket Gold**, aprimorada com um módulo Kanban, modo noturno e integrações avançadas para otimizar a comunicação com seus clientes. Distribuído por **Launcher & Co.**

-----

### **✨ Funcionalidades Principais**

  * **Gestão Visual:** Quadro **Kanban** integrado para organizar e priorizar tickets.
  * **Interface Agradável:** **Modo noturno** para conforto visual em ambientes com pouca luz.
  * **Automação e IA:**
      * DialogFlow
      * N8N
      * TypeBot
      * ChatGPT
  * **Conectividade:** Suporte a **WebHooks** para integrações personalizadas.

### **💻 Requisitos de Sistema**

Para garantir a melhor performance, seu servidor deve atender às seguintes especificações mínimas:

  * **Sistema Operacional:** Ubuntu 22.04 LTS.
  * **Processador (vCores):** 4 ou mais.
  * **Memória RAM:** 8 GB ou mais.
  * **NodeJS:** **Versão 20** é obrigatória para a instalação.
  * **Latência de Rede:** Ideal entre 10ms e 150ms. Latências muito baixas (\<10ms) ou muito altas (\>200ms) podem causar instabilidades.

#### **🚀 Provedores VPS Recomendados**

| Provedor | Plano | vCores | RAM | SSD NVMe | Preço Mensal | Cupom de Desconto |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Peramix** | Basic | 4 | 6 GB | 100 GB | $4.99 USD | `WHATICKET` (25% OFF no 1º pagamento) |
| **Peramix** | Standard | 6 | 12 GB | 200 GB | $9.99 USD | `WHATICKET` (25% OFF no 1º pagamento) |
| **Netcup** | VPS 1000 G11 | 4 | 8 GB | 256 GB | €5.75 | `36nc17542354680` (voucher de 5 euros) |
| **Netcup** | VPS 2000 G11 | 8 | 16 GB | 512 GB | €12.60 USD | `36nc17542354680` (voucher de 5 euros) |

  * Adquira aqui: [Peramix](https://control.peramix.com/?affid=14) | [Netcup](https://www.netcup.com/en/?ref=283810)

-----

### **📚 Documentação e Suporte**

  * **Documentação Completa:** Acesse nosso guia de instalação e configuração em: [launcher-and-co.gitbook.io/whaticketsaas/](https://launcher-and-co.gitbook.io/whaticketsaas/).
  * **Suporte Técnico:** O suporte é um serviço exclusivo para compradores. Após a compra, entre em contato via WhatsApp para obter seu acesso.

#### **🛒 Adquira o Pacote de Suporte**

  * [Loja InfinitePay](https://loja.infinitepay.io/launcher-tecnologia/aep0253-script-crm-whaticket-gold-com-saas-e-kanba/)
  * [Checkout Kirvano](https://pay.kirvano.com/a5103244-08d5-418f-8221-717289dd65f)
  * [Anúncio DFG](https://www.dfg.com.br/pt/outros/script-crm-whaticket-gold-com-saas-e-kanban-inclusos-939289065)

-----

**🔄 Ver Histórico de Versões (Changelog)**

#### **Versão 6.3.0** (`20/09/2025`)

  * Correção de bugs relacionados a JID/LID.

#### **Versão 6.0.0** (`16/04/2025`)

  * **Interface:**
      * Aprimoramentos no Dark Mode (mensagens).
      * Botão `Light/Dark` movido para o perfil do usuário.
      * Dashboard: alteração nos estilos dos cards (botão de impressão removido).
      * Estilo de ticket alterado.
      * Layouts reformulados para: Respostas Rápidas, Página de Conexão, Tela de Login e Tela de Signup.
      * Adicionada opção de `SuperAdmin`.
  * **Funcionalidades:**
      * Botão de tradução adicionado.
      * Aviso exibido quando o ticket de um contato está aberto.
  * **Correções:**
      * Correção no envio de menu de filas (na 3ª tentativa, o ticket é enviado para a 1ª fila).
      * Agendamento agora envia imagem com texto e suporta ciclos.
      * Correção de vazamento no WebSocket.

#### **Versão 5.5.0** (`13/12/2024`)

  * **Interface:**
      * Dashboard, Kanban e página de relatórios reformulados.
      * Validação de número em `ContactModal`.
  * **Funcionalidades:**
      * Recusa automática de chamadas.
      * Filas da conexão ao requisitar novo QR Code.
      * Áudio no iPhone.
      * Regressão OpenAI.
  * **Correções:**
      * Correção ao redimensionar a área de tickets.

#### **Versão 5.3.5** (`07/11/2024`)

  * **Funcionalidades:**
      * Automações não são mais enviadas para grupos.
      * Botão `disableBot` para desativar bots ou automações.
      * Permissão para conexões com o mesmo nome.
      * Opção de selecionar e deletar contatos na página de Contatos.
      * Atualização automática do valor na lista do Financeiro após alteração de plano.
  * **Correções:**
      * Correção da data de vencimento no topo (agora fixa).
      * Correção na mensagem citada.
      * Correção no envio de áudio OGG em respostas rápidas.
      * Expiração automática de conexões ao vencer a empresa.
  * **Alterações:**
      * Abas de visualização de tickets fechados e grupos por operador removidas do painel de usuários.

#### **Versão 5.2.6** (`24/07/2024`)

  * Fechamento de todos os tickets abertos ou em espera.
  * Capacidade de reagir a mensagens e encaminhá-las para outro ticket.
  * Notificação no chat quando uma mensagem é apagada no WhatsApp.
  * Aparência do menu aprimorada, com adição do botão `Sair`.
  * Indicação "Digitando" ou "Gravando" no canto inferior direito do ticket.
  * API atualizada.
  * Novo layout da página de login.

# **⚖️ Aviso Legal e Termos de Uso**

**1. Sobre o Código do Software Whaticket SAAS**

O código-fonte do Whaticket SAAS é um projeto **open source** (código aberto). Conforme a sua licença, você tem total liberdade para uso pessoal e comercial, o que inclui o direito de:

  * Utilizar o software para fins comerciais;
  * Modificar o código-fonte para adaptá-lo às suas necessidades;
  * Revender o software modificado ou em sua forma original.

**2. Sobre o Material de Apoio e Tutoriais (Conteúdo Autoral)**

Todo e qualquer material de apoio (videoaulas, guias, tutoriais, manuais e documentações) desenvolvido pela **Launcher Tecnologia Ltda ME** (CNPJ: **26.651.889/0001-60**, nome fantasia **Launcher Tech**, nome comercial **Launcher & Co.**) é classificado como conteúdo autoral e propriedade intelectual da empresa.

Estes materiais são destinados exclusivamente para o estudo e uso pessoal do comprador original. Portanto, é **ESTRITAMENTE PROIBIDO**:

  * A revenda ou qualquer outra forma de comercialização deste material.
  * O compartilhamento público do conteúdo em qualquer plataforma.
  * A realização de modificações, traduções, ou qualquer alteração que vise se apropriar da autoria do material.
  * A utilização do conteúdo para criar produtos derivados ou concorrentes.
  * Apresentar o material, no todo ou em parte, como se fosse de sua própria autoria.

**3. Proteção Legal e Penalidades**

Os materiais de apoio e tutoriais de autoria da Launcher & Co. são juridicamente protegidos pela **Avctoris**. A violação destes direitos autorais é crime. O infrator está sujeito às penalidades legais previstas na **Lei nº 9.610/98** (Lei de Direitos Autorais), na **Lei nº 9.279/96** (Lei de Propriedade Industrial) e no **art. 184 do Código Penal Brasileiro**, além de estar sujeito ao pagamento de indenização pelos prejuízos materiais e morais causados.

Ao adquirir e utilizar nosso material de apoio, você concorda integralmente com os termos aqui estabelecidos.
