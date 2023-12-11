import { Component } from '@angular/core';
import { ColorPickerChangeEvent } from 'primeng/colorpicker';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { FileSelectEvent } from 'primeng/fileupload';

enum TokenType {
    Image,
    Text,
    Number,
    Color,
    Visible,
}

interface IToken {
    name: string;
    type: TokenType;
    minValue: number;
    maxValue: number;
    defaultValue: any;
}
interface ITemplate {
    svg: Document;
    templateContent: string,
    tokens: IToken[],
    fileName: string;
    png: string;
}

class TokenizedImage {
    name: string;
    values: any;

    private _svg: Document;
    private _png: string;
    private _template: ITemplate;

    private replaceImageTokens(): void {
        if (this._template) {
            this._svg.querySelectorAll('*')
                .forEach(item => {
                    for (var i = 0; i < item.attributes.length; i++) {
                        const attribute = item.attributes.item(i);
                        if (attribute.prefix == 'redicy') {
                            const match = /(.+):(text|image|number|color|visible|_content)/gi.exec(attribute.value);

                            if (match) {
                                const name = match[1];

                                const value = this.values[name];

                                if (attribute.localName == '_content') {
                                    item.innerHTML = value;
                                } else {
                                    item.setAttribute(attribute.localName, value)
                                }
                            }
                        }
                    }
                });
        }
    }

    private svgToPng(): void {
        const scaleFactor = 300 / 96;
        const imageBlob = new Blob([this._svg.documentElement.outerHTML], { type: 'image/svg+xml;charset=utf-8' })
        const blobUrl = URL.createObjectURL(imageBlob);
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.style.width = image.width + 'px';
            canvas.style.height = image.height + 'px';
            canvas.width = Math.ceil(image.width * scaleFactor);
            canvas.height = Math.ceil(image.height * scaleFactor);

            const context = canvas.getContext('2d');
            context.scale(scaleFactor, scaleFactor);
            context.drawImage(image, 0, 0);

            this._png = canvas.toDataURL('image/png');
        }

        image.src = blobUrl;
    }

    get png(): string {
        return this._png;
    }

    update(): void {
        this.replaceImageTokens();

        this.svgToPng()
    }

    set template(template: ITemplate) {
        if (template != this._template) {
            this._template = template;
            this._svg = <Document>template.svg.cloneNode(true);

            for (const token of template.tokens) {
                this.values[token.name] = token.defaultValue;
            }
        }
    }

    get visibilityFields() {
        return this.getFields(TokenType.Visible);
    }

    get imageFields() {
        return this.getFields(TokenType.Image);
    }

    get textFields() {
        return this.getFields(TokenType.Text);
    }

    get colorFields() {
        return this.getFields(TokenType.Color);
    }

    get numberFields() {
        return this.getFields(TokenType.Number);
    }

    private getFields(type: TokenType): IToken[] {
        return this._template?.tokens.filter(item => item.type == type);
    }

    public toJSON() {
        const values = Object.keys(this.values)
            .filter(key => {
                const token = this._template.tokens.find(token => token.name == key);

                return this.values[key] != token.defaultValue;
            })
            .reduce((acc, key) => {
                acc[key] = this.values[key];
                return acc;
            }, {})

        return {
            name: this.name,
            values: values,
            template: {
                templateContent: this._template.templateContent,
                filename: this._template.fileName
            }
        };
    }
}

@Component({
    selector: 'app-product-image-editor',
    templateUrl: './product-image-editor.component.html',
    styleUrls: ['./product-image-editor.component.scss']
})
export class ProductImageEditorComponent {
    images: TokenizedImage[] = [];
    templateFiles: ITemplate[] = [];
    activeImageIndex: number;
    tokenTypes = TokenType;
    dataset: string;

    addImage() {
        let image = new TokenizedImage();
        image.values = {};
        image.name = 'Card_' + this.images.length;
        image.template = this.templateFiles[0];
        this.images = [...this.images, image];
        this.onImageUpdate(image);

        this.activeImageIndex = this.images.length - 1;
    }

    checkFieldUnchanged(image: TokenizedImage, field: IToken) {
        return image.values[field.name] == field.defaultValue;
    }

    get activeImage(): TokenizedImage {
        return this.activeImageIndex == null ? null : this.images[this.activeImageIndex];
    }

    onImageUpdate(image: TokenizedImage): void {
        image.update();

        this.updateDatasetJson();
    }

    updateDatasetJson() {
        const base64Data = btoa(encodeURIComponent(JSON.stringify(this.images)).replace(/%([0-9A-F]{2})/g,
            (_, value) => {
                return String.fromCharCode(parseInt(value, 16));
            }));

        const href = 'data:application/json;base64,' + base64Data;
        this.dataset = href;
    }

