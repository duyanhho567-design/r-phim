// ====================================================
// CẤU HÌNH TMDB API
// Đăng ký miễn phí: https://www.themoviedb.org/settings/api
// ====================================================
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // ⚠️ Thay bằng key của bạn
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentQuery = '';

// ---------- Dữ liệu phim admin (localStorage) ----------
function getAdminMovies() {
    return JSON.parse(localStorage.getItem('admin_movies') || '[]');
}

// ---------- Tải phim phổ biến từ TMDB ----------
async function loadMovies(page = 1) {
    const grid = document.getElementById('movieGrid');
    if (page === 1) grid.innerHTML = '<p style="color:#999;grid-column:1/-1;">Đang tải...</p>';

    try {
        const url = currentQuery
            ? `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=vi&query=${encodeURIComponent(currentQuery)}&page=${page}`
            : `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=vi&page=${page}`;

        const res = await fetch(url);
        const data = await res.json();

        if (page === 1) grid.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            grid.innerHTML = '<p style="color:#999;grid-column:1/-1;">Không tìm thấy phim 😢</p>';
            return;
        }

        data.results.forEach(movie => {
            const card = createMovieCard({
                id: movie.id,
                title: movie.title || movie.original_title,
                year: (movie.release_date || '').slice(0, 4),
                rating: movie.vote_average?.toFixed(1) || 'N/A',
                poster: movie.poster_path ? TMDB_IMG + movie.poster_path : 'https://via.placeholder.com/400x600?text=No+Image',
                desc: movie.overview || 'Chưa có mô tả.',
                genre: 'TMDB',
                badge: 'TMDB',
                videoUrl: '' // sẽ lấy trailer khi click
            });
            grid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="color:#e94560;grid-column:1/-1;">Lỗi kết nối TMDB. Kiểm tra API key!</p>';
    }
}

// ---------- Tạo card ----------
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
            <span class="badge">${movie.badge || 'HD'}</span>
        </div>
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <div class="meta">
                <span>${movie.year || '—'}</span>
                <span class="rating">★ ${movie.rating}</span>
            </div>
        </div>
    `;
    card.onclick = () => openModal(movie);
    return card;
}

// ---------- Tải phim admin ----------
function loadAdminMovies() {
    const grid = document.getElementById('adminMovieGrid');
    const list = getAdminMovies();
    grid.innerHTML = '';
    if (list.length === 0) {
        grid.innerHTML = '<p style="color:#999;grid-column:1/-1;">Chưa có phim nào. Vào trang Admin để thêm!</p>';
        return;
    }
    list.forEach(m => grid.appendChild(createMovieCard(m)));
}

// ---------- Tìm kiếm ----------
function handleSearch(e) {
    if (e.key === 'Enter') searchMovies();
}
function searchMovies() {
    currentQuery = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    loadMovies(1);
}
function loadMore() {
    currentPage++;
    loadMovies(currentPage);
}

// ---------- Modal + YouTube iframe ----------
async function openModal(movie) {
    document.getElementById('modalTitle').textContent = movie.title;
    document.getElementById('modalDesc').textContent = movie.desc || '';
    document.getElementById('modalGenre').textContent = movie.genre || '—';
    document.getElementById('modalYear').textContent = movie.year || '—';
    document.getElementById('modalRating').textContent = '★ ' + (movie.rating || 'N/A');

    const player = document.getElementById('playerContainer');
    player.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Đang tải video...</p>';

    // Nếu admin nhập link YouTube trực tiếp
    if (movie.videoUrl) {
        const videoId = extractYouTubeId(movie.videoUrl);
        if (videoId) {
            player.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        } else {
            player.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Link video không hợp lệ.</p>';
        }
    } 
    // Nếu phim TMDB -> lấy trailer
    else if (movie.id && TMDB_API_KEY !== 'YOUR_TMDB_API_KEY') {
        try {
            const res = await fetch(`${TMDB_BASE}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
            const data = await res.json();
            const trailer = data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') 
                         || data.results?.find(v => v.site === 'YouTube');
            if (trailer) {
                player.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
                player.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Không có trailer cho phim này.</p>';
            }
        } catch {
            player.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Không tải được trailer.</p>';
        }
    } else {
        player.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Chưa có video.</p>';
    }

    document.getElementById('movieModal').classList.add('active');
}

function closeModal() {
    document.getElementById('movieModal').classList.remove('active');
    document.getElementById('playerContainer').innerHTML = ''; // dừng video
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

document.getElementById('movieModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ---------- Khởi động ----------
loadMovies(1);
loadAdminMovies();