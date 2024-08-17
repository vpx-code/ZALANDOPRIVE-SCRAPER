document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');

    // Function to fetch products from the API
    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }

    // Function to render products on the page
    function renderProducts(products) {
        productList.innerHTML = ''; // Clear any existing content

        // Sort products by specialPrice (assuming 'specialPrice' is in euros)
        products.sort((a, b) => a.specialPrice - b.specialPrice);

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';

            // Create clickable link
            const productLink = document.createElement('a');
            productLink.href = product.urlPath;
            productLink.target = '_blank'; // Open link in new tab (optional)

            // Render image
            const productImage = document.createElement('img');
            productImage.src = product.images[0];
            productLink.appendChild(productImage);

            // Render brand and shop
            const brandShop = document.createElement('b');
            brandShop.textContent = `${product.brand} ${product.nameShop}`;
            productLink.appendChild(brandShop);

            // Render size (assuming size is available in product data)
            if (product.size) {
                const size = document.createElement('p');
                size.textContent = `Size: ${product.size}`;
                productLink.appendChild(size);
            }

            // Render special price in euros with two decimals
            const specialPrice = document.createElement('h2');
            const formattedPrice = formatPrice(product.specialPrice);
            specialPrice.innerHTML = `${formattedPrice} €`;
            productLink.appendChild(specialPrice);

            // Append clickable link to product element
            productElement.appendChild(productLink);

            productList.appendChild(productElement);
        });
    }

    // Function to format price as euros with two decimals
    function formatPrice(price) {
        priceInEuros = price/100
        return priceInEuros.toFixed(2).replace('.', ',');
    }

    // Fetch products when the page loads
    fetchProducts();
});