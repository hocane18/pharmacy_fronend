import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { PageHeaderComponent } from '@shared';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { Sale, SaleItem, Customer } from './sale.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatCardModule,
    PageHeaderComponent,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MtxGridModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
  ],
})
export class SaleComponent implements OnInit, OnDestroy {
  @ViewChild('saleDialog') saleDialog: any;
  @ViewChild('saleItemDialog') saleItemDialog: any;
  @ViewChild('viewSaleDialog') viewSaleDialog: any;
  @ViewChild('customerDialog') customerDialog: any;
  @ViewChild('quickAddCustomerDialog') quickAddCustomerDialog: any;
  private readonly _destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  dialogData: any = {
    sale: null
  };

  isEditMode = false;
  isCustomerEditMode = false;
  customerForm: Customer = {
    id: 0,
    name: '',
    phone: '',
    address: '',
    email: '',
  };

  saleForm: Sale = {
    customerId: 0,
    userId: 0,
    totalAmount: 0,
    invoiceNo: '',
    purchaseDate: new Date(),
    items: [],
  };

  saleItemForm: SaleItem = {
    productId: 0,
    quantity: 0,
    price: 0,
    total: 0,
  };

  products = [
    { id: 1, name: 'Product A', price: 10.00 },
    { id: 2, name: 'Product B', price: 15.00 },
    { id: 3, name: 'Product C', price: 20.00 },
  ];

  customers: Customer[] = [
    {
      id: 1,
      name: 'Customer A',
      phone: '123-456-7890',
      address: '123 Main St',
      email: 'customerA@example.com',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Customer B',
      phone: '234-567-8901',
      address: '456 Oak St',
      email: 'customerB@example.com',
      createdAt: new Date('2024-01-02')
    },
    {
      id: 3,
      name: 'Customer C',
      phone: '345-678-9012',
      address: '789 Pine St',
      email: 'customerC@example.com',
      createdAt: new Date('2024-01-03')
    }
  ];

  users = [
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ];

  sales: Sale[] = [
    {
      id: 1,
      customerId: 1,
      userId: 1,
      totalAmount: 1500.00,
      invoiceNo: 'INV-001',
      purchaseDate: new Date('2024-03-15'),
      items: [
        {
          id: 1,
          saleId: 1,
          productId: 1,
          quantity: 10,
          price: 10.00,
          total: 100.00,
        },
      ],
    },
  ];

