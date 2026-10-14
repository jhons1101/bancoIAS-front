import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { Account } from './models/account.model';
import {
  Transaction,
  CreateTransactionRequest
} from './models/transaction.model';
import { BankingApiService } from './services/banking-api.service';
import { TransactionDetailModalComponent } from './transaction-detail-modal/transaction-detail-modal';

registerLocaleData(localeEsCo);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TransactionDetailModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {

  private readonly api = inject(BankingApiService);

  accounts: Account[] = [];
  transactions: Transaction[] = [];

  selectedTransaction: Transaction | null = null;
  transactionDetailOpen = false;
  loadingTransactionDetail = false;
  transactionDetailError = '';

  loadingAccounts = false;
  loadingTransactions = false;
  submitting = false;
  searching = false;

  successMessage = '';
  errorMessage = '';
  searchError = '';

  transactionForm = new FormGroup({
    requestReference: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^REF-[A-Za-z0-9-]+$/)
      ]
    }),
    sourceAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    destinationAccountId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    amount: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1)
      ]
    })
  });

  searchForm = new FormGroup({
    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  ngOnInit(): void {
    this.loadAccounts();
    this.refreshTransactionHistory();
    this.searchTransaction();
  }

  get activeAccounts(): Account[] {
    return this.accounts.filter(
      account => account.status === 'ACTIVE'
    );
  }

  get sourceAccount(): Account | undefined {
    const id = this.transactionForm.controls.sourceAccountId.value;

    return this.accounts.find(account => account.accountId === id);
  }

  get destinationAccount(): Account | undefined {
    const id = this.transactionForm.controls.destinationAccountId.value;

    return this.accounts.find(account => account.accountId === id);
  }

  loadAccounts(): void {
    this.loadingAccounts = true;

    this.api.getAccounts()
      .pipe(finalize(() => this.loadingAccounts = false))
      .subscribe({
        next: accounts => {
          this.accounts = accounts;
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible consultar las cuentas.'
          );
        }
      });
  }

  refreshTransactionHistory(): void {
    this.loadingTransactions = true;

    this.api.getTransactions()
      .pipe(finalize(() => this.loadingTransactions = false))
      .subscribe({
        next: transactions => {
          this.transactions = [...transactions].sort(
            (a, b) =>
              new Date(b.processedAt).getTime()
              - new Date(a.processedAt).getTime()
          );
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible consultar las transferencias.'
          );
        }
      });
  }

  registerTransaction(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const value = this.transactionForm.getRawValue();

    if (value.sourceAccountId === value.destinationAccountId) {
      this.errorMessage =
        'La cuenta origen y destino deben ser diferentes.';
      return;
    }

    const source = this.accounts.find(
      account => account.accountId === value.sourceAccountId
    );

    const destination = this.accounts.find(
      account => account.accountId === value.destinationAccountId
    );

    if (!source || source.status !== 'ACTIVE') {
      this.errorMessage = 'La cuenta origen no está activa.';
      return;
    }

    if (!destination || destination.status !== 'ACTIVE') {
      this.errorMessage = 'La cuenta destino no está activa.';
      return;
    }

    if (value.amount === null || value.amount <= 0) {
      this.errorMessage = 'El importe debe ser mayor que cero.';
      return;
    }

    const request: CreateTransactionRequest = {
      requestReference: value.requestReference.trim(),
      sourceAccountId: value.sourceAccountId,
      destinationAccountId: value.destinationAccountId,
      amount: value.amount
    };

    this.submitting = true;

    this.api.createTransaction(request)
      .pipe(finalize(() => this.submitting = false))
      .subscribe({
        next: transaction => {
          this.successMessage =
            transaction.status === 'REJECTED'
              ? `Transferencia rechazada: ${transaction.reason ?? 'Sin motivo informado.'}`
              : `Transferencia ${transaction.requestReference} procesada correctamente.`;

          this.transactionForm.reset({
            requestReference: '',
            sourceAccountId: '',
            destinationAccountId: '',
            amount: null
          });

          this.refreshTransactionHistory();
          this.loadAccounts();
        },
        error: error => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No fue posible registrar la transferencia.'
          );

          // Recargar por si el servidor guardó un rechazo
          // pero respondió con un estado HTTP de error.
          this.refreshTransactionHistory();
          this.loadAccounts();
        }
      });
  }

  searchTransaction(): void {
    this.searchError = '';
    this.selectedTransaction = null;

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const reference =
      this.searchForm.controls.reference.value.trim();

    this.searching = true;

    this.api.getTransactionByReference(reference)
      .pipe(finalize(() => this.searching = false))
      .subscribe({
        next: transaction => {
          this.selectedTransaction = transaction;
        },
        error: error => {
          this.searchError = this.getErrorMessage(
            error,
            `No se encontró la transferencia ${reference}.`
          );
        }
      });
  }

  openTransactionDetail(transaction: Transaction): void {
    this.transactionDetailOpen = true;
    this.loadingTransactionDetail = true;
    this.transactionDetailError = '';
    this.selectedTransaction = transaction;

    this.api.getTransactionByReference(transaction.requestReference)
      .pipe(finalize(() => this.loadingTransactionDetail = false))
      .subscribe({
        next: detail => {
          this.selectedTransaction = detail;
        },
        error: error => {
          this.transactionDetailError = this.getErrorMessage(
            error,
            `No se encontró la transferencia ${transaction.requestReference}.`
          );
        }
      });
  }

  closeTransactionDetail(): void {
    this.transactionDetailOpen = false;
    this.selectedTransaction = null;
    this.transactionDetailError = '';
  }

  clearSearch(): void {
    this.searchForm.reset({ reference: '' });
    this.selectedTransaction = null;
    this.searchError = '';
  }

  refresh(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadAccounts();
    this.refreshTransactionHistory();
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

  getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as
        | { message?: string; title?: string }
        | string
        | null;

      if (typeof body === 'string' && body.trim()) {
        return body;
      }

      if (body && typeof body === 'object') {
        return body.message ?? body.title ?? fallback;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el backend. Verifica que Spring Boot esté ejecutándose y que CORS esté configurado.';
      }

      return error.message || fallback;
    }

    return fallback;
  }
}