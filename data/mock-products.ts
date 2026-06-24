import { Product } from '@/types/product'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camisa São Paulo FC 2024',
    slug: 'camisa-sao-paulo-2024',
    shortDescription: 'Camisa oficial do São Paulo FC temporada 2024',
    longDescription:
      'Camisa oficial do São Paulo FC para a temporada 2024. Confeccionada em material respirável, com tecnologia anti-suor. Perfeita para torcedores e praticantes de futebol.',
    price: 189.99,
    promotionalPrice: 149.99,
    category: 'Camisas',
    club: 'São Paulo FC',
    images: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v1', size: 'P', color: 'Vermelho', sku: 'SAO-2024-P-RED', stock: 15 },
      { id: 'v2', size: 'M', color: 'Vermelho', sku: 'SAO-2024-M-RED', stock: 20 },
      { id: 'v3', size: 'G', color: 'Vermelho', sku: 'SAO-2024-G-RED', stock: 18 },
      { id: 'v4', size: 'GG', color: 'Vermelho', sku: 'SAO-2024-GG-RED', stock: 10 },
    ],
    status: 'active',
  },
  {
    id: '2',
    name: 'Camisa Seleção Brasileira Away',
    slug: 'camisa-selecao-away',
    shortDescription: 'Camisa da Seleção Brasileira uniforme visitante',
    longDescription:
      'Uniforme oficial da Seleção Brasileira para jogos como visitante. Combinação clássica de branco e azul com detalhes em verde.',
    price: 229.99,
    promotionalPrice: 179.99,
    category: 'Camisas',
    club: 'Seleção Brasileira',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c006b310?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c006b310?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v5', size: 'P', color: 'Branco', sku: 'BRA-AWAY-P-WHT', stock: 12 },
      { id: 'v6', size: 'M', color: 'Branco', sku: 'BRA-AWAY-M-WHT', stock: 25 },
      { id: 'v7', size: 'G', color: 'Branco', sku: 'BRA-AWAY-G-WHT', stock: 22 },
      { id: 'v8', size: 'GG', color: 'Branco', sku: 'BRA-AWAY-GG-WHT', stock: 8 },
    ],
    status: 'active',
  },
  {
    id: '3',
    name: 'Short Esportivo Pro',
    slug: 'short-esportivo-pro',
    shortDescription: 'Short com tecnologia de secagem rápida',
    longDescription:
      'Short esportivo de alta performance com tecnologia de secagem rápida e bolsos com zíper. Ideal para treinos e competições.',
    price: 99.99,
    promotionalPrice: 79.99,
    category: 'Shorts',
    images: [
      'https://images.unsplash.com/photo-1506629082847-11d82011a6a5?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506629082847-11d82011a6a5?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v9', size: 'P', color: 'Preto', sku: 'SHORT-PRO-P-BLK', stock: 30 },
      { id: 'v10', size: 'M', color: 'Preto', sku: 'SHORT-PRO-M-BLK', stock: 35 },
      { id: 'v11', size: 'G', color: 'Preto', sku: 'SHORT-PRO-G-BLK', stock: 28 },
      { id: 'v12', size: 'P', color: 'Azul', sku: 'SHORT-PRO-P-BLU', stock: 25 },
      { id: 'v13', size: 'M', color: 'Azul', sku: 'SHORT-PRO-M-BLU', stock: 32 },
    ],
    status: 'active',
  },
  {
    id: '4',
    name: 'Meia Compressão Running',
    slug: 'meia-compressao-running',
    shortDescription: 'Meia com compressão gradual para melhor circulação',
    longDescription:
      'Meia de compressão especialmente desenvolvida para corredores. Tecnologia de compressão gradual auxilia na circulação e reduz fadiga muscular.',
    price: 59.99,
    category: 'Meias',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v14', size: 'Único', color: 'Cinza', sku: 'MEIA-COMP-CINZA', stock: 50 },
      { id: 'v15', size: 'Único', color: 'Preto', sku: 'MEIA-COMP-PRETO', stock: 45 },
    ],
    status: 'active',
  },
  {
    id: '5',
    name: 'Jaqueta Corta-Vento',
    slug: 'jaqueta-corta-vento',
    shortDescription: 'Jaqueta leve com proteção contra vento',
    longDescription:
      'Jaqueta corta-vento perfeita para atividades ao ar livre. Material leve e respirável, com bolsos laterais e cordão ajustável.',
    price: 249.99,
    promotionalPrice: 199.99,
    category: 'Jaquetas',
    images: [
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v16', size: 'P', color: 'Preto', sku: 'JAQ-VENTO-P-BLK', stock: 12 },
      { id: 'v17', size: 'M', color: 'Preto', sku: 'JAQ-VENTO-M-BLK', stock: 15 },
      { id: 'v18', size: 'G', color: 'Preto', sku: 'JAQ-VENTO-G-BLK', stock: 10 },
      { id: 'v19', size: 'P', color: 'Azul Marinho', sku: 'JAQ-VENTO-P-NVY', stock: 8 },
    ],
    status: 'active',
  },
  {
    id: '6',
    name: 'Boné Ajustável Classic',
    slug: 'bone-ajustavel-classic',
    shortDescription: 'Boné clássico com ajuste traseiro',
    longDescription:
      'Boné esportivo clássico com fivela ajustável. Aba estruturada e tela respirável. Ideal para sol e estilo.',
    price: 49.99,
    category: 'Acessórios',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop',
    ],
    variations: [
      { id: 'v20', size: 'Único', color: 'Preto', sku: 'BONE-CLASS-BLK', stock: 40 },
      { id: 'v21', size: 'Único', color: 'Branco', sku: 'BONE-CLASS-WHT', stock: 35 },
      { id: 'v22', size: 'Único', color: 'Vermelho', sku: 'BONE-CLASS-RED', stock: 30 },
    ],
    status: 'active',
  },
]

export const categories = [
  'Camisas',
  'Shorts',
  'Meias',
  'Jaquetas',
  'Acessórios',
]

export const clubs = [
  'São Paulo FC',
  'Seleção Brasileira',
  'Corinthians',
  'Palmeiras',
  'Flamengo',
]
