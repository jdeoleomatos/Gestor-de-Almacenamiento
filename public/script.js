// Configuración de la API
const API_BASE = 'http://localhost:3000'; 
let currentUser = null;
let editingProductId = null;
let editingUserId = null;

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Eventos de cambio de pantalla
    document.getElementById('showRegister').addEventListener('click', () => {
        loginScreen.classList.add('hidden');
        registerScreen.classList.remove('hidden');
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        registerScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    });

    // Evento de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Formularios
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);

    // Botones de carga
    document.getElementById('loadProducts').addEventListener('click', loadProducts);
    document.getElementById('loadUsers').addEventListener('click', loadUsers);

    // Verificar si hay usuario logueado guardado
    checkSavedUser();
});

// Verificar usuario guardado
function checkSavedUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showMainApp();
            loadProducts();
            loadUsers();
        } catch (error) {
            console.error('Error al cargar usuario guardado:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Funciones de autenticación
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Validación básica
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showNotification(`¡Bienvenido ${currentUser.nombre}! 🚀`, 'success');
            showMainApp();
            loadProducts();
            loadUsers();
            loginForm.reset();
        } else {
            showNotification(data.error || 'Error en el login', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión. Verifica que el servidor esté funcionando', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const userData = {
        nombre: document.getElementById('regNombre').value.trim(),
        apellido: document.getElementById('regApellido').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value
    };

    // Validaciones
    if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    if (userData.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    if (!isValidEmail(userData.email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('¡Cuenta creada exitosamente! 🎉', 'success');
            registerForm.reset();
            registerScreen.classList.add('hidden');
            loginScreen.classList.remove('hidden');
        } else {
            showNotification(data.error || 'Error al crear cuenta', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión. Verifica que el servidor esté funcionando', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    
    // Limpiar formularios
    document.getElementById('productForm').reset();
    document.getElementById('userForm').reset();
    document.getElementById('productsList').innerHTML = '';
    document.getElementById('usersList').innerHTML = '';
    
    editingProductId = null;
    editingUserId = null;
    
    showNotification('Sesión cerrada correctamente', 'success');
}

function showMainApp() {
    loginScreen.classList.add('hidden');
    registerScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Actualizar info del usuario
    document.getElementById('userName').textContent = `${currentUser.nombre} ${currentUser.apellido}`;
    document.getElementById('userAvatar').textContent = currentUser.nombre.charAt(0).toUpperCase();
}

// Funciones de productos
async function handleProductSubmit(e) {
    e.preventDefault();
    const productData = {
        nombre: document.getElementById('productName').value.trim(),
        precio: parseFloat(document.getElementById('productPrice').value),
        descripcion: document.getElementById('productDescription').value.trim() || null
    };

    // Validaciones
    if (!productData.nombre || !productData.precio) {
        showNotification('Nombre y precio son obligatorios', 'error');
        return;
    }

    if (productData.precio <= 0) {
        showNotification('El precio debe ser mayor a 0', 'error');
        return;
    }

    try {
        showLoading(true);
        const url = editingProductId ? 
            `${API_BASE}/actualizarProducto/${editingProductId}` : 
            `${API_BASE}/crearProducto`;
        
        const method = editingProductId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(
                editingProductId ? '✏️ Producto actualizado' : '✅ Producto creado exitosamente', 
                'success'
            );
            document.getElementById('productForm').reset();
            editingProductId = null;
            updateFormButtonText('product', false);
            loadProducts();
        } else {
            showNotification(data.error || 'Error al procesar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

async function loadProducts() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/getProductos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        showNotification('Error al cargar productos. Verifica la conexión', 'error');
        console.error('Error:', error);
        document.getElementById('productsList').innerHTML = '<p style="text-align: center; color: #666;">Error al cargar productos</p>';
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsList');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">📦 No hay productos registrados</p>';
        return;
    }

    container.innerHTML = '';
    products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'item';
        productDiv.style.animationDelay = `${index * 0.1}s`;
        
        productDiv.innerHTML = `
            <div class="item-header">
                <div class="item-title">📦 ${product.nombre}</div>
                <div class="item-actions">
                    <button class="btn btn-warning btn-small" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
            <div style="color: #666; margin-top: 10px;">
                <strong>💰 Precio:</strong> $${formatPrice(product.precio)}
                ${product.descripcion ? `<br><strong>📝 Descripción:</strong> ${product.descripcion}` : ''}
                <br><small style="color: #999;"><strong>🆔 ID:</strong> ${product.id}</small>
            </div>
        `;
        container.appendChild(productDiv);
    });
}

async function editProduct(id) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/getProducto/${id}`);
        const product = await response.json();

        if (response.ok) {
            document.getElementById('productName').value = product.nombre;
            document.getElementById('productPrice').value = product.precio;
            document.getElementById('productDescription').value = product.descripcion || '';
            editingProductId = id;
            updateFormButtonText('product', true);
            showNotification('Producto cargado para edición ✏️', 'success');
            
            // Scroll al formulario
            document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification('Error al cargar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

async function deleteProduct(id) {
    if (!confirm('🗑️ ¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/eliminarProducto/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('🗑️ Producto eliminado exitosamente', 'success');
            loadProducts();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error al eliminar producto', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Funciones de usuarios
async function handleUserSubmit(e) {
    e.preventDefault();
    const userData = {
        nombre: document.getElementById('userNombre').value.trim(),
        apellido: document.getElementById('userApellido').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        password: document.getElementById('userPassword').value
    };

    // Validaciones
    if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
        showNotification('Todos los campos son obligatorios', 'error');
        return;
    }

    if (!isValidEmail(userData.email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return;
    }

    if (userData.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    try {
        showLoading(true);
        const url = editingUserId ? 
            `${API_BASE}/usuarios/${editingUserId}` : 
            `${API_BASE}/usuarios`;
        
        const method = editingUserId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(
                editingUserId ? '✏️ Usuario actualizado' : '✅ Usuario creado exitosamente', 
                'success'
            );
            document.getElementById('userForm').reset();
            editingUserId = null;
            updateFormButtonText('user', false);
            loadUsers();
        } else {
            showNotification(data.error || 'Error al procesar usuario', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

async function loadUsers() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/usuarios`);
        
        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        showNotification('Error al cargar usuarios. Verifica la conexión', 'error');
        console.error('Error:', error);
        document.getElementById('usersList').innerHTML = '<p style="text-align: center; color: #666;">Error al cargar usuarios</p>';
    } finally {
        showLoading(false);
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">👥 No hay usuarios registrados</p>';
        return;
    }

    container.innerHTML = '';
    users.forEach((user, index) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'item';
        userDiv.style.animationDelay = `${index * 0.1}s`;
        
        const isCurrentUser = user.id === currentUser.id;
        
        userDiv.innerHTML = `
            <div class="item-header">
                <div class="item-title">
                    👤 ${user.nombre} ${user.apellido}
                    ${isCurrentUser ? '<span style="color: #4ecdc4; font-weight: bold;"> (Tú)</span>' : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-warning btn-small" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})" 
                        ${isCurrentUser ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
            <div style="color: #666; margin-top: 10px;">
                <strong>📧 Email:</strong> ${user.email}<br>
                <strong>🔐 Rol:</strong> ${user.rol === 1 ? '👑 Administrador' : '👤 Usuario'}
                <br><small style="color: #999;"><strong>🆔 ID:</strong> ${user.id}</small>
                ${isCurrentUser ? '<br><span style="color: #4ecdc4; font-weight: bold;"><i class="fas fa-crown"></i> Usuario actual</span>' : ''}
            </div>
        `;
        container.appendChild(userDiv);
    });
}

