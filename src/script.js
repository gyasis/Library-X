let currentModule = '';
let currentPath = [];

document.getElementById('loadButton').addEventListener('click', () => {
    currentModule = document.getElementById('moduleInput').value;
    currentPath = [];
    loadMethods(currentModule);
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
});

function loadMethods(moduleName, className = '') {
    const url = className ? `/children/${moduleName}/${className}` : `/methods/${moduleName}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('methodsContainer');
            container.innerHTML = '';
            if (data.detail) {
                container.innerHTML = `<p class="text-red-500">${data.detail}</p>`;
            } else {
                displayMethods(data.methods, container);
            }
        });
}

function displayMethods(methods, container) {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
    const color = colors[currentPath.length % colors.length];

    if (currentPath.length > 0) {
        const backButton = document.createElement('button');
        backButton.className = 'bg-gray-500 text-white py-2 px-4 rounded';
        backButton.innerText = 'Back';
        backButton.addEventListener('click', () => {
            currentPath.pop();
            const parentClass = currentPath.length > 0 ? currentPath[currentPath.length - 1] : '';
            loadMethods(currentModule, parentClass);
        });
        container.appendChild(backButton);
    }

    Object.keys(methods).forEach(method => {
        const button = document.createElement('button');
        button.className = `${color} text-white py-2 px-4 rounded`;
        button.innerText = method;
        button.addEventListener('click', () => {
            document.getElementById('modalTitle').innerText = method;
            document.getElementById('modalContent').innerText = methods[method].doc || 'No documentation available';
            document.getElementById('modal').classList.remove('hidden');
        });
        container.appendChild(button);

        if (methods[method].type === 'class') {
            const childButton = document.createElement('button');
            childButton.className = `${color} text-white py-2 px-4 rounded ml-2`;
            childButton.innerText = `Explore ${method}`;
            childButton.addEventListener('click', () => {
                currentPath.push(method);
                loadMethods(currentModule, method);
            });
            container.appendChild(childButton);
        }
    });
}