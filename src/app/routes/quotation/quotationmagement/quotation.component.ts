import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { environment } from '@env/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Quotation {
  id: string;
  customerId: string;
  userId: string;
  quotationNo: string;
  quotationDate: Date;
  items: QuotationItem[];
  totalAmount: number;
}

interface QuotationItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.scss',
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
    MatSlideToggleModule,
    MtxGridModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
  ],
})
export class QuotationComponent implements OnInit, OnDestroy {
  @ViewChild('quotationDialog') quotationDialog: any;
  @ViewChild('customerDialog') customerDialog: any;

  private readonly _destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
 private readonly snackBar = inject(MatSnackBar);
  // Search
  searchText = '';
  filteredQuotations: Quotation[] = [];

  // Loading states
  isLoading = false;
  customerLoading = false;

  // Edit modes
  isEditMode = false;
  isCustomerEditMode = false;

  // Forms
  quotationForm: Quotation = {
    id: '',
    customerId: '',
    userId: '',
    quotationNo: '',
    quotationDate: new Date(),
    items: [],
    totalAmount: 0
  };

  customerForm: Customer = {
    id: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  // Data
  quotations: Quotation[] = [];
  customers: Customer[] = [];
  products: any[] = [];
  users: any[] = [];

  // Columns
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
      width: '150px',
      formatter: (row: Quotation) => this.getCustomerName(row.customerId),
    },
    {
      header: 'User',
      field: 'userId',
      sortable: true,
      width: '120px',
      formatter: (row: Quotation) => this.getUserName(row.userId),
    },
    {
      header: 'Quotation No',
      field: 'quotationNo',
      width: '120px',
    },
    {
      header: 'Quotation Date',
      field: 'quotationDate',
      width: '120px',
      formatter: (row: Quotation) => row.quotationDate ? new Date(row.quotationDate).toLocaleDateString() : '',
    },
    {
      header: 'Total Amount',
      field: 'totalAmount',
      width: '120px',
      formatter: (row: Quotation) => `$${row.totalAmount.toFixed(2)}`,
    }
  ];

  customerColumns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      sortable: true,
      width: '80px',
    },
    {
      header: 'Name',
      field: 'name',
      sortable: true,
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
      width: '150px',
    },
    {
      header: 'Address',
      field: 'address',
      width: '200px',
    }
  ];

  itemColumns: MtxGridColumn[] = [
    {
      header: 'Product',
      field: 'productId',
      width: '150px',
      formatter: (row: QuotationItem) => {
        const product = this.products.find(p => p.id === row.productId);
        return product ? product.name : row.productId;
      },
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
      formatter: (row: QuotationItem) => `$${row.price.toFixed(2)}`,
    },
    {
      header: 'Total',
      field: 'total',
      width: '100px',
      formatter: (row: QuotationItem) => `$${row.total.toFixed(2)}`,
    }
  ];

  constructor() {
    // Initialize with sample data
    this.users = [
      { id: '1', name: 'Admin User' },
      { id: '2', name: 'Sales User' }
    ];

    this.products = [
      { id: '1', name: 'Product 1', salePrice: 10.99 },
      { id: '2', name: 'Product 2', salePrice: 20.99 }
    ];

    this.quotations = [
      {
        id: '1',
        customerId: '1',
        userId: '1',
        quotationNo: 'Q001',
        quotationDate: new Date(),
        items: [
          { productId: '1', quantity: 2, price: 10.99, total: 21.98 }
        ],
        totalAmount: 21.98
      }
    ];

    this.filteredQuotations = [...this.quotations];
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // Search functionality
  onSearchChange(event: string) {
    if (!event) {
      this.filteredQuotations = [...this.quotations];
      return;
    }

    const searchLower = event.toLowerCase();
    this.filteredQuotations = this.quotations.filter(quotation => {
      return (
        quotation.id.toLowerCase().includes(searchLower) ||
        this.getCustomerName(quotation.customerId).toLowerCase().includes(searchLower) ||
        this.getUserName(quotation.userId).toLowerCase().includes(searchLower) ||
        quotation.quotationNo.toLowerCase().includes(searchLower) ||
        quotation.totalAmount.toString().includes(searchLower) ||
        new Date(quotation.quotationDate).toLocaleDateString().includes(searchLower)
      );
    });
  }

  // Dialog handlers
  openAddQuotationDialog() {
    this.isEditMode = false;
    this.quotationForm = {
      id: '',
      customerId: '',
      userId: '1', // Default to first user
      quotationNo: this.generateQuotationNo(),
      quotationDate: new Date(),
      items: [],
      totalAmount: 0
    };

    const dialogRef = this.dialog.open(this.quotationDialog, {
      width: '800px',
      data: { isEditMode: this.isEditMode, quotationForm: this.quotationForm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveQuotation(result);
      }
    });
  }

  openAddCustomerDialog() {
    this.isCustomerEditMode = false;
    this.customerForm = {
      id: '',
      name: '',
      phone: '',
      email: '',
      address: ''
    };

    const dialogRef = this.dialog.open(this.customerDialog, {
      width: '500px',
      data: { isCustomerEditMode: this.isCustomerEditMode, customerForm: this.customerForm }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveCustomer(result);
      }
    });
  }

  // Helper functions
  getCustomerName(customerId: string): string {
    const customer = this.customers.find(c => c.id === customerId);
    return customer ? customer.name : customerId;
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : userId;
  }

    calculateItemTotal(item: QuotationItem): number {
      return item.quantity * item.price;
    }
  
  generateQuotationNo(): string {
    const prefix = 'Q';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${year}${month}${random}`;
  }

  // Save handlers
  saveQuotation(quotation: Quotation) {
    if (this.isEditMode) {
      const index = this.quotations.findIndex(q => q.id === quotation.id);
      if (index > -1) {
        this.quotations[index] = quotation;
      }
    } else {
      quotation.id = (this.quotations.length + 1).toString();
      this.quotations.push(quotation);
    }
    this.filteredQuotations = [...this.quotations];
  }

  // // Customer management
  // loadCustomers() {
  //   this.customerLoading = true;
  //   // Simulate API call
  //   setTimeout(() => {
  //     this.customers = [
  //       { id: '1', name: 'John Doe', phone: '123-456-7890', email: 'john@example.com', address: '123 Main St' },
  //       { id: '2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane@example.com', address: '456 Oak Ave' }
  //     ];
  //     this.customerLoading = false;
  //   }, 1000);
  // }
    openAddItemDialog(): void {
    this.quotationForm = {
      id: '',
      customerId: '',
      userId: '1', // Default to first user
      quotationNo: this.generateQuotationNo(),
      quotationDate: new Date(),
      items: [],
      totalAmount: 0
    };
  
    const dialogRef = this.dialog.open(this.quotationDialog, {
      width: '500px',
      data: { item: this.quotationForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.total = this.calculateItemTotal(result);
        this.quotationForm.items?.push(result);
        this.quotationForm.items = [...this.quotationForm.items];
       // this.updateSaleTotal();
      }
    });
  }
 loadProducts() {
    this.isLoading = true;
    const apiUrl = `${environment.apiUrl || ''}ProductAndCategory/products`;
    const token = localStorage.getItem('ng-matero-token');
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        this.products = data;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      });
  }
     loadCustomers() {
      this.customerLoading = true;
      const apiUrl = `${environment.apiUrl || ''}customer/All`;
      const token = localStorage.getItem('ng-matero-token');
  
      fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          this.customers = data || [];
          console.log(this.customers);
          this.customerLoading = false;
        })
        .catch(() => {
          this.customerLoading = false;
        });
    }

  saveCustomer(customer: Customer) {
    if (this.isCustomerEditMode) {
      const index = this.customers.findIndex(c => c.id === customer.id);
      if (index > -1) {
        this.customers[index] = customer;
      }
    } else {
      customer.id = (this.customers.length + 1).toString();
      this.addCustomer(customer);
      this.loadCustomers();
      this.customers.push(customer);
    }
  }
   addCustomer(supplier: any) {
      this.customerLoading = true;
      const apiUrl = `${environment.apiUrl || ''}Customer/add`;
      const token = localStorage.getItem('ng-matero-token');
  
      // Prepare data to match SupplierDto structure
      const fordata = {
        Name: supplier.name,
        Phone: supplier.phone,
        Address: supplier.address,
        Email: supplier.email,
      };
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
          'Content-Type': 'application/json',
        },
        body: fordata ? JSON.stringify(fordata) : null,
      })
        .then(res => res.json())
        .then(data => {
          this.customers.push(data);
          this.snackBar.open('Supplier added successfully!', 'Close', { duration: 2000 });
  
          this.customerLoading = false;
        })
        .catch(() => {
          this.snackBar.open('Failed to add supplier. Please try again.', 'Close', {
            duration: 2000,
          });
          this.customerLoading = false;
        });
    }
}
