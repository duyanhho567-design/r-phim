// ---------- Đăng nhập ----------
function doLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const result = loginAdmin(u, p);
    const alert = document.getElementById('loginAlert');

    if (result.success) {
        alert.className = 'alert alert-success show';
        alert.textContent = 'Đăng nhập thành công!';
        setTimeout(() => showAdmin(), 500);
    } else {
        alert.className = 'alert alert-error show';
        alert.textContent = result.message;
    }
}

function showAdmin() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    document.getElementById('adminName').textContent = 'admin';
    renderMovieTable();
}

// Nếu đã đăng nhập -> vào luôn
if (isAdminLoggedIn()) showAdmin();

// ---------- Chuyển tab ----------
function switchTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tabList').style.display = tab === 'list' ? 'block' : 'none';
    document.getElementById('tabAdd').style.display = tab === 'add' ? 'block' : 'none';
    if (tab === 'list') renderMovieTable();
}

// ---------- Lấy dữ liệu ----------
function getMovies() {
    return JSON.parse(localStorage.getItem('admin_movies') || '[]');
}
function saveMovies(list) {
    localStorage.setItem('admin_movies', JSON.stringify(list));
}

// ---------- Render bảng ----------
function renderMovieTable() {
    const list = getMovies();
    const tbody = document.getElementById('movieTableBody');
    tbody.innerHTML = '';
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:30px;">Chưa có phim nào</td></tr>';
        return;
    }
    list.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${m.poster}" onerror="this.src='https://via.placeholder.com/50x70?text=No'"></td>
            <td>${m.title}</td>
            <td>${m.year || '—'}</td>
            <td>${m.genre || '—'}</td>
            <td>★ ${m.rating || 'N/A'}</td>
            <td>
                <button class="btn-edit" onclick="editMovie('${m.id}')">Sửa</button>
                <button class="btn-danger" onclick="deleteMovie('${m.id}')">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ---------- Lưu phim ----------
function saveMovie() {
    const id = document.getElementById('editId').value;
    const title = document.getElementById('mTitle').value.trim();
    const poster = document.getElementById('mPoster').value.trim();

    if (!title || !poster) {
        showAlert('Vui lòng nhập tên phim và poster!', 'error');
        return;
    }

    const movie = {
        id: id || 'movie_' + Date.now(),
        title,
        year: document.getElementById('mYear').value,
        genre: document.getElementById('mGenre').value,
        rating: document.getElementById('mRating').value || 'N/A',
        poster,
        videoUrl: document.getElementById('mVideo').value,
        badge: document.getElementById('mBadge').value || 'HD',
        desc: document.getElementById('mDesc').value
    };

    const list = getMovies();
    if (id) {
        const idx = list.findIndex(m => m.id === id);
        if (idx > -1) list[idx] = movie;
    } else {
        list.push(movie);
    }
    saveMovies(list);

    showAlert(id ? 'Đã cập nhật phim!' : 'Đã thêm phim!', 'success');
    resetForm();
    renderMovieTable();
    switchTab('list');
    document.querySelectorAll('.admin-tab')[0].classList.add('active');
    document.querySelectorAll('.admin-tab')[1].classList.remove('active');
}

// ---------- Sửa ----------
function editMovie(id) {
    const m = getMovies().find(x => x.id === id);
    if (!m) return;
    document.getElementById('editId').value = m.id;
    document.getElementById('mTitle').value = m.title || '';
    document.getElementById('mYear').value = m.year || '';
    document.getElementById('mGenre').value = m.genre || '';
    document.getElementById('mRating').value = m.rating || '';
    document.getElementById('mPoster').value = m.poster || '';
    document.getElementById('mVideo').value = m.videoUrl || '';
    document.getElementById('mBadge').value = m.badge || '';
    document.getElementById('mDesc').value = m.desc || '';
    document.getElementById('formTitle').textContent = '✏️ Sửa Phim';
    document.querySelectorAll('.admin-tab')[1].click();
}

// ---------- Xóa ----------
function deleteMovie(id) {
    if (!confirm('Bạn có chắc muốn xóa phim này?')) return;
    saveMovies(getMovies().filter(m => m.id !== id));
    renderMovieTable();
    showAlert('Đã xóa phim!', 'success');
}

// ---------- Reset ----------
function resetForm() {
    ['editId','mTitle','mYear','mGenre','mRating','mPoster','mVideo','mBadge','mDesc']
        .forEach(id => document.getElementById(id).value = '');
    document.getElementById('formTitle').textContent = '➕ Thêm Phim Mới';
}

// ---------- Alert ----------
function showAlert(msg, type) {
    const a = document.getElementById('adminAlert');
    a.className = `alert alert-${type} show`;
    a.textContent = msg;
    setTimeout(() => a.classList.remove('show'), 3000);
}