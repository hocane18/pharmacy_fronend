import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { SettingsService } from '@core';
import { MtxAlertModule } from '@ng-matero/extensions/alert';
import { MtxProgressModule } from '@ng-matero/extensions/progress';
import { Subscription } from 'rxjs';
import { DashboardService, TopProduct, StockAlert, ExpiryAlert } from './dashboard.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardService],
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatGridListModule,
    MatTableModule,
    MatTabsModule,
    MtxProgressModule,
    MtxAlertModule,
    NgApexchartsModule,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly settings = inject(SettingsService);
  private readonly dashboardSrv = inject(DashboardService);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  topProductColumns: string[] = ['name', 'sales', 'revenue', 'growth'];
  stockAlertColumns: string[] = ['name', 'currentStock', 'minStock', 'lastOrdered'];
  expiryAlertColumns: string[] = ['name', 'batchNumber', 'expiryDate', 'quantity'];
  
  dataSource: any[] = [];
  topProducts: TopProduct[] = [];
  stockAlerts: StockAlert[] = [];
  expiryAlerts: ExpiryAlert[] = [];
  messages: any[] = [];
  stats: any[] = [];
  charts: any[] = [];
  chartInstances: ApexCharts[] = [];

  notifySubscription = Subscription.EMPTY;

  isShowAlert = true;

  introducingItems = [
    {
      name: 'Acrodata GUI',
      description: 'A JSON powered GUI for configurable panels.',
      link: 'https://github.com/acrodata/gui',
    },
    {
      name: 'Code Editor',
      description: 'The CodeMirror 6 wrapper for Angular.',
      link: 'https://github.com/acrodata/code-editor',
    },
    {
      name: 'Watermark',
      description: 'A watermark component that can prevent deletion.',
      link: 'https://github.com/acrodata/watermark',
    },
    {
      name: 'RnD Dialog',
      description: 'Resizable and draggable dialog based on CDK dialog.',
      link: 'https://github.com/acrodata/rnd-dialog',
    },
  ];

  introducingItem = this.introducingItems[this.getRandom(0, 3)];

  ngOnInit() {
    this.notifySubscription = this.settings.notify.subscribe(opts => {
      console.log(opts);

      this.updateCharts();
    });

    this.dataSource = this.dashboardSrv.getData();
    this.topProducts = this.dashboardSrv.getTopProducts();
    this.stockAlerts = this.dashboardSrv.getStockAlerts();
    this.expiryAlerts = this.dashboardSrv.getExpiryAlerts();
    this.messages = this.dashboardSrv.getMessages();
    this.stats = this.dashboardSrv.getStats();
    this.charts = this.dashboardSrv.getCharts();
  }

  ngAfterViewInit() {
    // Initialize all charts
    setTimeout(() => {
      this.charts.forEach((chartOptions, index) => {
        const chartId = `chart${index + 1}`;
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const chart = new ApexCharts(chartElement, chartOptions);
          chart.render();
          this.chartInstances.push(chart);
        }
      });
    }, 100);
  }

  ngOnDestroy() {
    this.notifySubscription.unsubscribe();
    // Clean up chart instances
    this.chartInstances.forEach(chart => chart.destroy());
  }

  initCharts() {
    this.charts.forEach((chartOptions, index) => {
      const chartId = `chart${index + 1}`;
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        const chart = new ApexCharts(chartElement, chartOptions);
        chart.render();
      }
    });

    this.updateCharts();
  }

  updateCharts() {
    const isDark = this.settings.getThemeColor() == 'dark';

    this.charts.forEach((chartOptions, index) => {
      const chartId = `chart${index + 1}`;
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        const chart = new ApexCharts(chartElement, chartOptions);
        chart.updateOptions({
          chart: {
            foreColor: isDark ? '#ccc' : '#333',
          },
          tooltip: {
            theme: isDark ? 'dark' : 'light',
          },
          grid: {
            borderColor: isDark ? '#5a5a5a' : '#e1e1e1',
          },
        });
      }
    });
  }

  onAlertDismiss() {
    this.isShowAlert = false;
  }

  getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
