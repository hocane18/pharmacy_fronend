import { JsonPipe } from '@angular/common';
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

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
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
  ],
})
export class ProductComponent implements OnInit, OnDestroy {
  @ViewChild('productDialog') productDialog: any;
  private readonly _destroy$ = new Subject<void>();
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  isEditMode = false;
  productForm: any = {
    name: '',
    categoryId: '',
    barcode: '',
    brand: '',
    costPrice: 0,
    salePrice: 0,
    quantity: 0,
    unit: '',
    expiryDate: null,
    alertQuantity: 0,
    imageUrl: '',
  };

  categories = [
    { id: '1', name: 'Medicines' },
    { id: '2', name: 'Supplements' },
    { id: '3', name: 'Medical Devices' },
  ];

  units = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'box', label: 'Box' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'pack', label: 'Pack' },
  ];

  products: any[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      categoryId: '1',
      barcode: '123456789',
      brand: 'ABC Pharma',
      costPrice: 5.00,
      salePrice: 7.50,
      quantity: 100,
      unit: 'pcs',
      expiryDate: new Date('2024-12-31'),
      alertQuantity: 20,
      imageUrl: 'assets/images/products/paracetamol.jpg',
      createdAt: new Date('2024-01-01'),
    },
    // Add more sample products as needed
  ];

  columns: MtxGridColumn[] = [
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
      header: 'Category',
      field: 'categoryId',
      sortable: true,
      width: '120px',
      formatter: (row: any) => {
        const category = this.categories.find(c => c.id === row.categoryId);
        return category ? category.name : row.categoryId;
      },
    },
    {
      header: 'Barcode',
      field: 'barcode',
      width: '120px',
    },
    {
      header: 'Brand',
      field: 'brand',
      width: '120px',
    },
    {
      header: 'Cost Price',
      field: 'costPrice',
      width: '100px',
      formatter: (row: any) => `$${row.costPrice.toFixed(2)}`,
    },
    {
      header: 'Sale Price',
      field: 'salePrice',
      width: '100px',
      formatter: (row: any) => `$${row.salePrice.toFixed(2)}`,
    },
    {
      header: 'Quantity',
      field: 'quantity',
      width: '100px',
    },
    {
      header: 'Unit',
      field: 'unit',
      width: '80px',
      formatter: (row: any) => {
        const unit = this.units.find(u => u.value === row.unit);
        return unit ? unit.label : row.unit;
      },
    },
    {
      header: 'Expiry Date',
      field: 'expiryDate',
      width: '120px',
      formatter: (row: any) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '',
    },
    {
      header: 'Alert Qty',
      field: 'alertQuantity',
      width: '100px',
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
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
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

  ngOnInit() {}

  openAddProductDialog(): void {
    this.isEditMode = false;
    this.productForm = {
      name: '',
      categoryId: '',
      barcode: '',
      brand: '',
      costPrice: 0,
      salePrice: 0,
      quantity: 0,
      unit: '',
      expiryDate: null,
      alertQuantity: 0,
      imageUrl: '',
    };

    const dialogRef = this.dialog.open(this.productDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, productForm: this.productForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveProduct(result);
      }
    });
  }

  edit(product: any): void {
    this.isEditMode = true;
    this.productForm = { ...product };

    const dialogRef = this.dialog.open(this.productDialog, {
      width: '600px',
      data: { isEditMode: this.isEditMode, productForm: this.productForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveProduct(result);
      }
    });
  }

  delete(product: any): void {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index > -1) {
      this.products.splice(index, 1);
    }
  }

  saveProduct(productData: any): void {
    if (this.isEditMode) {
      const index = this.products.findIndex(p => p.id === productData.id);
      if (index > -1) {
        this.products[index] = productData;
      }
    } else {
      const newProduct = {
        ...productData,
        id: (this.products.length + 1).toString(),
        createdAt: new Date(),
      };
      this.products.push(newProduct);
    }
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
