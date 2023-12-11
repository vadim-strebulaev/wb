import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WbComponent } from './wb.component';
import { WbProductImportComponent } from './wildberries-product-import/wb-product-import.component';



@NgModule({
  declarations: [
    WbComponent
  ],
  imports: [
    CommonModule,
    WbProductImportComponent
  ]
})
export class WbModule { }
