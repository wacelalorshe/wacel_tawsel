// قاعدة البيانات لنظام التوصيل
console.log('📦 تحميل Firebase Database للتوصيل...');

// دالة الجلب - محدثة لنظام التوصيل
window.getProductsFromFirebase = async function() {
    console.log('🔄 محاولة جلب المنتجات من Firebase...');
    
    if (!window.db) {
        console.error('❌ قاعدة البيانات غير متاحة');
        return [];
    }
    
    try {
        const snapshot = await window.db.collection('products').orderBy('createdAt', 'desc').get();
        const products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({ 
                id: doc.id, 
                name: data.name || 'بدون اسم',
                price: data.price || 0,
                description: data.description || 'لا يوجد وصف',
                category: data.category || 'عام',
                image: data.image || 'https://via.placeholder.com/300x200/cccccc/ffffff?text=لا+توجد+صورة',
                purchaseLink: data.purchaseLink || '',
                restaurantId: data.restaurantId || '',
                restaurantName: data.restaurantName || '',
                dateAdded: data.dateAdded || new Date().toISOString(),
                createdAt: data.createdAt
            });
        });
        console.log('✅ تم جلب المنتجات بنجاح:', products.length);
        return products;
    } catch (error) {
        console.error('❌ فشل جلب المنتجات:', error);
        return [];
    }
}

// دالة الجلب للمطاعم
window.getRestaurantsFromFirebase = async function() {
    console.log('🔄 محاولة جلب المطاعم من Firebase...');
    
    if (!window.db) {
        console.error('❌ قاعدة البيانات غير متاحة');
        return [];
    }
    
    try {
        const snapshot = await window.db.collection('restaurants').orderBy('createdAt', 'desc').get();
        const restaurants = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            restaurants.push({ 
                id: doc.id, 
                name: data.name || 'مطعم بدون اسم',
                description: data.description || 'لا يوجد وصف',
                category: data.category || 'مطعم',
                image: data.image || 'https://via.placeholder.com/300x200/cccccc/ffffff?text=لا+توجد+صورة',
                rating: data.rating || '4.5',
                deliveryTime: data.deliveryTime || '30-45',
                deliveryFee: data.deliveryFee || 5,
                minOrder: data.minOrder || 20,
                isOpen: data.isOpen !== undefined ? data.isOpen : true,
                address: data.address || '',
                phone: data.phone || '',
                dateAdded: data.dateAdded || new Date().toISOString(),
                createdAt: data.createdAt
            });
        });
        console.log('✅ تم جلب المطاعم بنجاح:', restaurants.length);
        return restaurants;
    } catch (error) {
        console.error('❌ فشل جلب المطاعم:', error);
        return [];
    }
}

// دالة الإضافة للمطاعم
window.addRestaurantToFirebase = async function(restaurant) {
    if (!window.db) throw new Error('قاعدة البيانات غير متاحة');
    
    try {
        const docRef = await window.db.collection('restaurants').add({
            ...restaurant,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ تمت إضافة المطعم بنجاح:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ فشل إضافة المطعم:', error);
        throw error;
    }
}

// دالة الإضافة للمنتجات
window.addProductToFirebase = async function(product) {
    if (!window.db) throw new Error('قاعدة البيانات غير متاحة');
    
    try {
        const docRef = await window.db.collection('products').add({
            ...product,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ تمت الإضافة بنجاح:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ فشل الإضافة:', error);
        throw error;
    }
}

// دالة البحث
window.searchProducts = async function(searchTerm) {
    if (!window.db) return [];
    
    try {
        const snapshot = await window.db.collection('products').get();
        const products = [];
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            // البحث في الاسم والوصف والفئة
            if (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) {
                products.push(product);
            }
        });
        return products;
    } catch (error) {
        console.error('❌ فشل البحث:', error);
        return [];
    }
}

// دالة البحث في المطاعم
window.searchRestaurants = async function(searchTerm) {
    if (!window.db) return [];
    
    try {
        const snapshot = await window.db.collection('restaurants').get();
        const restaurants = [];
        snapshot.forEach(doc => {
            const restaurant = { id: doc.id, ...doc.data() };
            // البحث في الاسم والوصف والفئة
            if (restaurant.name && restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.category && restaurant.category.toLowerCase().includes(searchTerm.toLowerCase())) {
                restaurants.push(restaurant);
            }
        });
        return restaurants;
    } catch (error) {
        console.error('❌ فشل البحث في المطاعم:', error);
        return [];
    }
}

// دالة الحذف
window.deleteProductFromFirebase = async function(productId) {
    if (!window.db) throw new Error('قاعدة البيانات غير متاحة');
    
    try {
        await window.db.collection('products').doc(productId).delete();
        console.log('✅ تم الحذف بنجاح:', productId);
        return true;
    } catch (error) {
        console.error('❌ فشل الحذف:', error);
        throw error;
    }
}

// دالة حذف المطعم
window.deleteRestaurantFromFirebase = async function(restaurantId) {
    if (!window.db) throw new Error('قاعدة البيانات غير متاحة');
    
    try {
        await window.db.collection('restaurants').doc(restaurantId).delete();
        console.log('✅ تم حذف المطعم بنجاح:', restaurantId);
        return true;
    } catch (error) {
        console.error('❌ فشل حذف المطعم:', error);
        throw error;
    }
}

// دالة الاستماع للتحديثات
window.setupProductsListener = function(callback) {
    if (!window.db) {
        console.error('❌ قاعدة البيانات غير متاحة للاستماع');
        return;
    }
    
    return window.db.collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            callback(products);
        }, (error) => {
            console.error('❌ خطأ في الاستماع:', error);
        });
}

// دالة الاستماع لتحديثات المطاعم
window.setupRestaurantsListener = function(callback) {
    if (!window.db) {
        console.error('❌ قاعدة البيانات غير متاحة للاستماع');
        return;
    }
    
    return window.db.collection('restaurants')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            const restaurants = [];
            snapshot.forEach(doc => {
                restaurants.push({ id: doc.id, ...doc.data() });
            });
            callback(restaurants);
        }, (error) => {
            console.error('❌ خطأ في الاستماع للمطاعم:', error);
        });
}

// دالة إضافة طلب جديد
window.addOrderToFirebase = async function(order) {
    if (!window.db) throw new Error('قاعدة البيانات غير متاحة');
    
    try {
        const docRef = await window.db.collection('orders').add({
            ...order,
            orderNumber: generateOrderNumber(),
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ تمت إضافة الطلب بنجاح:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ فشل إضافة الطلب:', error);
        throw error;
    }
}

// دالة إنشاء رقم طلب عشوائي
function generateOrderNumber() {
    return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
}

// دالة الحصول على الطلبات
window.getOrdersFromFirebase = async function() {
    if (!window.db) return [];
    
    try {
        const snapshot = await window.db.collection('orders').orderBy('createdAt', 'desc').get();
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        console.log('✅ تم جلب الطلبات بنجاح:', orders.length);
        return orders;
    } catch (error) {
        console.error('❌ فشل جلب الطلبات:', error);
        return [];
    }
}
