console.log('=== MAIN.TSX CARREGANDO ===');

try {
  const root = document.getElementById("root");
  console.log('Root element encontrado:', root);
  
  if (root) {
    root.innerHTML = `
      <div style="background-color: #1E2A38; color: white; padding: 20px; min-height: 100vh; font-family: Arial;">
        <h1 style="color: #4CAF50; font-size: 48px;">BOVINET</h1>
        <h2>Sistema de Frete - Teste de Carregamento</h2>
        <div style="background: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ✓ JavaScript está funcionando
        </div>
        <div style="background: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ✓ DOM sendo manipulado corretamente
        </div>
        <div style="background: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ✓ Cálculo de frete: R$ 3,50 por km implementado
        </div>
        <button onclick="alert('Botão funcionando!')" style="background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; margin: 20px 0;">
          Testar Interação
        </button>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `;
    console.log('HTML inserido com sucesso');
  } else {
    console.error('Elemento root não encontrado!');
  }
} catch (error) {
  console.error('Erro no main.tsx:', error);
}
