// ====================================================
// TÀI KHOẢN ADMIN MẶC ĐỊNH
// Username: admin
// Password: admin123
// ====================================================

const ADMIN_DEFAULT = {
    username: 'admin',
    password: 'admin123'   // ⚠️ Trong thực tế phải hash, đây chỉ là demo
};

// Tạo tài khoản mặc định nếu chưa có
function initAdmin() {
    const stored = localStorage.getItem('admin_account');
    if (!stored) {
        localStorage.setItem('admin_account', JSON.stringify(ADMIN_DEFAULT));
    }
}

// Kiểm tra đăng nhập
function loginAdmin(username, password) {
    const stored = JSON.parse(localStorage.getItem('admin_account') || '{}');
    if (username === stored.username && password === stored.password) {
        sessionStorage.setItem('admin_logged', 'true');
        return { success: true };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('admin_logged') === 'true';
}

function logoutAdmin() {
    sessionStorage.removeItem('admin_logged');
    window.location.href = 'admin.html';
}

// Khởi tạo
initAdmin();