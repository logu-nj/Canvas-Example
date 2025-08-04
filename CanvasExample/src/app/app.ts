import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Mouse events
    canvas.addEventListener('mousedown', () => {
      this.saveState();
      this.isDrawing = true;
      this.ctx.beginPath();
    });

    canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
      this.ctx.closePath();
    });

    canvas.addEventListener('mousemove', (event) => {
      if (!this.isDrawing) return;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = 'black';
      this.ctx.lineTo(event.offsetX, event.offsetY);
      this.ctx.stroke();
    });
  }

  saveState() {
    this.undoStack.push(this.canvasRef.nativeElement.toDataURL());
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(this.canvasRef.nativeElement.toDataURL());
      const prevState = this.undoStack.pop()!;
      this.restoreState(prevState);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(this.canvasRef.nativeElement.toDataURL());
      const nextState = this.redoStack.pop()!;
      this.restoreState(nextState);
    }
  }

  restoreState(state: string) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      this.ctx.drawImage(img, 0, 0);
    };
  }
}
