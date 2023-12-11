import { Component } from '@angular/core';
import { FileSelectEvent } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-product-image-animator',
    templateUrl: './product-image-animator.component.html',
    styleUrls: ['./product-image-animator.component.scss']
})
export class ProductImageAnimatorComponent {
    images: any[];
    width: number = 300;
    height: number = 300;
    frameRate: number = 30;
    animationDuration: number = 1;
    exposureDuration: number = 3;
    recording: boolean = false;
    recordButtonEnabled: boolean = false;
    showVideo: boolean = false;

    constructor(private messageService: MessageService,
        private imageService: contracts.ImageToolClient
    ) {
    }

    get duration(): number {
        return this.images?.length > 0
            ? this.images?.length * (this.exposureDuration + this.animationDuration) + this.exposureDuration
            : 0;
    }

    getAnimation() {
        let values = [];
        let keyTimes = [0];
        const totalTime = this.duration;
        const exposureDuration = (this.exposureDuration / totalTime);
        const animationDuration = (this.animationDuration / totalTime);
        let keyTimeOffset = 0;

        this.images.forEach((item, index) => {

            const x = index * this.width;
            const value = `${x} 0 ${this.width} ${this.height}`;
            values.push(value);
            values.push(value);
            keyTimeOffset += exposureDuration;
            keyTimes.push(Math.round(keyTimeOffset * 1000) / 1000);
            keyTimeOffset += animationDuration;
            keyTimes.push(Math.round(keyTimeOffset * 1000) / 1000);
        });
        values.push(`${this.images.length * this.width} 0 ${this.width} ${this.height}`);
        values.push(`${this.images.length * this.width} 0 ${this.width} ${this.height}`);
        keyTimes.push(1);

        return {
            values: values.join(';'),
            keyTimes: keyTimes
        };
    }

    readImageContent(file: File, callback: (content: string | ArrayBuffer) => void) {
        const reader = new FileReader();
        reader.onload = (e) => {
            callback(e.target.result);
        };

        reader.readAsDataURL(file);
    }

    onImagesSelected(event: FileSelectEvent) {
        const images = [];
        let sizeDetected = false;

        const templates: [] = [];
        for (const file of event.currentFiles) {
            let imageItem = {
                fileName: file.name,
                image: <string | ArrayBuffer>''
            };

            this.readImageContent(file, (content) => {
                imageItem.image = content;

                if (!sizeDetected) {
                    sizeDetected = true;
                    const image = new Image();
                    image.onload = () => {
                        this.width = image.width;
                        this.height = image.height;
                    };
                    image.src = <string>content;
                }
            });

            images.push(imageItem);
        }

        this.recordButtonEnabled = !!images.length;

        this.images = images;
    }