async function editUser(id) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/usuarios/${id}`);
        const user = await response.json();

        if (response.ok) {
            document.getElementById('userNombre').value = user.nombre;
            document.getElementById('userApellido').value = user.apellido;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPassword').value = ''; // Por seguridad
            editingUserId = id;
            updateFormButtonText('user', true);
            showNotification('Usuario cargado para edición ✏️', 'success');
            
            // Scroll al formulario
            document.getElementById('userForm').scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification('Error al cargar usuario', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

async function deleteUser(id) {
    if (id === currentUser.id) {
        showNotification('❌ No puedes eliminarte a ti mismo', 'error');
        return;
    }

    if (!confirm('🗑️ ¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/usuarios/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('🗑️ Usuario eliminado exitosamente', 'success');
            loadUsers();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Error al eliminar usuario', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Funciones de utilidad
function showNotification(message, type = 'success') {
    // Remover notificación existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function showLoading(show) {
    // Puedes implementar un spinner de carga aquí si quieres
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

function updateFormButtonText(type, isEditing) {
    if (type === 'product') {
        const button = document.querySelector('#productForm button[type="submit"]');
        if (isEditing) {
            button.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
            button.className = 'btn btn-warning';
        } else {
            button.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
            button.className = 'btn btn-primary';
        }
    } else if (type === 'user') {
        const button = document.querySelector('#userForm button[type="submit"]');
        if (isEditing) {
            button.innerHTML = '<i class="fas fa-save"></i> Actualizar Usuario';
            button.className = 'btn btn-warning';
        } else {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Usuario';
            button.className = 'btn btn-primary';
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(price);
}

// Funciones globales para los botones inline
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editUser = editUser;
window.deleteUser = deleteUser;

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    showNotification('Ha ocurrido un error inesperado', 'error');
});

// Manejo de errores de promesas no capturadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Error de promesa no capturada:', e.reason);
    showNotification('Error de conexión con el servidor', 'error');
});

console.log('🚀 ProductosApp Frontend cargado correctamente!');
console.log('📡 API Base URL:', API_BASE);