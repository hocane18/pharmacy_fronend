import { JsonPipe } from '@angular/common';
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
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { PurchaseItem } from './purchase-item.interface';
import { Supplier } from './supplier.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '@env/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss',
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
export class PurchaseComponent implements OnInit, OnDestroy {
  @ViewChild('purchaseDialog') purchaseDialog: any;
  @ViewChild('purchaseItemDialog') purchaseItemDialog: any;
  @ViewChild('viewPurchaseDialog') viewPurchaseDialog: any;
  @ViewChild('supplierDialog') supplierDialog: any;
  @ViewChild('quickAddSupplierDialog') quickAddSupplierDialog: any;
  private readonly _destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar);

  dialogData: any = {
    purchase: null,
  };

  isEditMode = false;
  isSupplierEditMode = false;
  itemtableload = false;
  supplierForm: Supplier = {
    name: '',
    phone: '',
    address: '',
    email: '',
  };

  purchaseForm: any = {
    supplierId: 0,
    userId: '',
    totalAmount: 0,
    invoiceNo: '',
    purchaseDate: new Date(),
    items: [] as PurchaseItem[],
  };

  purchaseItemForm: PurchaseItem = {
    productId: 0,
    productName: '',
    quantity: 0,
    price: 0,
    total: 0,
  };

  products: {
    id: number;
    name: string;
    categoryId: number;
    category: string;
    barcode: string;
    brand: string;
    costPrice: number;
    salePrice: number;
    quantity: number;
    unit: string;
    expiryDate: string;
    alertQuantity: number;
    createdAt: string;
    imageUrl: string;
  }[] = [];

  suppliers: Supplier[] = [];

  users = [];

  purchases: any[] = [
    {
      id: '1',
      supplierId: 1,
      userId: '1',
      totalAmount: 1500.0,
      invoiceNo: 'INV-001',
      purchaseDate: new Date('2024-03-15'),
      items: [
        {
          id: 1,
          purchaseId: 1,
          productId: 1,
          quantity: 10,
          price: 10.0,
          total: 100.0,
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
      header: 'Supplier',
      field: 'supplierId',
      sortable: true,
      width: '120px',
      formatter: (row: any) => this.getSupplierName(row.supplierId),
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
      formatter: (row: any) =>
        row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString() : '',
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

  supplierColumns: MtxGridColumn[] = [
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
      formatter: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''),
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
          click: record => this.editSupplier(record),
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
          click: record => this.deleteSupplier(record),
        },
      ],
    },
  ];
  supplierLoading = false;
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
  filteredPurchases: any[] = [];

  ngOnInit() {
    this.filteredPurchases = [...this.purchases];
    this.loadSupplier();
    this.loadPurchase();
    this.loadProducts();
    // Setup search with debounce
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(searchText => {
      this.filterPurchases(searchText);
    });
  }

  onSearchChange(searchText: string): void {
    this.searchSubject.next(searchText);
  }

  filterPurchases(searchText: string): void {
    if (!searchText) {
      this.filteredPurchases = [...this.purchases];
      return;
    }

    const searchLower = searchText.toLowerCase();
    this.filteredPurchases = this.purchases.filter(purchase => {
      return (
        purchase.id.toString().includes(searchLower) ||
        this.getSupplierName(purchase.supplierId).toLowerCase().includes(searchLower) ||
        this.getUserName(purchase.userId).toLowerCase().includes(searchLower) ||
        purchase.invoiceNo.toLowerCase().includes(searchLower) ||
        purchase.totalAmount.toString().includes(searchLower) ||
        new Date(purchase.purchaseDate).toLocaleDateString().includes(searchLower)
      );
    });
  }

  openAddPurchaseDialog(): void {
    this.isEditMode = false;
    this.purchaseForm = {
      supplierId: 0,
      userId: '',
      totalAmount: 0,
      invoiceNo: '',
      purchaseDate: new Date(),
      items: [],
    };

    const dialogRef = this.dialog.open(this.purchaseDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, purchaseForm: this.purchaseForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savePurchase(result);
      }
    });
  }

  edit(purchase: any): void {
    this.isEditMode = true;
    this.purchaseForm = { ...purchase };

    const dialogRef = this.dialog.open(this.purchaseDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, purchaseForm: this.purchaseForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.savePurchase(result);
      }
    });
  }

  delete(purchase: any): void {
    const index = this.purchases.findIndex(p => p.id === purchase.id);
    if (index > -1) {
      this.purchases.splice(index, 1);
    }
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

  savePurchase(purchaseData: any): void {
    if (this.isEditMode) {
      const index = this.purchases.findIndex(p => p.id === purchaseData.id);
      if (index > -1) {
        this.purchases[index] = purchaseData;
      }
    } else {
      const newPurchase = {
        ...purchaseData,
        id: (this.purchases.length + 1).toString(),
      };
      this.savePurchase(newPurchase);
      this.purchases.push(newPurchase);
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

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : supplierId.toString();
  }

  getUserName(userId: string): string {
    // const user = this.users.find(u => u.id === userId);
    // return user ? user.name : userId;
    return '';
  }

  calculateItemTotal(item: PurchaseItem): number {
    return item.quantity * item.price;
  }

  updatePurchaseTotal(): void {
    this.purchaseForm.totalAmount = this.purchaseForm.items.reduce(
      (sum: number, item: PurchaseItem) => sum + item.total,
      0
    );
  }

  openAddItemDialog(): void {
    this.purchaseItemForm = {
      productId: 0,
      productName: '',
      quantity: 0,
      price: 0,
      total: 0,
    };

    const dialogRef = this.dialog.open(this.purchaseItemDialog, {
      width: '500px',
      data: { item: this.purchaseItemForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.itemtableload = true;
        console.log('itemurchase' + result);
        console.log(result);

        result.total = this.calculateItemTotal(result);
        const product = this.products.find(p => p.id === result.productId);
        result.productName = product ? product.name : '';
        this.purchaseForm.items.push(result);
        console.log(this.purchaseForm.items);
        this.updatePurchaseTotal();
        this.itemtableload = false;
      }
    });
  }

  editItem(item: PurchaseItem): void {
    const dialogRef = this.dialog.open(this.purchaseItemDialog, {
      width: '500px',
      data: { item: { ...item } },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.purchaseForm.items.findIndex((i: PurchaseItem) => i.id === result.id);
        if (index > -1) {
          result.total = this.calculateItemTotal(result);
          this.purchaseForm.items[index] = result;
          this.updatePurchaseTotal();
        }
      }
    });
  }

  deleteItem(item: PurchaseItem): void {
    const index = this.purchaseForm.items.findIndex((i: PurchaseItem) => i.id === item.id);
    if (index > -1) {
      this.purchaseForm.items.splice(index, 1);
      this.updatePurchaseTotal();
    }
  }

  onProductChange(item: PurchaseItem): void {
    const product = this.products.find(p => p.id === item.productId);
    if (product) {
      item.price = product.salePrice;
      item.total = this.calculateItemTotal(item);
    }
  }

  onQuantityChange(item: PurchaseItem): void {
    item.total = this.calculateItemTotal(item);
  }

  view(purchase: any): void {
    this.dialogData.purchase = purchase;
    const dialogRef = this.dialog.open(this.viewPurchaseDialog, {
      width: '800px',
    });
  }

  openAddSupplierDialog(): void {
    this.isSupplierEditMode = false;
    this.supplierForm = {
      name: '',
      phone: '',
      address: '',
      email: '',
    };

    const dialogRef = this.dialog.open(this.supplierDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveSupplier(result);
      }
    });
  }

  editSupplier(supplier: Supplier): void {
    this.isSupplierEditMode = true;
    this.supplierForm = { ...supplier };

    const dialogRef = this.dialog.open(this.supplierDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveSupplier(result);
      }
    });
  }

  deleteSupplier(supplier: Supplier): void {
    const index = this.suppliers.findIndex(s => s.id === supplier.id);
    if (index > -1) {
      this.suppliers.splice(index, 1);
    }
  }

  saveSupplier(supplierData: Supplier): void {
    if (this.isSupplierEditMode) {
      const index = this.suppliers.findIndex(s => s.id === supplierData.id);
      if (index > -1) {
        this.suppliers[index] = supplierData;
      }
      this.editSuppliers(this.suppliers[index]);
      this.loadSupplier();
    } else {
      const newSupplier = {
        ...supplierData,
        id: this.suppliers.length + 1,
        createdAt: new Date(),
      };
      this.addSupplier(newSupplier);
      this.loadSupplier();
      this.suppliers.push(newSupplier);
    }
  }

  openQuickAddSupplierDialog(): void {
    this.supplierForm = {
      name: '',
      phone: '',
      address: '',
      email: '',
    };

    const dialogRef = this.dialog.open(this.quickAddSupplierDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveQuickSupplier();
      }
    });
  }

  saveQuickSupplier(): void {
    const newSupplier = {
      ...this.supplierForm,
      id: this.suppliers.length + 1,
      createdAt: new Date(),
    };
    this.suppliers.push(newSupplier);
    this.purchaseForm.supplierId = newSupplier.id;
    this.dialog.closeAll();
  }
  loadPurchase() {
    this.isLoading = true;
    const apiUrl = `${environment.apiUrl || ''}Purchase`;
    const token = localStorage.getItem('ng-matero-token');

    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.filteredPurchases = data || {};
        console.log(this.filteredPurchases);
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
      });
  }
  loadSupplier() {
    this.supplierLoading = true;
    const apiUrl = `${environment.apiUrl || ''}Supplier`;
    const token = localStorage.getItem('ng-matero-token');

    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.suppliers = data || [];
        console.log(this.suppliers);
        this.supplierLoading = false;
      })
      .catch(() => {
        this.supplierLoading = false;
      });
  }

  addSupplier(supplier: any) {
    this.supplierLoading = true;
    const apiUrl = `${environment.apiUrl || ''}Supplier`;
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
        this.suppliers.push(data);
        this.snackBar.open('Supplier added successfully!', 'Close', { duration: 2000 });

        this.supplierLoading = false;
      })
      .catch(() => {
        this.snackBar.open('Failed to add supplier. Please try again.', 'Close', {
          duration: 2000,
        });
        this.supplierLoading = false;
      });
  }
  editSuppliers(supplier: any) {
    this.supplierLoading = true;
    const apiUrl = `${environment.apiUrl || ''}Supplier/${supplier.id}`;
    const token = localStorage.getItem('ng-matero-token');

    // Prepare data to match SupplierDto structure
    const fordata = {
      Name: supplier.name,
      Phone: supplier.phone,
      Address: supplier.address,
      Email: supplier.email,
    };
    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
      body: fordata ? JSON.stringify(fordata) : null,
    })
      .then(res => res.json())
      .then(data => {
        this.suppliers.push(data);
        this.snackBar.open('Supplier updated successfully!', 'Close', { duration: 2000 });

        this.supplierLoading = false;
      })
      .catch(() => {
        this.snackBar.open('Failed to update supplier. Please try again.', 'Close', {
          duration: 2000,
        });
        this.supplierLoading = false;
      });
  }
  addPurchase(purchase: any) {
    this.isLoading = true;
    const apiUrl = `${environment.apiUrl || ''}Purchase`;
    const token = localStorage.getItem('ng-matero-token');

    // Prepare data to match PurchaseDto structure
    const fordata = {
      SupplierId: purchase.supplierId,
      UserId: purchase.userId,
      TotalAmount: purchase.totalAmount,
      InvoiceNo: purchase.invoiceNo,
      PurchaseDate: purchase.purchaseDate,
      Items: purchase.items.map((item: PurchaseItem) => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        Price: item.price,
        Total: item.total,
      })),
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
        this.purchases.push(data);
        this.snackBar.open('Purchase added successfully!', 'Close', { duration: 2000 });

        this.isLoading = false;
      })
      .catch(() => {
        this.snackBar.open('Failed to add purchase. Please try again.', 'Close', {
          duration: 2000,
        });
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