    onDatasetSelected(event: FileSelectEvent) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = <string>e.target.result;
            const images = JSON.parse(content);

            this.activeImageIndex = -1;

            for (var i = 0; i < images.length; i++) {
                const templateObject = images[i].template;
                const template = <ITemplate>templateObject;
                this.parseTemplate(templateObject.templateContent, template);
                images[i].template = template;
                const values = images[i].values;
                const image = new TokenizedImage();
                image.name = images[i].name;
                image.values = [];
                image.template = template;
                for (const key of Object.keys(images[i].values)) {
                    image.values[key] = images[i].values[key];
                }

                image.update();

                images[i] = image;
            }

            this.images = images;
            this.activeImageIndex = 0;

            console.log(this.images);
        }

        reader.readAsText(event.currentFiles[0]);
    }

    onTemplatesSelected(event: FileSelectEvent) {
        this.images = [];

        const templates: ITemplate[] = [];
        for (const templateFile of event.currentFiles) {
            let template: ITemplate = {
                templateContent: '',
                tokens: [],
                fileName: templateFile.name,
                png: '',
                svg: null
            };
            this.loadTemplate(templateFile, template)

            templates.push(template);
        }

        this.templateFiles = templates;

        this.images = [];
    }

    onImageSelected(image: TokenizedImage, columnName: string, event: FileSelectEvent) {
        if (event.currentFiles.length > 0) {
            const file = event.currentFiles[0];
            const reader = new FileReader();
            reader.onload = () => {
                image.values[columnName] = reader.result;

                this.onImageUpdate(image);
            }

            reader.readAsDataURL(file);
        }
    }

    undoField(token: IToken) {
        this.activeImage.values[token.name] = token.defaultValue;
        this.onImageUpdate(this.activeImage);
    }

    onColorFieldUpdated(image: TokenizedImage, fieldName: string, e: ColorPickerChangeEvent): void {
        this.onImageUpdate(image);
    }

    parseTemplate(templateContent: string, target: ITemplate) {
        target.templateContent = templateContent;
        target.svg = new DOMParser().parseFromString(templateContent, 'text/xml');
        const imageBlob = new Blob([templateContent], { type: 'image/svg+xml;charset=utf-8' })
        target.png = URL.createObjectURL(imageBlob);

        let tokens = new Map<string, IToken>();
        target.svg.querySelectorAll('*')
            .forEach(item => {
                for (var i = 0; i < item.attributes.length; i++) {
                    const attribute = item.attributes.item(i);
                    const targetAttribute = item.attributes.getNamedItemNS('', attribute.localName);
                    const match = /(.+):(text|image|number|color|visible|_content)(:min=(?<min>\d+))?(:max=(?<max>\d+))?/gi.exec(attribute.value);
                    if (attribute.prefix == 'redicy' && match) {
                        const name = match[1];
                        const typeText = match[2];
                        let type: TokenType;

                        let defaultValue: any = targetAttribute?.value;

                        switch (typeText) {
                            case 'image':
                                type = TokenType.Image;
                                break;
                            case 'number':
                                type = TokenType.Number;
                                break;
                            case 'color':
                                type = TokenType.Color;
                                break;
                            case 'visible':
                                type = TokenType.Visible;
                                defaultValue = defaultValue ?? 'normal';
                                break;
                            default:
                                type = TokenType.Text;
                                break
                        }

                        let token: IToken;

                        const minValue = match.groups['min'] === undefined ? undefined : parseInt(match.groups['min']);
                        const maxValue = match.groups['max'] === undefined ? undefined : parseInt(match.groups['max']);
                        if (attribute.localName == '_content') {
                            token = {
                                name: name,
                                type: type,
                                minValue: minValue,
                                maxValue: maxValue,
                                defaultValue: item.innerHTML
                            };
                        } else {
                            token = {
                                name: name,
                                type: type,
                                minValue: minValue,
                                maxValue: maxValue,
                                defaultValue: defaultValue
                            };
                        }

                        if (token) {
                            tokens.set(name, token);
                        }
                    }
                }
            });
        target.tokens = [...tokens.values()];
    }

    loadTemplate(file: File, template: ITemplate) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.parseTemplate(<string>e.target.result, template);
        }

        reader.readAsText(file);
    }

    getTokenTypeImage(tokenType: TokenType): string {
        let result = 'pi-pi-align-justify';

        switch (tokenType) {
            case TokenType.Image:
                result = 'pi-image';
                break;
            case TokenType.Number:
                result = 'pi-sort-numeric-up';
                break;
        }

        return `pi ${result}`;
    }

    imageTemplateChanged(image: TokenizedImage, e: DropdownChangeEvent): void {
        this.onImageUpdate(image);
    }
}
