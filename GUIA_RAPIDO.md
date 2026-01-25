# 🚀 Guia Rápido - Novas Funcionalidades

## 📋 Índice
1. [Controle de Usuários](#1-controle-de-usuários)
2. [Alertas de Estoque](#2-alertas-de-estoque)
3. [Análise de Giro](#3-análise-de-giro)
4. [Exportar Relatórios](#4-exportar-relatórios)
5. [QR Codes e Códigos de Barras](#5-qr-codes-e-códigos-de-barras)

---

## 1. Controle de Usuários

### Roles Disponíveis

| Role | Permissões | Uso Recomendado |
|------|-----------|-----------------|
| **ADMIN** | Todas | Dono/Gerente |
| **ESTOQUE** | Criar, Editar, Visualizar, Exportar | Operador de estoque |
| **VISUALIZACAO** | Visualizar, Exportar | Contador, Auditor |

### Como Verificar Permissões (Backend)

```typescript
import { requirePermission } from './server/auth/middleware';

// Em qualquer mutation/query protegida:
.mutation(async ({ ctx, input }) => {
  requirePermission(ctx.user.role, "CREATE");
  // Código continua apenas se usuário tiver permissão
})
```

### Alterar Role de Usuário (SQL)

```sql
UPDATE users SET role = 'ADMIN' WHERE id = 1;
UPDATE users SET role = 'ESTOQUE' WHERE id = 2;
UPDATE users SET role = 'VISUALIZACAO' WHERE id = 3;
```

---

## 2. Alertas de Estoque

### Dashboard com Alertas

```typescript
// Frontend - React Query
const { data } = trpc.dashboard.statsWithAlerts.useQuery();

console.log(data.stockAlerts);
// {
//   critical: 5,   // Produtos críticos
//   low: 10,       // Estoque baixo
//   warning: 15,   // Atenção
//   total: 100     // Total de produtos
// }
```

### Relatório Completo de Alertas

```typescript
const { data } = trpc.reports.stockAlerts.useQuery();

console.log(data);
// {
//   summary: { critical: 5, low: 10, warning: 15, normal: 70, total: 100 },
//   alerts: [
//     {
//       id: 1,
//       name: "Produto A",
//       quantity: 3,
//       minStock: 10,
//       stockCheck: {
//         level: "CRITICAL",
//         message: "⛔ CRÍTICO: Estoque abaixo do mínimo!"
//       }
//     }
//   ]
// }
```

### Níveis de Criticidade

- 🔴 **CRITICAL** - Quantidade ≤ Mínimo
- 🟡 **LOW** - Quantidade até 120% do mínimo
- 🟠 **WARNING** - Quantidade até 150% do mínimo
- 🟢 **NORMAL** - Quantidade > 150% do mínimo

---

## 3. Análise de Giro

### Relatório Completo de Giro

```typescript
const { data } = trpc.reports.productTurnover.useQuery();

console.log(data);
// {
//   summary: {
//     totalProducts: 100,
//     encalhados: 15,
//     baixoGiro: 25,
//     giroMedio: 40,
//     altoGiro: 20
//   },
//   products: [
//     {
//       productId: 1,
//       productName: "Produto A",
//       totalEntradas: 100,
//       totalSaidas: 80,
//       turnoverRate: 80,
//       turnoverPercentage: 80,
//       status: "ALTO_GIRO",
//       statusMessage: "🚀 ALTO GIRO: Produto com excelente saída"
//     }
//   ],
//   stagnant: [...]  // Produtos sem movimento
// }
```

### Giro de Produto Específico

```typescript
const { data } = trpc.reports.productTurnoverById.useQuery({
  productId: 1,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

console.log(data);
// {
//   turnoverRate: 75,
//   status: "ALTO_GIRO",
//   averageDailySales: 2.5,
//   daysAnalyzed: 365
// }
```

### Produtos Encalhados

```typescript
const { data } = trpc.reports.stagnantProducts.useQuery({
  minDays: 30  // Sem venda há 30+ dias
});

console.log(data);
// [
//   {
//     id: 5,
//     name: "Produto Encalhado",
//     daysSinceLastSale: 45,
//     quantity: 50
//   }
// ]
```

### Interpretação dos Status

| Status | Taxa de Giro | Ação Recomendada |
|--------|--------------|------------------|
| 🚀 **ALTO_GIRO** | > 70% | Manter estoque, produto vendendo bem |
| 📊 **GIRO_MEDIO** | 30-70% | Monitorar, vendas moderadas |
| ⚠️ **BAIXO_GIRO** | < 30% | Revisar preço, fazer promoção |
| ⛔ **ENCALHADO** | 0% | Promoção urgente ou descontinuar |

---

## 4. Exportar Relatórios

### Exportar Produtos para Excel

```typescript
const { data } = trpc.exports.productsExcel.useQuery();

// Converter Base64 para download
const downloadExcel = (base64Data: string, filename: string) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

downloadExcel(data.data, 'produtos.xlsx');
```

### Exportar para PDF

```typescript
const { data } = trpc.exports.productsPDF.useQuery();

const downloadPDF = (base64Data: string, filename: string) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

downloadPDF(data.data, 'produtos.pdf');
```

### Relatório Completo (Múltiplas Abas)

```typescript
const { data } = trpc.exports.completeReport.useQuery();
// Retorna Excel com 3 abas:
// - Produtos
// - Transações
// - Análise de Giro
```

### Todos os Endpoints de Exportação

| Endpoint | Formato | Conteúdo |
|----------|---------|----------|
| `exports.productsExcel` | Excel | Lista de produtos |
| `exports.productsPDF` | PDF | Lista de produtos |
| `exports.transactionsExcel` | Excel | Histórico de transações |
| `exports.transactionsPDF` | PDF | Histórico de transações |
| `exports.turnoverExcel` | Excel | Análise de giro |
| `exports.turnoverPDF` | PDF | Análise de giro |
| `exports.completeReport` | Excel | Relatório completo (3 abas) |
| `exports.lowStockPDF` | PDF | Alertas de estoque crítico |

---

## 5. QR Codes e Códigos de Barras

### Gerar QR Code de Produto

```typescript
const { data } = trpc.products.generateQRCode.useQuery({ 
  productId: 1 
});

// Usar diretamente em <img>
<img src={data.qrCode} alt="QR Code" />
```

### Gerar Código de Barras

```typescript
const { data } = trpc.products.generateBarcode.useQuery({ 
  productId: 1 
});

// Converter Base64 para imagem
<img src={`data:image/png;base64,${data.barcode}`} alt="Barcode" />
```

### Gerar Etiqueta Completa

```typescript
const { data } = trpc.products.generateLabel.useQuery({ 
  productId: 1 
});

console.log(data);
// {
//   qrCode: "data:image/png;base64,...",
//   barcode: "base64string...",
//   productInfo: {
//     id: 1,
//     name: "Produto A",
//     price: "99.90",
//     quantity: 50
//   }
// }

// Renderizar etiqueta
<div className="label">
  <h3>{data.productInfo.name}</h3>
  <p>R$ {data.productInfo.price}</p>
  <img src={data.qrCode} />
  <img src={`data:image/png;base64,${data.barcode}`} />
</div>
```

### Gerar em Massa

```typescript
// QR Codes de todos os produtos
const { data } = trpc.barcodes.bulkQRCodes.useQuery();

// Ou apenas produtos específicos
const { data } = trpc.barcodes.bulkQRCodes.useQuery({
  productIds: [1, 2, 3, 4, 5]
});

// Códigos de barras em massa
const { data } = trpc.barcodes.bulkBarcodes.useQuery();
```

### Componente React de Exemplo

```tsx
import { trpc } from './trpc';

function ProductLabel({ productId }: { productId: number }) {
  const { data, isLoading } = trpc.products.generateLabel.useQuery({ 
    productId 
  });

  if (isLoading) return <div>Gerando etiqueta...</div>;
  if (!data) return <div>Erro ao gerar etiqueta</div>;

  return (
    <div className="product-label">
      <h2>{data.productInfo.name}</h2>
      <div className="price">R$ {data.productInfo.price}</div>
      <div className="codes">
        <img src={data.qrCode} alt="QR Code" className="qr-code" />
        <img 
          src={`data:image/png;base64,${data.barcode}`} 
          alt="Código de Barras" 
          className="barcode" 
        />
      </div>
      <div className="stock">Estoque: {data.productInfo.quantity}</div>
    </div>
  );
}
```

---

## 🎯 Dicas de Uso

### 1. Dashboard Inicial
Sempre mostre os alertas de estoque no dashboard principal:
```typescript
const { data } = trpc.dashboard.statsWithAlerts.useQuery();
```

### 2. Página de Produtos
Adicione botões de ação rápida:
- 📊 Ver Giro
- 📄 Exportar PDF
- 🏷️ Gerar Etiqueta

### 3. Relatórios
Crie uma página dedicada com:
- Filtros por período
- Exportação em múltiplos formatos
- Visualização de gráficos

### 4. Permissões
Sempre verifique permissões no frontend:
```typescript
const { data: user } = trpc.auth.me.useQuery();

{user?.role === 'ADMIN' && (
  <button>Gerenciar Usuários</button>
)}
```

---

## 📞 Suporte

Para mais detalhes, consulte:
- `MELHORIAS_IMPLEMENTADAS.md` - Documentação completa
- `server/services/` - Código-fonte dos serviços
- `server/routers.ts` - Endpoints disponíveis

---

*Guia atualizado em: ${new Date().toLocaleDateString('pt-BR')}*