  itemColumns: MtxGridColumn[] = [
    {
      header: 'Product',
      field: 'productId',
      width: '150px',
      formatter: (row: any) => this.getProductName(row.productId),
    },
    {
      header: 'Quantity',
      field: 'quantity',
      width: '100px',
    },
    {
      header: 'Price',
      field: 'price',
      width: '100px',
      formatter: (row: any) => `$${row.price.toFixed(2)}`,
    },
    {
      header: 'Total',
      field: 'total',
      width: '100px',
      formatter: (row: any) => `$${row.total.toFixed(2)}`,
    },
    {
      header: 'Operation',
      field: 'operation',
      width: '100px',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: 'Edit',
          click: record => this.editItem(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: 'Delete',
          click: record => this.deleteItem(record),
        },
      ],
    },
  ];

  columns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      sortable: true,
      width: '80px',
    },
    {
      header: 'Customer',
      field: 'customerId',
      sortable: true,
      width: '120px',
      formatter: (row: any) => this.getCustomerName(row.customerId),
    },
    {
      header: 'User',
      field: 'userId',
      sortable: true,
      width: '120px',
      formatter: (row: any) => this.getUserName(row.userId),
    },
    {
      header: 'Total Amount',
      field: 'totalAmount',
      width: '120px',
      formatter: (row: any) => `$${row.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Invoice No',
      field: 'invoiceNo',
      width: '120px',
    },
    {
      header: 'Purchase Date',
      field: 'purchaseDate',
      width: '120px',
      formatter: (row: any) => row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : '',
    },
    {
      header: 'Operation',
      field: 'operation',
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'visibility',
          tooltip: 'View',
          click: record => this.view(record),
        },
        {
          type: 'icon',
          icon: 'edit',
          tooltip: 'Edit',
          click: record => this.edit(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: 'Delete',
          pop: {
            title: 'Confirm Delete',
            closeText: 'Cancel',
            okText: 'Delete',
          },
          click: record => this.delete(record),
        },
      ],
    },
  ];

  customerColumns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      width: '80px',
    },
    {
      header: 'Name',
      field: 'name',
      width: '150px',
    },
    {
      header: 'Phone',
      field: 'phone',
      width: '120px',
    },
    {
      header: 'Email',
      field: 'email',
      width: '200px',
    },
    {
      header: 'Address',
      field: 'address',
      width: '200px',
    },
    {
      header: 'Created At',
      field: 'createdAt',
      width: '120px',
      formatter: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '',
    },
    {
      header: 'Operation',
      field: 'operation',
      width: '120px',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: 'Edit',
          click: record => this.editCustomer(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: 'Delete',
          pop: {
            title: 'Confirm Delete',
            closeText: 'Cancel',
            okText: 'Delete',
          },
          click: record => this.deleteCustomer(record),
        },
      ],
    },
  ];

  isLoading = false;
  multiSelectable = false;
  rowSelectable = false;
  hideRowSelectionCheckbox = false;
  showToolbar = true;
  columnHideable = true;
  columnSortable = true;
  columnPinnable = true;
  rowHover = true;
  rowStriped = true;
  showPaginator = true;
  expandable = false;
  columnResizable = true;

  searchText = '';
  private searchSubject = new Subject<string>();
  filteredSales: Sale[] = [];

  ngOnInit() {
    this.filteredSales = [...this.sales];
    
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchText => {
        this.filterSales(searchText);
      });

    // Initialize with some sample data if empty
    if (this.sales.length === 0) {
      this.sales = [
        {
          id: 1,
          customerId: 1,
          userId: 1,
          totalAmount: 1500.00,
          invoiceNo: 'INV-001',
          purchaseDate: new Date('2024-03-15'),
          items: [
            {
              id: 1,
              saleId: 1,
              productId: 1,
              quantity: 10,
              price: 10.00,
              total: 100.00,
            },
          ],
        },
      ];
      this.filteredSales = [...this.sales];
    }
  }

  onSearchChange(searchText: string): void {
    this.searchSubject.next(searchText);
  }

  filterSales(searchText: string): void {
    if (!searchText) {
      this.filteredSales = [...this.sales];
      return;
    }

    const searchLower = searchText.toLowerCase();
    this.filteredSales = this.sales.filter(sale => {
      return (
        sale.id?.toString().includes(searchLower) ||
        this.getCustomerName(sale.customerId).toLowerCase().includes(searchLower) ||
        this.getUserName(sale.userId).toLowerCase().includes(searchLower) ||
        sale.invoiceNo.toLowerCase().includes(searchLower) ||
        sale.totalAmount.toString().includes(searchLower) ||
        new Date(sale.purchaseDate).toLocaleDateString().includes(searchLower)
      );
    });
  }

  openAddSaleDialog(): void {
    this.isEditMode = false;
    this.saleForm = {
      customerId: 0,
      userId: 0,
      totalAmount: 0,
      invoiceNo: '',
      purchaseDate: new Date(),
      items: [],
    };

    const dialogRef = this.dialog.open(this.saleDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, saleForm: this.saleForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveSale(result);
      }
    });
  }

  edit(sale: Sale): void {
    this.isEditMode = true;
    this.saleForm = { 
      ...sale,
      items: sale.items || []
    };

    const dialogRef = this.dialog.open(this.saleDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, saleForm: this.saleForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveSale(result);
      }
    });
  }

  delete(sale: Sale): void {
    const index = this.sales.findIndex(s => s.id === sale.id);
    if (index > -1) {
      this.sales.splice(index, 1);
    }
  }

  saveSale(saleData: Sale): void {
    if (this.isEditMode) {
      const index = this.sales.findIndex(s => s.id === saleData.id);
      if (index > -1) {
        this.sales[index] = saleData;
      }
    } else {
      const newSale = {
        ...saleData,
        id: this.sales.length + 1,
      };
      this.sales.push(newSale);
    }
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : productId.toString();
  }

  getCustomerName(customerId: number): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : customerId.toString();
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : userId.toString();
  }

  calculateItemTotal(item: SaleItem): number {
    return item.quantity * item.price;
  }

  updateSaleTotal(): void {
    this.saleForm.totalAmount = this.saleForm.items?.reduce(
      (sum: number, item: SaleItem) => sum + item.total,
      0
    ) || 0;
  }

  openAddItemDialog(): void {
    this.saleItemForm = {
      productId: 0,
      quantity: 0,
      price: 0,
      total: 0,
    };

    const dialogRef = this.dialog.open(this.saleItemDialog, {
      width: '500px',
      data: { item: this.saleItemForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.total = this.calculateItemTotal(result);
        this.saleForm.items?.push(result);
        this.updateSaleTotal();
      }
    });
  }

  editItem(item: SaleItem): void {
    const dialogRef = this.dialog.open(this.saleItemDialog, {
      width: '500px',
      data: { item: { ...item } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.saleForm.items?.findIndex((i: SaleItem) => i.id === result.id);
        if (index !== undefined && index > -1) {
          result.total = this.calculateItemTotal(result);
          this.saleForm.items![index] = result;
          this.updateSaleTotal();
        }
      }
    });
  }

  deleteItem(item: SaleItem): void {
    const index = this.saleForm.items?.findIndex((i: SaleItem) => i.id === item.id);
    if (index !== undefined && index > -1) {
      this.saleForm.items?.splice(index, 1);
      this.updateSaleTotal();
    }
  }

  onProductChange(item: SaleItem): void {
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      item.price = product.price;
      item.total = this.calculateItemTotal(item);
    }
  }

  onQuantityChange(item: SaleItem): void {
    item.total = this.calculateItemTotal(item);
  }

  view(sale: Sale): void {
    this.dialogData.sale = sale;
    const dialogRef = this.dialog.open(this.viewSaleDialog, {
      width: '800px',
    });
  }

  openAddCustomerDialog(): void {
    this.isCustomerEditMode = false;
    this.customerForm = {
      id: 0,
      name: '',
      phone: '',
      address: '',
      email: '',
    };

    const dialogRef = this.dialog.open(this.customerDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCustomer(result);
      }
    });
  }

  editCustomer(customer: Customer): void {
    this.isCustomerEditMode = true;
    this.customerForm = { ...customer };

    const dialogRef = this.dialog.open(this.customerDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCustomer(result);
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    const index = this.customers.findIndex(c => c.id === customer.id);
    if (index > -1) {
      this.customers.splice(index, 1);
    }
  }

  saveCustomer(customerData: Customer): void {
    if (this.isCustomerEditMode) {
      const index = this.customers.findIndex(c => c.id === customerData.id);
      if (index > -1) {
        this.customers[index] = customerData;
      }
    } else {
      const newCustomer = {
        ...customerData,
        id: this.customers.length + 1,
        createdAt: new Date(),
      };
      this.customers.push(newCustomer);
    }
  }

  openQuickAddCustomerDialog(): void {
    this.customerForm = {
      id: 0,
      name: '',
      phone: '',
      address: '',
      email: '',
    };

    const dialogRef = this.dialog.open(this.quickAddCustomerDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveQuickCustomer();
      }
    });
  }

  saveQuickCustomer(): void {
    const newCustomer = {
      ...this.customerForm,
      id: this.customers.length + 1,
      createdAt: new Date(),
    };
    this.customers.push(newCustomer);
    this.saleForm.customerId = newCustomer.id;
    this.dialog.closeAll();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
} 