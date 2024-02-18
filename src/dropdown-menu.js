// dropdown-menu.js
class DropdownMenu extends HTMLElement {
    constructor() {
        super();

        // Fetch the template HTML file
        fetch('dropdown-menu-template.html')
            .then(response => response.text())
            .then(html => {
                // Create a template element and set its innerHTML to the fetched HTML
                const template = document.createElement('template');
                template.innerHTML = html;

                // Select the template content
                const templateContent = template.content.childNodes;

                // Create shadow DOM and append template
                this.attachShadow({ mode: 'open' });
                
                templateContent.forEach(node => {
                    this.shadowRoot.appendChild(node.cloneNode(true));
                });

                // Add event listener to toggle dropdown
                const toggleButton = this.shadowRoot.querySelector('.dropdown-toggle');
                toggleButton.addEventListener('click', () => {
                    this.closeAllDropdownsExceptThis();
                    
                    const dropdownContent = this.shadowRoot.querySelector('.dropdown-content');
                    dropdownContent.classList.toggle('show');
                });
            })
            .catch(error => {
                console.error('Error fetching dropdown menu template:', error);
            });
    }
    
    closeAllDropdownsExceptThis () {
        const allDropdowns = document.getElementsByTagName('dropdown-menu');
        for (const dropdown of allDropdowns) {
            if (dropdown !== this) {
                dropdown.closeDropdown();
            }
        }
    }
    
    closeDropdown () {
        const dropdownContent = this.shadowRoot.querySelector('.dropdown-content');
        dropdownContent.classList.remove('show');
    
        // Dispatch custom event indicating dropdown has been closed
        this.dispatchEvent(new CustomEvent('dropdownClosed'));
    }
}

// Define the custom element
customElements.define('dropdown-menu', DropdownMenu);
