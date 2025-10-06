import { Product, Sale, Role } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Cuffie Wireless Pro',
    description: 'Cuffie con cancellazione del rumore, audio ad alta fedeltà e 20 ore di autonomia. Perfette per musica e chiamate.',
    images: ['https://picsum.photos/seed/headphones/600/400', 'https://picsum.photos/seed/headphones2/600/400'],
    endpointUrl: 'https://api.mws.com/purchase/prod-1',
    price: 149.99,
    affiliateCommission: 20.00,
    platformCommission: 15.00,
    affiliatePenalties: [],
  },
  {
    id: 'prod-2',
    name: 'Smartwatch Fitness',
    description: 'Monitora la tua attività fisica, il sonno e le notifiche. Resistente all\'acqua e con GPS integrato.',
    images: ['https://picsum.photos/seed/smartwatch/600/400'],
    endpointUrl: 'https://api.mws.com/purchase/prod-2',
    price: 199.50,
    affiliateCommission: 25.00,
    platformCommission: 20.00,
    affiliatePenalties: [
        { affiliateId: 'user-3', affiliateName: 'Luca Bianchi', reason: 'Basso tasso di approvazione', date: new Date().toISOString() }
    ],
  },
  {
    id: 'prod-3',
    name: 'Zaino da Viaggio 40L',
    description: 'Zaino spazioso e resistente, ideale per weekend e viaggi brevi. Con scomparto per laptop e tasche multiple.',
    images: ['https://picsum.photos/seed/backpack/600/400', 'https://picsum.photos/seed/backpack2/600/400', 'https://picsum.photos/seed/backpack3/600/400'],
    endpointUrl: 'https://api.mws.com/purchase/prod-3',
    price: 89.90,
    affiliateCommission: 10.00,
    platformCommission: 8.00,
    affiliatePenalties: [],
  },
];

const generateSales = (): Sale[] => {
    const sales: Sale[] = [];
    const today = new Date();
    const affiliates = [
        { id: 'user-3', name: 'Luca Bianchi', role: Role.AFFILIATE, sourceId: 'lucab' },
        { id: 'user-4', name: 'Giulia Neri', role: Role.AFFILIATE, sourceId: 'giulian' },
    ]
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
        const affiliate = affiliates[Math.floor(Math.random() * 2)];
        
        const numSales = Math.floor(Math.random() * 5);
        for(let j=0; j<numSales; j++) {
            sales.push({
                productId: product.id,
                affiliateId: affiliate.id,
                date: date.toISOString(),
                amount: product.price,
                affiliateCommission: product.affiliateCommission
            });
        }
    }
    return sales;
}

export const mockSales: Sale[] = generateSales();
