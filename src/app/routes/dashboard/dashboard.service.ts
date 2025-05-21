import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApexOptions } from 'apexcharts';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface StockAlert {
  name: string;
  currentStock: number;
  minStock: number;
  lastOrdered: string;
}

export interface ExpiryAlert {
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Paracetamol 500mg', weight: 25, symbol: 'PCT500' },
  { position: 2, name: 'Amoxicillin 250mg', weight: 15, symbol: 'AMX250' },
  { position: 3, name: 'Omeprazole 20mg', weight: 8, symbol: 'OMP20' },
  { position: 4, name: 'Metformin 500mg', weight: 30, symbol: 'MTF500' },
  { position: 5, name: 'Atorvastatin 20mg', weight: 12, symbol: 'ATV20' },
];

const TOP_PRODUCTS: TopProduct[] = [
  { name: 'Paracetamol 500mg', sales: 450, revenue: 2250, growth: 15 },
  { name: 'Amoxicillin 250mg', sales: 320, revenue: 1600, growth: 8 },
  { name: 'Omeprazole 20mg', sales: 280, revenue: 1400, growth: 12 },
  { name: 'Metformin 500mg', sales: 350, revenue: 1750, growth: 5 },
  { name: 'Atorvastatin 20mg', sales: 220, revenue: 1100, growth: 10 },
];

const STOCK_ALERTS: StockAlert[] = [
  { name: 'Paracetamol 500mg', currentStock: 25, minStock: 50, lastOrdered: '2024-03-15' },
  { name: 'Amoxicillin 250mg', currentStock: 15, minStock: 40, lastOrdered: '2024-03-18' },
  { name: 'Omeprazole 20mg', currentStock: 8, minStock: 30, lastOrdered: '2024-03-20' },
  { name: 'Metformin 500mg', currentStock: 30, minStock: 60, lastOrdered: '2024-03-22' },
  { name: 'Atorvastatin 20mg', currentStock: 12, minStock: 35, lastOrdered: '2024-03-25' },
];

const EXPIRY_ALERTS: ExpiryAlert[] = [
  { name: 'Amoxicillin 250mg', batchNumber: 'B12345', expiryDate: '2024-04-15', quantity: 100 },
  { name: 'Metformin 500mg', batchNumber: 'B12346', expiryDate: '2024-04-20', quantity: 150 },
  { name: 'Atorvastatin 20mg', batchNumber: 'B12347', expiryDate: '2024-04-25', quantity: 80 },
  { name: 'Omeprazole 20mg', batchNumber: 'B12348', expiryDate: '2024-05-01', quantity: 120 },
  { name: 'Paracetamol 500mg', batchNumber: 'B12349', expiryDate: '2024-05-05', quantity: 200 },
];

const MESSAGES = [
  {
    img: 'images/heros/1.jpg',
    subject: 'Low Stock Alert',
    content: 'Paracetamol 500mg is running low. Current stock: 25 units',
  },
  {
    img: 'images/heros/2.jpg',
    subject: 'Expiry Notice',
    content: 'Amoxicillin 250mg batch #12345 expires in 30 days',
  },
  {
    img: 'images/heros/3.jpg',
    subject: 'New Stock Arrived',
    content: 'New batch of Omeprazole 20mg has been received',
  },
  {
    img: 'images/heros/4.jpg',
    subject: 'Prescription Update',
    content: 'Dr. Smith has updated prescription for patient #1234',
  },
];

@Injectable()
export class DashboardService {
  private http = inject(HttpClient);

  stats = [
    {
      title: 'Today\'s Sales',
      amount: '$3,250',
      progress: {
        value: 75,
      },
      color: 'bg-azure-50',
    },
    {
      title: 'Pending Prescriptions',
      amount: '18',
      progress: {
        value: 30,
      },
      color: 'bg-blue-50',
    },
    {
      title: 'Low Stock Items',
      amount: '5',
      progress: {
        value: 20,
      },
      color: 'bg-red-50',
    },
    {
      title: 'Expiring Soon',
      amount: '5',
      progress: {
        value: 40,
      },
      color: 'bg-orange-50',
    },
  ];

  charts: ApexOptions[] = [
    {
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      series: [
        {
          name: 'Prescription Sales',
          data: [3100, 4000, 2800, 5100, 4200, 4900, 5000],
        },
        {
          name: 'OTC Sales',
          data: [2100, 3200, 4500, 3200, 3400, 4200, 4100],
        },
      ],
      xaxis: {
        type: 'datetime',
        categories: [
          '2024-03-18T00:00:00',
          '2024-03-19T00:00:00',
          '2024-03-20T00:00:00',
          '2024-03-21T00:00:00',
          '2024-03-22T00:00:00',
          '2024-03-23T00:00:00',
          '2024-03-24T00:00:00',
        ],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy',
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
    },
    {
      chart: {
        height: 350,
        type: 'bar',
      },
      series: [
        {
          name: 'Revenue',
          data: [4500, 5200, 4800, 5100, 4900, 5500, 6000],
        },
      ],
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      colors: ['#FF4560'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => '$' + val.toString(),
        },
      },
    },
    {
      chart: {
        height: 350,
        type: 'pie',
      },
      series: [35, 25, 15, 15, 10],
      labels: ['Prescription', 'OTC', 'Medical Devices', 'Supplements', 'Others'],
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '0%',
          },
          customScale: 0.9,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toFixed(1) + '%';
        },
      },
    },
  ];

  getData() {
    return ELEMENT_DATA;
  }

  getMessages() {
    return MESSAGES;
  }

  getCharts() {
    return this.charts;
  }

  getStats() {
    return this.stats;
  }

  getTopProducts() {
    return TOP_PRODUCTS;
  }

  getStockAlerts() {
    return STOCK_ALERTS;
  }

  getExpiryAlerts() {
    return EXPIRY_ALERTS;
  }
}
