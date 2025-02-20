import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import interact from "interactjs";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { BusinessCardService } from './card_config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-card-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-config.component.html',
  styleUrl: './card-config.component.scss'
})
export class CardConfigComponent implements OnInit, AfterViewInit {
  @ViewChild("card1", { static: true }) businessCard!: ElementRef
  @ViewChild("contextMenu", { static: true }) contextMenu!: ElementRef
  @ViewChild("resizeMenu", { static: true }) resizeMenu!: ElementRef

  @ViewChild('rightSidebar') rightSidebar!: ElementRef;
  @ViewChild('cardSection', { static: true }) cardSection!: ElementRef;
  new_template_element: boolean = true;
  card_template_data: any[] = [
    {
      id: "1", templatename: "Template One", img: "assets/img/img2.jpg", rating: 0, important: false
    },
    {
      id: "2", templatename: "Template Two", img: "assets/img/img.webp", rating: 0, important: false
    }
  ];
  imagestore: string = "";
  qrCodeUrl: string | null = null;
  currentElement: HTMLElement | null = null
  historyStack: string[] = []
  isImportant = false;
  rating = 0;
  selectedCardId: number | null = null;
  backgroundImage: string = "";
  selectedElement: HTMLElement | null = null; // Track the selected element
  selectedElement_Img: HTMLElement | null = null;
  rotationAngle: number = 0; // Track the rotation angle
  isPopoverVisible = false; isPopoverVisible_url  = false;
  isPopoverVisible_Img = false;
  popoverStyles = {}; popoverStyles_Img = {};
  fonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
  imageStyles = { transform: 'scaleX(1)' };
  ismodalpopup = false;
  @ViewChild('profileImg') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrCodeModal', { static: true }) qrCodeModal!: ElementRef<HTMLElement>;


  highlightElement(element: HTMLElement | null) {
    element?.classList.add('highlight');
  }

  removeHighlight(element: HTMLElement | null) {
    element?.classList.remove('highlight');
  }




