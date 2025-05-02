import { loadCategories } from "./loadCategories.js";
import { API_BASE_URL } from "./config.js";

const expenseForm = document.getElementById("expense-form");
const expensesTable = document.getElementById("expenses-table-body");
const totalSumExpense = document.getElementById("total-expense");
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

// load and display expenses
async function loadExpenses() {
  try {
    const res = await fetch(`${API_BASE_URL}/expenses?_expand=category`);
    const expenses = await res.json();
    renderExpensesTable(expenses);
  } catch (error) {
    console.error("Failed to load expenses: " + error);
  }
}

// handle sum total expenses
async function loadSumTotalExpenses() {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses/total`);
    if (!response.ok) throw new Error("Failed to fetch total expenses value");
    const data = await response.json();
    totalSumExpense.textContent = `Total: €${data.totalExpenses.toFixed(2)}`;
  } catch (error) {
    console.error(error);
    totalSumExpense.textContent = "Total: Error";
  }
}

// handle form submit
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newExpense = {
    description: document.getElementById("description").value,
    value: parseFloat(document.getElementById("value").value),
    date: document.getElementById("createdAt").value,
    categoryId: parseInt(document.getElementById("category").value),
  };
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newExpense),
  });

  if (response.ok) {
    expenseForm.reset();
    await loadExpenses();
    await loadSumTotalExpenses();
  } else {
    throw new Error("Failed to add expense");
  }
});

// filtering expenses by description
async function loadFilteredExpenses() {
  const description = document.getElementById("filterDescription").value;
  let url = `${API_BASE_URL}/expenses`;

  if (description.trim()) {
    const encoded = encodeURIComponent(description);
    url += `?description=${encoded}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch expenses");

    const expenses = await response.json();
    renderExpensesTable(expenses);
  } catch (error) {
    console.error(error);
  }
}

// render expenses list
function renderExpensesTable(expenses) {
  expensesTable.innerHTML = "";

  expenses.forEach((exp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${exp.description}</td>
      <td class="p-2">${exp.value.toFixed(2)}</td>
      <td class="p-2">${exp.createdAt}</td>
      <td class="p-2">${exp.category?.name || "Uncategorized"}</td>
      <td class="p-2">
        <button class="text-red-600 hover:underline delete-btn" data-id="${
          exp.id
        }">Delete</button>
      </td>`;
    expensesTable.appendChild(row);
  });
}

// delete with modal
let expenseIdToDelete = null;

function openDeleteModal(id) {
  expenseIdToDelete = id;
  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  expenseIdToDelete = null;
  deleteModal.classList.add("hidden");
}

cancelDeleteBtn.addEventListener("click", closeDeleteModal);

confirmDeleteBtn.addEventListener("click", async () => {
  if (!expenseIdToDelete) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/expenses/${expenseIdToDelete}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) throw new Error("Failed to delete expense");

    await loadExpenses();
    await loadSumTotalExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
  } finally {
    closeDeleteModal();
  }
});

// handle delete button clicks using event delegation
expensesTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    openDeleteModal(id);
  }
});

// filter expense by description event
document.getElementById("filterDescription").addEventListener("input", () => {
  loadFilteredExpenses();
});

// when browser loads
document.addEventListener("DOMContentLoaded", () => {
  loadSumTotalExpenses();
  loadCategories();
  loadExpenses();
});
