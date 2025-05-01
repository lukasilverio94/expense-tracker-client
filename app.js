import { loadCategories } from "./loadCategories.js";
import { API_BASE_URL } from "./config.js";

const expenseForm = document.getElementById("expense-form");
const expensesTable = document.getElementById("expenses-table-body");
const totalSumExpense = document.getElementById("total-expense");

// load and display expenses
async function loadExpenses() {
  try {
    expensesTable.innerHTML = ""; // clear existing rows
    const res = await fetch(`${API_BASE_URL}/expenses?_expand=category`);
    const expenses = await res.json();

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
          }">Delete
        </button>
        </td>  
        `;
      expensesTable.appendChild(row);
    });
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
    totalSumExpense.textContent = `Total: $${data.totalExpenses.toFixed(2)}`;
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

// handle delete button clicks using event delegation
expensesTable.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete expense");

        await loadExpenses();
        await loadSumTotalExpenses();
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  }
});

// when browser loads
document.addEventListener("DOMContentLoaded", () => {
  loadSumTotalExpenses();
  loadCategories();
  loadExpenses();
});
