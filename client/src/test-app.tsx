export default function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E2A38',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#4CAF50', fontSize: '3rem', marginBottom: '20px' }}>
        🐄 BOVINET
      </h1>
      <h2 style={{ marginBottom: '30px' }}>
        Sistema Funcionando Perfeitamente!
      </h2>
      <div style={{
        background: '#2A3A4A',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ marginBottom: '15px' }}>
          ✅ React carregado com sucesso
        </p>
        <p style={{ marginBottom: '15px' }}>
          ✅ Sistema restaurado para configuração original
        </p>
        <p style={{ marginBottom: '15px' }}>
          ✅ Preview funcionando normalmente
        </p>
        <p>
          🎯 Pronto para desenvolvimento
        </p>
      </div>
    </div>
  );
}