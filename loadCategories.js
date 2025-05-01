import { API_BASE_URL } from "./config.js";

const categorySelect = document.getElementById("category");

// load categories into dropdown
export async function loadCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  const categories = await response.json();
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}
