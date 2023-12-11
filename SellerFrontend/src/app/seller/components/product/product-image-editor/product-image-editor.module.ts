import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImageEditorRouterModule } from './product-image-editor-router.module';
import { TableModule } from 'primeng/table';
import { ProductImageEditorComponent } from './product-image-editor.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuModule } from 'primeng/menu';
import { ImageModule } from 'primeng/image';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { GalleriaModule } from 'primeng/galleria';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ListboxModule } from 'primeng/listbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
    declarations: [
        ProductImageEditorComponent
    ],
    imports: [
        CommonModule,
        ProductImageEditorRouterModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        FormsModule,
        RadioButtonModule,
        FileUploadModule,
        MenuModule,
        ImageModule,
        DropdownModule,
        DataViewModule,
        GalleriaModule,
        ListboxModule,
        CheckboxModule,
        InputNumberModule,
        ColorPickerModule
    ]
})
export class ProductImageEditorModule { }
