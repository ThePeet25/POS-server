// script.js
const productListDiv = document.getElementById('product-list');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const currentPageDisplay = document.getElementById('current-page-display');
const totalPagesDisplay = document.getElementById('total-pages-display');

const searchTermInput = document.getElementById('search-term');
const categoryFilterSelect = document.getElementById('category-filter');
const sortBySelect = document.getElementById('sort-by');
const sortOrderSelect = document.getElementById('sort-order');
const itemsPerPageInput = document.getElementById('items-per-page');
const applyFiltersBtn = document.getElementById('apply-filters');

let currentPage = 1;
let itemsPerPage = 20;
let currentCategoryId = '';
let currentSearchTerm = '';
let currentSortBy = 'name';
let currentSortOrder = 'asc';

// Function to fetch and display categories (optional, but good for filter)
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories'); // Assuming you have a /api/categories endpoint
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilterSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}


// Function to fetch products from the API
async function fetchProductsAndRender() {
    const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
    });

    if (currentCategoryId) params.append('categoryId', currentCategoryId);
    if (currentSearchTerm) params.append('searchTerm', currentSearchTerm);

    try {
        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();

        // Render products
        productListDiv.innerHTML = ''; // Clear previous products
        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <h3>${product.name}</h3>
                    <p><strong>Author:</strong> ${product.author || 'N/A'}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p><strong>Barcode:</strong> ${product.barcode || 'N/A'}</p>
                    <p><strong>Stock:</strong> ${product.quantity}</p>
                `;
                productListDiv.appendChild(productItem);
            });
        } else {
            productListDiv.innerHTML = '<p>No products found.</p>';
        }


        // Update pagination controls
        currentPageDisplay.textContent = data.pagination.currentPage;
        totalPagesDisplay.textContent = data.pagination.totalPages;

        prevPageBtn.disabled = !data.pagination.hasPreviousPage;
        nextPageBtn.disabled = !data.pagination.hasNextPage;

    } catch (error) {
        console.error('Error fetching products:', error);
        productListDiv.innerHTML = '<p>Error loading products.</p>';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    }
}

// Event listeners for pagination buttons
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchProductsAndRender();
    }
});

nextPageBtn.addEventListener('click', () => {
    // We get totalPages from the last successful fetch
    const totalPages = Number(totalPagesDisplay.textContent);
    if (currentPage < totalPages) {
        currentPage++;
        fetchProductsAndRender();
    }
});

// Event listener for filter button
applyFiltersBtn.addEventListener('click', () => {
    currentSearchTerm = searchTermInput.value.trim();
    currentCategoryId = categoryFilterSelect.value; // Will be '' if "All Categories" is selected
    currentSortBy = sortBySelect.value;
    currentSortOrder = sortOrderSelect.value;
    itemsPerPage = Number(itemsPerPageInput.value);

    currentPage = 1; // Reset to first page when applying new filters
    fetchProductsAndRender();
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories(); // Fetch categories for the filter dropdown
    fetchProductsAndRender(); // Fetch and render products for the first time
});

// Optional: Add event listener for enter key in search term for convenience
searchTermInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        applyFiltersBtn.click(); // Simulate button click
    }
});