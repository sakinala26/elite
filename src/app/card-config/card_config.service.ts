import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BusinessCardService {

  constructor() {}

  uploadImage(base64Image: string): Promise<string> {
    // This is a mock implementation. In a real-world scenario, you would send the image to your server.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const uploadedImageUrl = "https://example.com/path/to/your/uploaded/image.png"
        resolve(uploadedImageUrl)
      }, 1000)
    })
  }
  private elements: HTMLElement[] = [];
  private minZIndex = 1; // Minimum z-index to ensure elements remain visible

  registerElement(element: HTMLElement) {
    this.elements.push(element);
    // Set initial z-index if not already set
    if (!element.style.zIndex) {
      element.style.zIndex = (this.minZIndex + this.elements.length).toString();
    }
  }

  bringToFront(element: HTMLElement) {
    const highestZIndex = this.getHighestZIndex();
    element.style.zIndex = (highestZIndex + 1).toString();
  }

  sendToBack(element: HTMLElement) {
    element.style.zIndex = this.minZIndex.toString();
  }

  private getHighestZIndex() {
    let highest = this.minZIndex;
    this.elements.forEach((el) => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || this.minZIndex;
      if (zIndex > highest) {
        highest = zIndex;
      }
    });
    return highest;
  }
}