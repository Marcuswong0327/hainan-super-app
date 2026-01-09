import { addNotification } from './components/NotificationPanel';

// Payment deadline is the 8th of each month
const PAYMENT_DEADLINE_DAY = 8;

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  monthlyPayment: number;
  nextPaymentDate: string | null;
  status: string;
  totalPaid: number;
  remainingBalance: number;
}

/**
 * Check if a payment is overdue (past the 8th of the current month)
 */
export function isPaymentOverdue(nextPaymentDate: string | null): boolean {
  if (!nextPaymentDate) return false;
  
  const today = new Date();
  const paymentDate = new Date(nextPaymentDate);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Create deadline date (8th of current month)
  const deadlineDate = new Date(currentYear, currentMonth, PAYMENT_DEADLINE_DAY);
  deadlineDate.setHours(23, 59, 59, 999); // End of day on 8th
  
  // Payment is overdue if today is past the 8th and the payment date is before or on the deadline
  return today > deadlineDate && paymentDate <= deadlineDate;
}

/**
 * Get all admin user IDs (sub_admin and super_admin)
 * For demo purposes, we'll notify any user with admin role
 */
export function getAllAdminUserIds(): string[] {
  const adminIds: string[] = [];
  
  // Check current user
  const currentUser = JSON.parse(localStorage.getItem('myHainanUser') || 'null');
  if (currentUser) {
    const role = currentUser.currentRole || currentUser.role;
    if (role === 'sub_admin' || role === 'super_admin') {
      if (!adminIds.includes(currentUser.id)) {
        adminIds.push(currentUser.id);
      }
    }
    // Also check roles array
    if (currentUser.roles) {
      currentUser.roles.forEach((r: string) => {
        if ((r === 'sub_admin' || r === 'super_admin') && !adminIds.includes(currentUser.id)) {
          adminIds.push(currentUser.id);
        }
      });
    }
  }
  
  // For demo: also check if there are stored admin IDs
  // In production, this would query the database for all admin users
  const storedAdmins = localStorage.getItem('myHainanAdminUsers');
  if (storedAdmins) {
    const stored = JSON.parse(storedAdmins);
    stored.forEach((id: string) => {
      if (!adminIds.includes(id)) {
        adminIds.push(id);
      }
    });
  }
  
  return adminIds;
}

/**
 * Check all loans and send notifications for overdue payments
 */
export function checkPaymentDeadlines(): void {
  const loans = JSON.parse(localStorage.getItem('myHainanLoans') || '[]');
  const activeLoans = loans.filter((loan: Loan) => 
    loan.status === 'approved' && loan.remainingBalance > 0
  );
  
  const adminIds = getAllAdminUserIds();
  const notifiedLoans = JSON.parse(localStorage.getItem('myHainanNotifiedOverdueLoans') || '[]');
  
  activeLoans.forEach((loan: Loan) => {
    if (isPaymentOverdue(loan.nextPaymentDate)) {
      // Check if we've already notified for this loan this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const notificationKey = `${loan.id}-${currentYear}-${currentMonth}`;
      
      if (!notifiedLoans.includes(notificationKey)) {
        // Notify the user
        addNotification(
          loan.userId,
          'Payment Overdue - Action Required',
          `Your monthly loan payment of RM ${loan.monthlyPayment.toFixed(2)} was due on the 8th. Please make your payment as soon as possible.`,
          'loan'
        );
        
        // Notify all admins
        adminIds.forEach((adminId) => {
          addNotification(
            adminId,
            'Loan Payment Overdue Alert',
            `User loan payment (RM ${loan.monthlyPayment.toFixed(2)}) is overdue. Loan ID: ${loan.id}`,
            'loan'
          );
        });
        
        // Mark as notified
        notifiedLoans.push(notificationKey);
      }
    }
  });
  
  localStorage.setItem('myHainanNotifiedOverdueLoans', JSON.stringify(notifiedLoans));
}

/**
 * Simulate deadline check (for testing purposes)
 * This will trigger notifications even if deadline hasn't passed
 */
export function simulateDeadlineCheck(): void {
  const loans = JSON.parse(localStorage.getItem('myHainanLoans') || '[]');
  const activeLoans = loans.filter((loan: Loan) => 
    loan.status === 'approved' && loan.remainingBalance > 0
  );
  
  const adminIds = getAllAdminUserIds();
  
  activeLoans.forEach((loan: Loan) => {
    // Notify the user
    addNotification(
      loan.userId,
      'Payment Overdue - Action Required (Simulated)',
      `Your monthly loan payment of RM ${loan.monthlyPayment.toFixed(2)} was due on the 8th. Please make your payment as soon as possible. [SIMULATED]`,
      'loan'
    );
    
    // Notify all admins
    adminIds.forEach((adminId) => {
      addNotification(
        adminId,
        'Loan Payment Overdue Alert (Simulated)',
        `User loan payment (RM ${loan.monthlyPayment.toFixed(2)}) is overdue. Loan ID: ${loan.id} [SIMULATED]`,
        'loan'
      );
    });
  });
}