  selectElement(event: MouseEvent, element: HTMLElement): void {
    debugger;
    // Example usage: Add these lines to the methods where you handle element clicks
    this.highlightElement(this.selectedElement); // Add highlight to the selected element
    setTimeout(() => this.removeHighlight(this.selectedElement), 2000); // Remove highlight after 2 seconds (or as desired)
    // Deselect the previously selected element
    if (this.selectedElement) {
      this.selectedElement.classList.remove('highlight-border');
      this.isPopoverVisible = false;
    }
    if (element.className.includes("social_valid")) {
      this.isPopoverVisible_url = true;
    } else {
      this.isPopoverVisible_url = false;
    }
    this.currentElement = event.target as HTMLElement
    // Update the selected element
    this.selectedElement = element;
    this.selectedElement.classList.add('highlight-border');

    // Calculate the popover's position relative to the selected element
    const elementRect = this.selectedElement.getBoundingClientRect();

    this.isPopoverVisible = true;

    // Stop propagation to prevent triggering the document click event
    event.stopPropagation();
  }




  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const popover = document.getElementById('popover');
    const popoverImg = document.getElementById('img_popover');
    const popover_url = document.getElementById('popover_url');
    if (this.selectedElement 
      && !this.selectedElement.contains(event.target as Node) 
      && (!popover || !popover.contains(event.target as Node)) 
      && (!popover_url || !popover_url.contains(event.target as Node))) {
    
    this.selectedElement.classList.remove('highlight-border');
    this.isPopoverVisible = false;
  }
    if (this.selectedElement_Img && !this.selectedElement_Img.contains(event.target as Node) && (!popoverImg || !popoverImg.contains(event.target as Node))) {

      this.isPopoverVisible_Img = false;
    }
  }



  changeFontFamily(event: any) {
    const selectedFont = event.target.value;
    const selectedElement = document.querySelector('.selected') as HTMLElement; // Ensure this matches your element selector
    if (selectedElement) {
      selectedElement.style.fontFamily = selectedFont;
    } else {
      console.warn('No element selected.');
    }
  }




  setBackground(imageUrl: string): void {
    this.backgroundImage = `url("${imageUrl}")`;
  }


  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image file (JPEG, PNG, GIF, JPG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.setBackground(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }


  onCardClick(cardId: number): void {
    this.selectedCardId = cardId;
    console.log(`Card ${cardId} clicked. Show right sidebar.`);
  }

  setRating(cardId: number, rating: number): void {
    const card = this.card_template_data.find(c => c.id === cardId);
    if (card) {
      card.rating = rating;
    }
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
  toggleImportant(): void {
    this.isImportant = !this.isImportant;
  }
  openModal() {
    this.initializeQRCodeButton();
    setTimeout(() => {
      const modalElement = this.qrCodeModal.nativeElement;
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }, 3000);

  }

  constructor(
    private renderer: Renderer2,
    private businessCardService: BusinessCardService,
    private cdRef: ChangeDetectorRef
  ) { }
  ngAfterViewInit() {
    this.addCardEventListeners();
  }
  ngOnInit() {

    this.initializeInteractJS();
    this.initializeContextMenu();
    this.initializeResizeMenu();
    this.initializeThemeSelector();
    this.initializeCustomTheme();
    this.initializeAddTextButton();
    this.initializeAddCircleImageButton();
    this.initializeAddSquareImageButton();
    this.initializeAddTriangularImageButton();
    this.initializeSocialButtons();
    this.initializeDownloadButton();
    // this.initializeQRCodeButton();
    this.initializeResetButton();
    this.initializeAddLineButtons();
    this.initializeProfileImageUpload();
    this.makeALLElementsEditable();
    // Register elements with the layer service
    setTimeout(() => {
      document.querySelectorAll('.draggable').forEach((el) => {
        this.businessCardService.registerElement(el as HTMLElement);
      });
    }, 1000);
  }



  addCardEventListeners(): void {
    const cards = this.cardSection.nativeElement.querySelectorAll('.card');
    cards.forEach((card: any) => {
      this.renderer.listen(card, 'click', () => {
        const cardId = card.getAttribute('id').split('-')[1];
        this.onCardClick(parseInt(cardId));
        this.new_template_element = false;
        if (this.rightSidebar) {
          this.renderer.setStyle(this.rightSidebar.nativeElement, 'display', 'block');
        }
      });
    });
  }

  // Add event listener to rotation icon
  addRotationIconListener(): void {
    const rotationIcon = this.selectedElement?.querySelector('.rotation-icon') as HTMLElement;
    if (rotationIcon) {
      rotationIcon.addEventListener('click', () => {
        const angle = parseInt(prompt('Enter rotation angle in degrees:', '0') || '0', 10);
        this.rotateElement(angle);
      });
    }
  }

  // Rotate the selected element
  rotateElement(angle: number): void {
    if (this.selectedElement) {
      this.rotationAngle = angle;
      const x = parseFloat(this.selectedElement.getAttribute('data-x') || '0');
      const y = parseFloat(this.selectedElement.getAttribute('data-y') || '0');
      this.renderer.setStyle(this.selectedElement, 'transform', `translate(${x}px, ${y}px) rotate(${angle}deg)`);
    }
  }


  initializeInteractJS() {
    interact("#popover").draggable({
      inertia: true,
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement
          const x = (Number.parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx
          const y = (Number.parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy
          this.renderer.setStyle(target, "transform", `translate(${x}px, ${y}px)`)
          this.renderer.setAttribute(target, "data-x", x.toString())
          this.renderer.setAttribute(target, "data-y", y.toString())
        }
      },
    });

    interact("#img_popover").draggable({
      inertia: true,
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement
          const x = (Number.parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx
          const y = (Number.parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy
          this.renderer.setStyle(target, "transform", `translate(${x}px, ${y}px)`)
          this.renderer.setAttribute(target, "data-x", x.toString())
          this.renderer.setAttribute(target, "data-y", y.toString())
        }
      },
    })



    interact(".draggable").draggable({
      inertia: true,
      modifiers: [
        interact.modifiers.restrict({
          restriction: '#card1', // Restrict to card1
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        })
      ],
      autoScroll: true,
      listeners: {
        start: (event) => {
          const target = event.target as HTMLElement;
          if (!target.className.includes("profile-img")) {
            if (this.selectedElement) {
              this.renderer.removeClass(this.selectedElement, 'highlight-border');
            }
            this.selectedElement = target;
            this.renderer.addClass(this.selectedElement, 'highlight-border');
          }
        },
        move: (event) => {
          const target = event.target as HTMLElement
          const x = (Number.parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx
          const y = (Number.parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy
          this.renderer.setStyle(target, "transform", `translate(${x}px, ${y}px)`)
          this.renderer.setAttribute(target, "data-x", x.toString())
          this.renderer.setAttribute(target, "data-y", y.toString())
        },

        end: () => {
          if (this.selectedElement) {
            this.renderer.removeClass(this.selectedElement, 'highlight-border');
          }
        }
      },
    })
    // .resizable({
    //   edges: { left: true, right: true, bottom: true, top: true },
    //   listeners: {
    //     move: (event: any) => {
    //       const target = event.target as HTMLElement;
    //       let x = (parseFloat(target.getAttribute('data-x') || '0')) || 0;
    //       let y = (parseFloat(target.getAttribute('data-y') || '0')) || 0;

    //       target.style.width = `${event.rect.width}px`;
    //       target.style.height = `${event.rect.height}px`;

    //       x += event.deltaRect.left;
    //       y += event.deltaRect.top;

    //       target.style.transform = `translate(${x}px, ${y}px)`;
    //       target.setAttribute('data-x', x.toString());
    //       target.setAttribute('data-y', y.toString());
    //     }
    //   },
    //   inertia: true,
    //   modifiers: [
    //     interact.modifiers.restrictEdges({
    //       outer: 'parent'
    //     }),
    //     interact.modifiers.restrictSize({
    //       min: { width: 50, height: 20 }
    //     })
    //   ]
    // });







    // Add click listener for selection
    interact('.draggable').on('tap', (event) => {
      const target = event.currentTarget as HTMLElement;
      if (!target.className.includes("profile-img")) {
        this.selectElement(event, target);
      } else {
        const elementRect = target.getBoundingClientRect();
        this.selectedElement_Img = target;
        this.popoverStyles_Img = {
          top: `${elementRect.top + window.scrollY - parseFloat(getComputedStyle(document.documentElement).fontSize) * 1}px`,
          left: `${elementRect.left + window.scrollX}px`
        };
        this.isPopoverVisible_Img = true;
        this.cdRef.detectChanges(); // Trigger change detection
      }
      event.stopPropagation();
    });




    interact("#card1").resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement
          let { x, y } = target.dataset
          x = (Number.parseFloat(x || "0") || 0) + event.deltaRect.left
          y = (Number.parseFloat(y || "0") || 0) + event.deltaRect.top
          Object.assign(target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`,
          })
          Object.assign(target.dataset, { x, y })
        },
      },
    })
  }

  initializeContextMenu() {
    this.renderer.listen("document", "contextmenu", (event: MouseEvent) => {
      if ((event.target as HTMLElement).classList.contains("editable")) {
        event.preventDefault()
        this.currentElement = event.target as HTMLElement
        this.renderer.setStyle(this.contextMenu.nativeElement, "top", `${event.clientY}px`)
        this.renderer.setStyle(this.contextMenu.nativeElement, "left", `${event.clientX}px`)
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "block")
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
      }
    })

    this.renderer.listen("document", "click", (event: MouseEvent) => {
      if (
        !this.contextMenu.nativeElement.contains(event.target) &&
        !this.resizeMenu.nativeElement.contains(event.target)
      ) {
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
      }
    })
  }

  initializeResizeMenu() {
    this.renderer.listen(this.businessCard.nativeElement, "contextmenu", (event: MouseEvent) => {
      if (!(event.target as HTMLElement).classList.contains("editable")) {
        event.preventDefault()
        this.renderer.setStyle(this.resizeMenu.nativeElement, "top", `${event.clientY}px`)
        this.renderer.setStyle(this.resizeMenu.nativeElement, "left", `${event.clientX}px`)
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "block")
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      }
    })
  }

  applyFont() {
    if (this.currentElement) {
      debugger;
      const fontFamily = (document.getElementById("fontFamily") as HTMLSelectElement).value
      const fontSize = (document.getElementById("fontSize") as HTMLInputElement).value
      const textColor = (document.getElementById("textColor") as HTMLInputElement).value

      this.renderer.setStyle(this.currentElement, "fontFamily", fontFamily);
      this.renderer.setStyle(this.currentElement, "fontSize", `${fontSize}px`);
      this.renderer.setStyle(this.currentElement, "color", textColor);
      this.renderer.setStyle(this.currentElement, "background-color", textColor);
      this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      this.trackChanges()
    }
  }

  toggleBold() {
    if (this.currentElement) {
      const isBold = this.currentElement.style.fontWeight === "bold"
      this.renderer.setStyle(this.currentElement, "fontWeight", isBold ? "normal" : "bold")
      this.trackChanges()
    }
  }

  toggleItalic() {
    if (this.currentElement) {
      const isItalic = this.currentElement.style.fontStyle === "italic"
      this.renderer.setStyle(this.currentElement, "fontStyle", isItalic ? "normal" : "italic")
      this.trackChanges()
    }
  }

  toggleUnderline() {
    if (this.currentElement) {
      const isUnderlined = this.currentElement.style.textDecoration === "underline"
      this.renderer.setStyle(this.currentElement, "textDecoration", isUnderlined ? "none" : "underline")
      this.trackChanges()
    }
  }

  removeElement() {
    if (this.currentElement) {
      this.renderer.removeChild(this.currentElement.parentNode, this.currentElement)
      this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      this.trackChanges()
    }
  }

  resizeCard() {
    const cardWidth = (document.getElementById("cardWidth") as HTMLInputElement).value
    const cardHeight = (document.getElementById("cardHeight") as HTMLInputElement).value

    if (cardWidth) {
      this.renderer.setStyle(this.businessCard.nativeElement, "width", `${cardWidth}px`)
    }
    if (cardHeight) {
      this.renderer.setStyle(this.businessCard.nativeElement, "height", `${cardHeight}px`)
    }
    this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
    this.trackChanges()
  }

  initializeThemeSelector() {
    this.renderer.listen(document.getElementById("themeSelector"), "change", (event: Event) => {
      const selectedTheme = (event.target as HTMLSelectElement).value
      const themeClasses = [
        "theme-default",
        "theme-dark",
        "theme-corporate",
        "theme-modern",
        "theme-gradient-1",
        "theme-gradient-2",
        "theme-gradient-3",
        "theme-rich-blue",
        "theme-rich-purple",
        "theme-rich-green",
        "theme-multishade-orange",
        "theme-multishade-pink",
        "theme-multishade-aqua",
      ]

      themeClasses.forEach((themeClass) => {
        this.renderer.removeClass(this.businessCard.nativeElement, themeClass)
      })

      if (selectedTheme) {
        this.renderer.addClass(this.businessCard.nativeElement, selectedTheme)
      }
      this.trackChanges()
    })
  }

  initializeCustomTheme() {
    this.renderer.listen(document.getElementById("applyCustomTheme"), "click", () => {
      const bgColor = (document.getElementById("customBgColor") as HTMLInputElement).value
      const textColor = (document.getElementById("customTextColor") as HTMLInputElement).value

      this.renderer.setStyle(this.businessCard.nativeElement, "backgroundColor", bgColor)
      this.renderer.setStyle(this.businessCard.nativeElement, "color", textColor)
      this.trackChanges()
    })
  }

  initializeAddTextButton() {
    this.renderer.listen(document.getElementById("addTextButton"), "click", (event) => {
      event.preventDefault();
      const inputText = (document.getElementById("inputText") as HTMLInputElement).value
      if (inputText) {
        const newTextElement = this.renderer.createElement("p")
        this.renderer.addClass(newTextElement, "draggable")
        this.renderer.addClass(newTextElement, "editable")
        this.renderer.setProperty(newTextElement, "innerHTML", ` ${inputText}`)
        this.renderer.appendChild(document.getElementById("contactInfo"), newTextElement)
        this.makeEditable(newTextElement)
        this.initializeInteractJS()
        this.trackChanges()
      }
    })
  }

  initializeAddSquareImageButton() {
    this.renderer.listen(document.getElementById("addSquareImageButton"), "click", (event) => {
      event.preventDefault();
      const newImageElement = this.renderer.createElement("img")
      this.renderer.addClass(newImageElement, "draggable");
      this.renderer.addClass(newImageElement, "profile-img");
      this.renderer.addClass(newImageElement, "profile-img-square");
      this.renderer.addClass(newImageElement, "editable");
      this.renderer.setStyle(newImageElement, 'width', '100px'); // Size of the square
      this.renderer.setStyle(newImageElement, 'height', '100px'); // Size of the square
      this.renderer.setAttribute(newImageElement, 'src', 'https://picsum.photos/200/300');
      this.renderer.appendChild(document.getElementById('contactInfo'), newImageElement);
      this.trackChanges();
    })
  }
  initializeAddTriangularImageButton() {
    this.renderer.listen(document.getElementById("addTraingularImageButton"), "click", (event) => {
      event.preventDefault();
      const newImageElement = this.renderer.createElement("img")
      this.renderer.addClass(newImageElement, "draggable");
      this.renderer.addClass(newImageElement, "profile-img");
      this.renderer.addClass(newImageElement, "profile-img-traingular")
      this.renderer.addClass(newImageElement, "editable");
      this.renderer.setStyle(newImageElement, 'width', '100px'); // Size of the square
      this.renderer.setStyle(newImageElement, 'height', '100px'); // Size of the square
      this.renderer.setAttribute(newImageElement, 'src', 'https://picsum.photos/200/300');
      this.renderer.appendChild(document.getElementById('contactInfo'), newImageElement);
      this.trackChanges();
    });
  }

  

  initializeAddCircleImageButton() {
    this.renderer.listen(document.getElementById("addCircleImageButton"), "click", (event) => {
      event.preventDefault();
      const newImageElement = this.renderer.createElement("img")
      this.renderer.addClass(newImageElement, "draggable");
      this.renderer.addClass(newImageElement, "profile-img");
      this.renderer.addClass(newImageElement, "profile-img-circle")
      this.renderer.addClass(newImageElement, "editable");
      this.renderer.setAttribute(newImageElement, 'src', 'https://picsum.photos/200/300');
      this.renderer.appendChild(document.getElementById('contactInfo'), newImageElement);
      this.trackChanges();
    })
  }

  initializeSocialButtons() {
    const socialButtons = [
      { id: "addFacebook", icon: "fab fa-facebook", name: "Facebook" },
      { id: "addTwitter", icon: "fab fa-twitter", name: "Twitter" },
      { id: "addLinkedIn", icon: "fab fa-linkedin", name: "LinkedIn" },
      { id: "addInstagram", icon: "fab fa-instagram", name: "Instagram" },
    ]

    socialButtons.forEach((button) => {
      this.renderer.listen(document.getElementById(button.id), "click", (event) => {
        // event.preventDefault();
        this.addSocialIcon(button.icon, button.name)
      })
    })
  }
  updateSocialUrl(val: string) {
    if (this.selectedElement)
    this.selectedElement.setAttribute("href",val);
  }

  addSocialIcon(iconClass: string, iconName: string) {
    const newIconElement = this.renderer.createElement("a")
    this.renderer.addClass(newIconElement, "draggable")
    this.renderer.addClass(newIconElement, "editable")
    this.renderer.setStyle(newIconElement,"target","_blank")
    this.renderer.addClass(newIconElement, "social_valid")
    this.renderer.setProperty(newIconElement, "innerHTML", `<i class="${iconClass}"></i> ${iconName}`)
    this.renderer.appendChild(document.getElementById("contactInfo"), newIconElement)
    this.makeEditable(newIconElement)
    this.initializeInteractJS()
    this.trackChanges()
  }

  makeEditable(element: HTMLElement) {
    this.renderer.listen(element, "dblclick", () => {
      const existingInput = element.querySelector('input');

      // Check if input already exists to prevent re-creating it
      if (existingInput) {
        return;
      }
      const originalHTML = element.innerHTML
      const textContent = element.textContent?.trim() || ""
      const iconClass = element.querySelector("i")?.className || null

      const input = this.renderer.createElement("input")
      this.renderer.setAttribute(input, "type", "text")
      this.renderer.setProperty(input, "value", textContent)
      this.renderer.setProperty(element, "innerHTML", "")
      this.renderer.appendChild(element, input)
      input.focus()

      this.renderer.listen(input, "blur", () => {
        if (iconClass) {
          this.renderer.setProperty(element, "innerHTML", `<i class="${iconClass}"></i> ${input.value}`)
        } else {
          this.renderer.setProperty(element, "innerHTML", input.value)
        }
        this.trackChanges()
      })
    })
  }

  makeALLElementsEditable() {
    const editableElements = this.businessCard.nativeElement.querySelectorAll(".editable");
    editableElements.forEach((element: HTMLElement) => {
      this.makeEditable(element);
    })
  }

  initializeDownloadButton() {
    this.renderer.listen(document.getElementById("downloadBtn"), "click", () => {
      html2canvas(this.businessCard.nativeElement).then((canvas) => {
        const link = this.renderer.createElement("a");
        let image_uploaded = "https://picsum.photos/200/300";
        this.imagestore = canvas.toDataURL("image/png");
        this.renderer.setAttribute(link, "href", canvas.toDataURL("image/png"))
        this.renderer.setAttribute(link, "download", "business_card.png")
        link.click()
      })
    })
  }

  saveImage(dataUrl: string, filename: string): void {
    const blob = this.dataURLtoBlob(dataUrl);
    saveAs(blob, filename);
  }

  dataURLtoBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: mimeString });
  }

  initializeQRCodeButton() {
    html2canvas(this.businessCard.nativeElement).then((canvas) => {
      const imagestore = canvas.toDataURL("image/png");
      this.saveImage(imagestore, "business_card.png");

      // Generate QR code from the saved image URL
      const imageUrl = 'assets/business_card.png'; // Replace with the actual path where you save the image
      QRCode.toDataURL(imageUrl, (err, url) => {
        if (err) {
          console.error(err);
        } else {
          this.qrCodeUrl = url;
        }
      })
    })

  }

  initializeResetButton() {
    const initialContent = this.businessCard.nativeElement.innerHTML
    const initialStyle = {
      width: this.businessCard.nativeElement.style.width,
      height: this.businessCard.nativeElement.style.height,
    }

    this.renderer.listen(document.getElementById("resetBtn"), "click", () => {
      this.renderer.setProperty(this.businessCard.nativeElement, "innerHTML", initialContent)
      this.renderer.setStyle(this.businessCard.nativeElement, "width", initialStyle.width)
      this.renderer.setStyle(this.businessCard.nativeElement, "height", initialStyle.height)
      this.historyStack = []
      console.log("Reset to initial state.")
    });
    this.initializeProfileImageUpload();
  }

  initializeAddLineButtons() {
    this.renderer.listen(document.getElementById("addHorizontalLine"), "click", () => {
      const newLine = this.renderer.createElement("div")
      this.renderer.addClass(newLine, "line-horizontal")
      this.renderer.addClass(newLine, "draggable")
      this.renderer.addClass(newLine, "editable")
      this.renderer.appendChild(this.businessCard.nativeElement, newLine)
      this.initializeInteractJS()
      this.trackChanges()
    })

    this.renderer.listen(document.getElementById("addVerticalLine"), "click", () => {
      const newLine = this.renderer.createElement("div")
      this.renderer.addClass(newLine, "line-vertical")
      this.renderer.addClass(newLine, "draggable")
      this.renderer.addClass(newLine, "editable")
      this.renderer.appendChild(this.businessCard.nativeElement, newLine)
      this.initializeInteractJS()
      this.trackChanges()
    })
  }

  initializeProfileImageUpload() {
    const profileImg = document.getElementById("profileImg")
    if (profileImg) {
      this.renderer.listen(profileImg, "dblclick", () => {
        const input = this.renderer.createElement("input")
        this.renderer.setAttribute(input, "type", "file")
        this.renderer.setAttribute(input, "accept", "image/*")
        this.renderer.listen(input, "change", (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
              this.renderer.setAttribute(profileImg, "src", e.target?.result as string);

            }
            reader.readAsDataURL(file)
          }
        })
        input.click()
      })
    }
  }

  trackChanges() {
    const currentContent = this.businessCard.nativeElement.innerHTML
    this.historyStack.push(currentContent)
    if (this.historyStack.length > 20) this.historyStack.shift()
  }

  bringToFront() {
    if (this.selectedElement) {
      this.businessCardService.bringToFront(this.selectedElement);
    }
  }

  sendToBack() {
    if (this.selectedElement) {
      this.businessCardService.sendToBack(this.selectedElement);
    }
  }

  new_template() {
    this.new_template_element = true;
  }


  flipImage() {
    const currentScale = this.imageStyles.transform === 'scaleX(1)' ? -1 : 1;
    this.imageStyles = { transform: `scaleX(${currentScale})` };
  }

  cropImage() {
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    const img = this.imageElement.nativeElement;

    const cropWidth = 100; // Adjust as needed
    const cropHeight = 100; // Adjust as needed

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    if (context) {
      context.drawImage(img, 0, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      const croppedImageURL = canvas.toDataURL('image/png');

      // Display the cropped image (optional)
      img.src = croppedImageURL;
    }
  }

}

