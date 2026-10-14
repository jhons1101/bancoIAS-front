import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { Transaction } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail-modal.html',
  styleUrl: './transaction-detail-modal.css'
})
export class TransactionDetailModalComponent {
  @Input() open = false;
  @Input() transaction: Transaction | null = null;
  @Input() loading = false;
  @Input() error = '';
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PROCESSED':
        return 'Procesada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
    }
  }
}
