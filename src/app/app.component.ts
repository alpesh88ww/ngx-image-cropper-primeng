import { Component, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ImageCroppedEvent, Dimensions, ImageTransform } from 'ngx-image-cropper';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ButtonModule, InputGroupModule,
    InputGroupAddonModule, FileUploadModule, TooltipModule, ToastModule,
    ProgressSpinnerModule, MessagesModule, DialogModule, ImageCropperComponent, SliderModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'imageCropper';

  @ViewChild('fileUpload') fileUpload: any;

  loading: boolean = false;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    canvasRotation = 0;
    rotation?: number;
    translateH = 0;
    translateV = 0;
    scale = 1;
    aspectRatio = 1 / 1;
    showCropper = false;
    containWithinAspectRatio = false;
    transform: ImageTransform = {
        translateUnit: 'px'
    };
    imageURL?: string;
    allowMoveImage = false;  // Initially set to false
    hidden = false;
    displayCropper = false;
    format: string = 'jpeg'; //"png"
    showSaveButton: boolean = false;
    showCancelButton: boolean = false;

    sourceImageWidth: number | undefined;
    sourceImageHeight: number | undefined;
    cropperMaxWidth = 500;
    cropperMaxHeight = 500;
    sliderValue = 0;
    minScale = 1;
    maxSliderValue = 3;

    constructor(private sanitizer: DomSanitizer, private renderer: Renderer2, private el: ElementRef) { }

    fileChangeEvent(event: any): void {
        this.loading = true;
        const file = event.files[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imageURL = e.target.result; // Create a data URL
            this.imageChangedEvent = {
                target: {
                    files: [file]
                }
            };
            this.displayCropper = true;
        };
        reader.readAsDataURL(file);
    }

    imageCropped(event: ImageCroppedEvent) {
        console.log('Cropped Image Event:', event);

        if (event.base64) {
            this.croppedImage = event.base64;
        } else if (event.blob) {
            this.blobToBase64(event.blob).then(base64 => {
                this.croppedImage = base64;
                console.log('Cropped Image as Base64:', this.croppedImage);
            });
        } else {
            console.error('No base64 or blob data available');
        }
    }

    blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    imageLoaded() {
        this.showCropper = true;
        console.log('Image loaded:', this.imageChangedEvent);
    }

    loadImageFailed() {
        console.error('Load image failed');
    }

    rotateLeft() {
        this.loading = true;
        setTimeout(() => {
            this.canvasRotation--;
            this.flipAfterRotate();
        });
    }

    rotateRight() {
        this.loading = true;
        setTimeout(() => {
            this.canvasRotation++;
            this.flipAfterRotate();
        });
  }
  
  moveLeft() {
        this.transform = {
            ...this.transform,
            translateH: ++this.translateH
        };
    }
    moveRight() {
        this.transform = {
            ...this.transform,
            translateH: --this.translateH
        };
    }
    moveTop() {
        this.transform = {
            ...this.transform,
            translateV: ++this.translateV
        };
    }
    moveBottom() {
        this.transform = {
            ...this.transform,
            translateV: --this.translateV
        };
    }

    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
            ...this.transform,
            flipH: flippedV,
            flipV: flippedH
        };
        this.translateH = 0;
        this.translateV = 0;
    }

    flipHorizontal() {
        this.transform = {
            ...this.transform,
            flipH: !this.transform.flipH
        };
    }

    flipVertical() {
        this.transform = {
            ...this.transform,
            flipV: !this.transform.flipV
        };
    }

    resetImage() {
        this.scale = 1;
        this.rotation = 0;
        this.canvasRotation = 0;
        this.transform = {
            translateUnit: 'px'
        };
        this.allowMoveImage = false;  // Reset to false when image is reset
        this.sliderValue = 0;
    }

    cropperReady(sourceImageDimensions: Dimensions) {
        console.log('Cropper ready', sourceImageDimensions);
        this.loading = false;
        this.sourceImageWidth = sourceImageDimensions.width;
        this.sourceImageHeight = sourceImageDimensions.height;
        this.calculateMinScale();
        this.initializeSlider();
    }

    initializeSlider() {
        if (this.sourceImageWidth && this.sourceImageHeight) {
            const minScale = Math.max(
                this.cropperMaxWidth / this.sourceImageWidth,
                this.cropperMaxHeight / this.sourceImageHeight
            );
            this.scale = minScale;
            this.zoomChanged();
        }
    }

    calculateMinScale() {
        if (this.sourceImageWidth && this.sourceImageHeight) {
            this.minScale = Math.max(
                this.cropperMaxWidth / this.sourceImageWidth,
                this.cropperMaxHeight / this.sourceImageHeight
            );
        }
    }

    zoomChanged() {
        const zoomFactor = 0.5; // Define how much each step in the slider changes the zoom
        this.sliderValue = Math.min(Math.max(this.sliderValue, 0), this.maxSliderValue); // Ensure slider value is within bounds
        this.scale = 1 + this.sliderValue * zoomFactor; // Map slider value to zoom scale
        this.transform = {
            ...this.transform,
            scale: this.scale
        };
        this.allowMoveImage = this.sliderValue > 0; // Enable moving image when zoomed in

        if (this.sliderValue === 0) {
            //this.resetImage(); // Reset image when slider value reaches 0
        }
    }

    onMouseWheel(event: WheelEvent) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.2 : 0.2;
        this.sliderValue += delta;
        this.sliderValue = Math.min(Math.max(this.sliderValue, 0), this.maxSliderValue); // Ensure the slider value doesn't go out of bounds
        this.zoomChanged();
    }

    toggleContainWithinAspectRatio() {
        this.containWithinAspectRatio = !this.containWithinAspectRatio;

        this.cropperInactive();
    }
    cropperInactive() {
        const divElement = this.el.nativeElement.querySelector('.ngx-ic-cropper');
        if (this.containWithinAspectRatio) {
            this.renderer.removeClass(divElement, 'ngx-ic-cropper-active');
        } else {
            this.renderer.addClass(divElement, 'ngx-ic-cropper-active');
        }
    }

    updateRotation() {
        this.transform = {
            ...this.transform,
            rotate: this.rotation
        };
    }

    toggleAspectRatio() {
        this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
    }

    cropImage() {
        this.displayCropper = false; // Close the dialog
        this.fileUpload.clear();
        // Do not reset the upload or cropped image here
        this.showSaveButton = true;
        this.showCancelButton = true;
    }

    closeAndReset() {
        this.displayCropper = false;
        this.showSaveButton = false;
        this.showCancelButton = false;
        //this.display = false;
        this.resetUpload();
    }

    resetUpload() {
        this.fileUpload.clear(); // Clear the file upload
        this.croppedImage = ''; // Clear the cropped image
        this.imageChangedEvent = ''; // Clear the image change event
        this.showCropper = false; // Hide the cropper
        this.imageURL = ''; // Clear the image URL
        this.resetImage(); // Reset image transformations
    }

    showDialog() {
        this.displayCropper = true;
    }

    editImage() {
        this.showCropper = true; // Reset cropper visibility
        this.croppedImage = '';
        this.showDialog();
    }
}