    private delay(timeout: number): Promise<unknown> {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    async generateVideo() {
        const chunks = [];
        this.recordButtonEnabled = false;
        this.recording = true;
        const videoContainer = document.getElementById('video');
        videoContainer.innerHTML = '';

        const element = <SVGSVGElement><unknown>document.getElementById('preview');

        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const context = canvas.getContext('2d', {
            willReadFrequently: true
        });

        let maxOffset = this.duration;
        const step = 1 / this.frameRate;
        const stepMs = step * 1000;
        let clone = <SVGSVGElement>element.cloneNode(true);
        element.pauseAnimations();
        clone.pauseAnimations();
        this.removeAnimation(clone);
        let started = Date.now();

        let changedFrames = 0;
        let totalFrames = 0;
        let lastImage: Blob;

        const imageCanvas = <HTMLCanvasElement>document.createElement('canvas');
        imageCanvas.width = this.width;
        imageCanvas.height = this.height;
        const imageContext = imageCanvas.getContext('2d');
        let image = new Image();

        let images: contracts.FileParameter[] = [];
        const batchID = await firstValueFrom(this.imageService.createVideoBatch());
        const batchSize = 10;
        const maxUploadSize = 1024 * 1024 * 10;
        const sendBatch = (batchID: string, files: contracts.FileParameter[]): Promise<void> =>
            firstValueFrom(this.imageService.uploadBatchImage(batchID, files));
        const uploads: Promise<void>[] = [];

        let uploadSize = 0;
        for (let timeOffset = 0, i = 1; timeOffset < maxOffset + step; timeOffset += step, i++) {
            if (i % this.frameRate == 0) {
                timeOffset = i / this.frameRate;
            }
            const correctedTimeOffset = Math.floor(timeOffset * 1000) / 1000;
            element.setCurrentTime(correctedTimeOffset);

            const changed = this.traverse(element, clone);
            totalFrames++;
            if (changed || timeOffset == 0) {
                changedFrames++;
                const url = 'data:image/svg+xml;base64,' + btoa(clone.outerHTML);
                const promise = new Promise<Blob>(resolve => {
                    image.onload = () => {
                        imageContext.drawImage(image, 0, 0);
                        imageCanvas.toBlob((blob) => {
                            resolve(blob);
                        });
                    };
                    image.src = url;
                });

                lastImage = await promise;
            }

            images.push({
                data: lastImage,
                fileName: `${i}.png`
            })

            uploadSize += lastImage.size;

            if (uploadSize > maxUploadSize) {
                uploads.push(sendBatch(batchID, images));

                images = [];
                uploadSize = 0;
            }
        }

        if (images.length) {
            uploads.push(sendBatch(batchID, images));
        }

        await Promise.all(uploads);

        const videoElement = <HTMLVideoElement>document.createElement('video');
        videoElement.width = 300;
        videoElement.height = 300;
        videoElement.controls = true;
        videoContainer.appendChild(videoElement);
        videoElement.loop = true;
        videoElement.autoplay = true;
        const href = 'http://localhost:8100/v1/ImageTool/FinishBatch?batchID=' + batchID + '&frameRate=' + this.frameRate;
        videoElement.src = href;

        this.messageService.add({
            summary: 'Операция завершена',
            severity: 'info',
            detail: `Прегенерация фремов завершена: ${changedFrames}/${totalFrames} за ${((Date.now() - started) / 1000).toFixed(1)}с`
        });

        this.recordButtonEnabled = true;
        this.recording = false;
        element.unpauseAnimations();
        element.setCurrentTime(0);
    }

    removeAnimation(element: Element) {
        element.querySelectorAll('animate').forEach(child => child.parentNode.removeChild(child));
    }

    traverse(source: SVGElement, clone: SVGElement): boolean {
        let changed = false;
        const getRect = (rect: DOMRect, precision: number): string => {
            return `${rect.x.toFixed(precision)} ${rect.y.toFixed(precision)} ${rect.width.toFixed(precision)} ${rect.height.toFixed(precision)}`;
        };
        for (var node in clone) {
            if (clone[node]?.['animVal']) {
                switch (clone[node][Symbol.toStringTag]) {
                    case 'SVGAnimatedRect':
                        {
                            const oldValue = getRect((<SVGAnimatedRect>clone[node]).baseVal, 0);
                            const value = getRect((<SVGAnimatedRect>source[node]).animVal, 0);
                            if (oldValue != value) {
                                changed = true;
                                clone.setAttribute(node, value);
                            }
                        }
                        break;
                    case 'SVGAnimatedString':
                        {

                            const oldValue = (<SVGAnimatedString>clone[node]).baseVal;
                            const value = (<SVGAnimatedString>source[node]).animVal;

                            if (oldValue != value) {
                                changed = true;
                                clone.setAttribute(node, value);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        for (var i = 0, j = 0; i < clone.children.length; i++, j++) {
            while (i < source.children.length && source.children[i].nodeName == 'animate') {
                i++;
            };
            changed ||= this.traverse(<SVGElement>source.children[i], <SVGElement>clone.children[j]);
        }

        return changed;
    }
}
