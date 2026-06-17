let defaultTransactions = [
{
 id:1,
 date:"2026-06-15",
 category:"Food",
 amount:-2500,
 status:"Success",
 type:"expense"
},

{
 id:2,
 date:"2026-06-12",
 category:"Shopping",
 amount:-4000,
 status:"Success",
 type:"expense"
},

{
 id:3,
 date:"2026-06-08",
 category:"Entertainment",
 amount:-2000,
 status:"Success",
 type:"expense"
}
];

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || defaultTransactions;

let monthlyIncome = 75000;
let monthlyExpense = 32500;

const today = new Date().toISOString().split("T")[0];
document.getElementById("incomeDate").value = today;
document.getElementById("expenseDate").value = today;

function openIncomeModal() {
  document.getElementById("incomeModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function openExpenseModal() {
  document.getElementById("expenseModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.body.style.overflow = "auto";

  if (modalId === "incomeModal") {
    document.getElementById("incomeForm").reset();
    document.getElementById("incomeDate").value = today;
  } else if (modalId === "expenseModal") {
    document.getElementById("expenseForm").reset();
    document.getElementById("expenseDate").value = today;
  }
}

window.onclick = function (event) {
  const incomeModal = document.getElementById("incomeModal");
  const expenseModal = document.getElementById("expenseModal");
  if (event.target === incomeModal) closeModal("incomeModal");
  if (event.target === expenseModal) closeModal("expenseModal");
};

function addIncome() {
  const incomeAmount = Number(document.getElementById("incomeAmount").value);
  const incomeCategory = document.getElementById("incomeCategory").value;
  const incomeDescription = document.getElementById("incomeDescription").value;
  const incomeDate = document.getElementById("incomeDate").value;

  if (!incomeAmount || !incomeCategory || !incomeDate) {
    alert("Please fill all the fields.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    date: incomeDate,
    category: incomeCategory.charAt(0).toUpperCase() + incomeCategory.slice(1),
    amount: incomeAmount,
    status: "Success",
    type: "income",
    description: incomeDescription,
  };

  transactions.unshift(newTransaction);
  saveTransactions();
  monthlyIncome += incomeAmount;
  updateDashboard();
  updateTransactionsTable();
  closeModal("incomeModal");
  showNotification("Income added successfully!", "success");
}

function addExpense() {
  const expenseAmount = Number(document.getElementById("expenseAmount").value);
  const expenseCategory = document.getElementById("expenseCategory").value;
  const expenseDescription =
    document.getElementById("expenseDescription").value;
  const expenseDate = document.getElementById("expenseDate").value;

  if (!expenseAmount || !expenseCategory || !expenseDate) {
    alert("Please fill all the fields.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    date: expenseDate,
    category:
      expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1),
    amount: -expenseAmount,
    status: "Success",
    type: "expense",
    description: expenseDescription,
  };

  transactions.unshift(newTransaction);
  saveTransactions();
  monthlyExpense += expenseAmount;
  updateDashboard();
  updateTransactionsTable();
  closeModal("expenseModal");
  showNotification("Expense added successfully!", "success");
}

function updateDashboard() {
  document.querySelector(".income-amount").textContent =
    `₹${monthlyIncome.toLocaleString("en-IN")}.00`;
  document.querySelector(".expense-amount").textContent =
    `₹${monthlyExpense.toLocaleString("en-IN")}.00`;
  document.querySelector(".total-expenses").textContent =
    `₹${monthlyExpense.toLocaleString("en-IN")}.00`;
  document.querySelector(".spending-used").textContent =
    `used from ₹${monthlyExpense.toLocaleString("en-IN")}.00`;

  let spendingLimit = 100000;
  const percentage = (monthlyExpense / spendingLimit) * 100;
  document.querySelector(".progress-fill").style.width =
    `${Math.min(percentage, 100)}%`;
}

function updateTransactionsTable() {
  const tbody = document.querySelector(".transactions-table tbody");
  tbody.innerHTML = "";

  const recentTransactions = transactions.slice(0, 10);

  recentTransactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const formattedDate = new Date(transaction.date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );

    const amountDisplay =
      transaction.amount > 0
        ? `₹${transaction.amount.toLocaleString("en-IN")}.00`
        : `-₹${Math.abs(transaction.amount).toLocaleString("en-IN")}.00`;

    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${transaction.category}</td>
      <td style="color:${transaction.amount > 0 ? "#10b981" : "#ef4444"}; font-weight: 600;">
        ${amountDisplay}
      </td>
      <td><span class="status-success">${transaction.status}</span></td>
      <td>
        <button class="action-btn" onclick="deleteTransaction(${transaction.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background-color: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function exportTransactions() {
  const data = JSON.stringify(transactions, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
  URL.revokeObjectURL(url);
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  if (transaction.amount > 0) {
    monthlyIncome -= transaction.amount;
  } else {
    monthlyExpense -= Math.abs(transaction.amount);
  }

  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  updateDashboard();
  updateTransactionsTable();
  showNotification("Transaction deleted", "error");
}

document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  updateTransactionsTable();
});
