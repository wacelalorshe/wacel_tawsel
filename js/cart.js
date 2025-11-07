// إدارة عربة التسوق لنظام التوصيل
console.log('🛒 تحميل نظام السلة للتوصيل...');

// دالة الحصول على السلة من التخزين المحلي
function getCart() {
    const cart = localStorage.getItem('waseelDeliveryCart');
    return cart ? JSON.parse(cart) : [];
}

// دالة حفظ السلة في التخزين المحلي
function saveCart(cart) {
    localStorage.setItem('waseelDeliveryCart', JSON.stringify(cart));
}

// دالة إضافة منتج إلى السلة
window.addToCart = function(productId, productName, productPrice, productImage, restaurantId, restaurantName) {
    const cart = getCart();
    
    // التحقق إذا كان المنتج من مطعم مختلف
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
        if (confirm('لديك منتجات من مطعم آخر في سلة التسوق. هل تريد إفراغ السلة وإضافة هذا المنتج؟')) {
            // إفراغ السلة وإضافة المنتج الجديد
            const newCart = [{
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                restaurantId: restaurantId,
                restaurantName: restaurantName,
                quantity: 1
            }];
            saveCart(newCart);
            updateCartCount();
            showNotification(`تم إضافة "${productName}" إلى السلة`);
            return;
        } else {
            return;
        }
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            restaurantId: restaurantId,
            restaurantName: restaurantName,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartCount();
    
    // إشعار للمستخدم
    showNotification(`تم إضافة "${productName}" إلى السلة`);
}

// دالة إزالة منتج من السلة
window.removeFromCart = function(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    updateCartCount();
    
    // إذا كنا في صفحة السلة، قم بتحديث العرض
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
}

// دالة تحديث كمية المنتج في السلة
window.updateCartQuantity = function(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
        updateCartCount();
        
        // إذا كنا في صفحة السلة، قم بتحديث العرض
        if (window.location.pathname.includes('cart.html')) {
            displayCartItems();
        }
    }
}

// دالة تحديث عدد العناصر في السلة
function updateCartCount() {
    const cart = getCart();
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// دالة عرض عناصر السلة
window.displayCartItems = function() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const restaurantInfo = document.getElementById('restaurant-info');
    
    if (!cartContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-shopping-cart display-1 mb-3"></i>
                    <h4>سلة التسوق فارغة</h4>
                    <p class="mb-4">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
                    <a href="restaurants.html" class="btn btn-primary">
                        <i class="fas fa-utensils me-2"></i>استعرض المطاعم
                    </a>
                </div>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '0.00';
        if (restaurantInfo) restaurantInfo.innerHTML = '';
        return;
    }
    
    // عرض معلومات المطعم
    if (restaurantInfo && cart.length > 0) {
        restaurantInfo.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-utensils me-2"></i>
                <strong>الطلبات من:</strong> ${cart[0].restaurantName}
            </div>
        `;
    }
    
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="height: 80px; object-fit: cover;">
                    </div>
                    <div class="col-md-4">
                        <h5 class="mb-1">${item.name}</h5>
                        <p class="text-muted mb-0">$${item.price}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" onchange="updateCartQuantity('${item.id}', parseInt(this.value))">
                            <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <h5 class="text-primary">$${itemTotal.toFixed(2)}</h5>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // حساب التكاليف الإضافية
    const deliveryFee = 5.00; // رسوم التوصيل
    const tax = subtotal * 0.05; // ضريبة 5%
    const total = subtotal + deliveryFee + tax;
    
    cartContainer.innerHTML = itemsHTML;
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // تحديث ملخص الطلب
    updateOrderSummary(subtotal, deliveryFee, tax, total);
}

// تحديث ملخص الطلب
function updateOrderSummary(subtotal, deliveryFee, tax, total) {
    const summaryHTML = `
        <div class="d-flex justify-content-between mb-3">
            <span>المجموع الفرعي:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-3">
            <span>رسوم التوصيل:</span>
            <span>$${deliveryFee.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-3">
            <span>الضريبة (5%):</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <hr>
        <div class="d-flex justify-content-between mb-4">
            <strong>المجموع الكلي:</strong>
            <strong class="text-primary">$${total.toFixed(2)}</strong>
        </div>
    `;
    
    const orderSummary = document.getElementById('order-summary');
    if (orderSummary) {
        orderSummary.innerHTML = summaryHTML;
    }
}

// دالة إتمام الطلب
window.completeOrder = async function(customerInfo) {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('❌ سلة التسوق فارغة. أضف منتجات قبل إتمام الطلب.');
        return false;
    }
    
    try {
        const order = {
            items: cart,
            customer: customerInfo,
            subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: 5.00,
            tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.00 + (cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05),
            status: 'pending',
            restaurantId: cart[0].restaurantId,
            restaurantName: cart[0].restaurantName
        };
        
        const orderId = await addOrderToFirebase(order);
        
        // تفريغ السلة بعد إتمام الطلب
        localStorage.removeItem('waseelDeliveryCart');
        updateCartCount();
        
        return orderId;
    } catch (error) {
        console.error('❌ خطأ في إتمام الطلب:', error);
        return false;
    }
}

// دالة إظهار إشعار
function showNotification(message) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
    `;
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// تهيئة السلة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // إذا كنا في صفحة السلة، قم بعرض العناصر
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
});
