// 🕷️ SpiderTV Bot - JavaScript da Interface Web

class SpiderTVBot {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkServerStatus();
        this.updateQueueStatus();
        this.startAutoRefresh();
        this.addLog('✅ Interface inicializada com sucesso', 'success');
    }

    setupEventListeners() {
        // Formulários de renovação
        document.getElementById('form-3servidores').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRenewal('3servidores', e.target);
        });

        document.getElementById('form-servidor1').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRenewal('servidor1', e.target);
        });

        document.getElementById('form-servidor2').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRenewal('servidor2', e.target);
        });

        document.getElementById('form-servidor3').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRenewal('servidor3', e.target);
        });

        // Botões de controle
        document.getElementById('refresh-queue').addEventListener('click', () => {
            this.updateQueueStatus();
        });

        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearLog();
        });

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.updateQueueStatus();
            }
        });
    }

    async handleRenewal(endpoint, form) {
        const formData = new FormData(form);
        const data = {
            code: formData.get('code'),
            months: parseInt(formData.get('months'))
        };

        if (!data.code) {
            this.showError('Código do cliente é obrigatório');
            return;
        }

        const serverName = this.getServerName(endpoint);
        this.addLog(`🔄 Iniciando renovação: ${data.code} (${data.months} meses) - ${serverName}`, 'info');
        
        this.showLoading(`Renovando cliente ${data.code} no ${serverName}...`);
        this.disableForm(form);

        try {
            const response = await fetch(`${this.baseUrl}/activate/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                this.addLog(`✅ Sucesso: ${result.message}`, 'success');
                this.showSuccess(result.message);
                form.reset();
            } else {
                const errorMsg = result.error || 'Erro desconhecido';
                this.addLog(`❌ Erro: ${errorMsg}`, 'error');
                this.showError(errorMsg);
            }

            // Atualizar fila após renovação
            setTimeout(() => this.updateQueueStatus(), 1000);

        } catch (error) {
            const errorMsg = `Erro de conexão: ${error.message}`;
            this.addLog(`💥 ${errorMsg}`, 'error');
            this.showError(errorMsg);
        } finally {
            this.hideLoading();
            this.enableForm(form);
        }
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('server-status').textContent = '✅ Servidor Online';
                document.getElementById('server-status').style.color = '#4CAF50';
                this.addLog('✅ Servidor está online e funcionando', 'success');
            } else {
                throw new Error('Servidor não respondeu corretamente');
            }
        } catch (error) {
            document.getElementById('server-status').textContent = '❌ Servidor Offline';
            document.getElementById('server-status').style.color = '#f44336';
            this.addLog('❌ Erro ao conectar com o servidor', 'error');
        }
    }

    async updateQueueStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/fila`);
            const data = await response.json();
            
            const queueContainer = document.getElementById('queue-status');
            
            if (data.filaAtual === 0) {
                queueContainer.innerHTML = `
                    <div class="info-message">
                        <strong>📋 Fila vazia</strong><br>
                        Nenhuma renovação em andamento
                    </div>
                `;
            } else {
                let html = `
                    <div class="info-message">
                        <strong>📋 Fila de Renovações</strong><br>
                        ${data.filaAtual} cliente(s) na fila
                        ${data.processandoAtualmente ? ' | 🔄 Processando...' : ''}
                    </div>
                `;
                
                if (data.proximosClientes && data.proximosClientes.length > 0) {
                    html += '<div style="margin-top: 15px;">';
                    data.proximosClientes.forEach((cliente, index) => {
                        html += `
                            <div class="queue-item">
                                <span><strong>${index + 1}.</strong> Cliente ${cliente.cliente}</span>
                                <span>${cliente.meses} meses - ${cliente.servidor}</span>
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                
                queueContainer.innerHTML = html;
            }
            
        } catch (error) {
            document.getElementById('queue-status').innerHTML = `
                <div class="error-message">
                    ❌ Erro ao carregar status da fila
                </div>
            `;
        }
    }

    getServerName(endpoint) {
        const names = {
            '3servidores': 'Todos os Servidores',
            'servidor1': 'TropicalPlayTV',
            'servidor2': 'SpiderTV',
            'servidor3': 'Premium Server'
        };
        return names[endpoint] || endpoint;
    }

    showLoading(message) {
        const modal = document.getElementById('loading-modal');
        const text = document.getElementById('loading-text');
        text.textContent = message;
        modal.style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-modal').style.display = 'none';
    }

    disableForm(form) {
        const inputs = form.querySelectorAll('input, select, button');
        inputs.forEach(input => input.disabled = true);
    }

    enableForm(form) {
        const inputs = form.querySelectorAll('input, select, button');
        inputs.forEach(input => input.disabled = false);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remover notificações existentes
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}-message`;
        notification.innerHTML = `
            <strong>${type === 'success' ? '✅ Sucesso!' : '❌ Erro!'}</strong><br>
            ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('activity-log');
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Manter apenas os últimos 50 logs
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    clearLog() {
        const logContainer = document.getElementById('activity-log');
        logContainer.innerHTML = '<p class="log-entry">✅ Log limpo</p>';
    }

    startAutoRefresh() {
        // Atualizar status da fila a cada 10 segundos
        setInterval(() => {
            this.updateQueueStatus();
        }, 10000);

        // Verificar status do servidor a cada 30 segundos
        setInterval(() => {
            this.checkServerStatus();
        }, 30000);
    }

    // Métodos utilitários
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.addLog('📋 Copiado para a área de transferência', 'info');
        });
    }
}

// CSS adicional para notificações
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.spiderTVBot = new SpiderTVBot();
});

// Adicionar alguns atalhos de teclado úteis
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter para focar no primeiro campo de código
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const firstCodeInput = document.getElementById('code-3servidores');
        if (firstCodeInput) {
            firstCodeInput.focus();
            firstCodeInput.select();
        }
    }
    
    // Escape para fechar modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('loading-modal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// Adicionar funcionalidade de preenchimento rápido
document.addEventListener('input', (e) => {
    if (e.target.type === 'text' && e.target.name === 'code') {
        // Auto-completar códigos comuns (exemplo)
        const commonCodes = ['648718886', '359503850'];
        const value = e.target.value;
        
        if (value.length >= 3) {
            const matches = commonCodes.filter(code => code.startsWith(value));
            if (matches.length === 1 && matches[0] !== value) {
                // Sugerir auto-completar
                e.target.setAttribute('data-suggestion', matches[0]);
            }
        }
    }
});

console.log('🕷️ SpiderTV Bot Interface carregada com sucesso!');
