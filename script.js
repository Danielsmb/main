// ============================================
// MODAL + COPY
// ============================================
let currentImageUrl = '';
let currentImageTitle = '';

function openImageModal(imageUrl, title) {
    currentImageUrl = imageUrl;
    currentImageTitle = title;

    var modal = document.getElementById('imageModal');
    var modalImage = document.getElementById('modalImage');
    var modalTitle = document.getElementById('modalTitle');
    var downloadBtn = document.getElementById('downloadBtn');

    if (modal && modalImage && modalTitle) {
        modalImage.src = imageUrl;
        modalTitle.textContent = title;
        modal.classList.add('active');

        if (downloadBtn) {
            downloadBtn.href = imageUrl;
            downloadBtn.download = title.replace(/\s+/g, '_') + '.jpg';
        }

        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    var modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function copyImage() {
    if (!currentImageUrl) {
        showToast('Tidak ada gambar untuk di-copy!', 'error');
        return;
    }

    var copyBtn = document.getElementById('copyBtn');
    var originalHTML = copyBtn ? copyBtn.innerHTML : '';

    try {
        var response = await fetch(currentImageUrl);
        if (!response.ok) throw new Error('Gagal memuat gambar');

        var blob = await response.blob();

        if (navigator.clipboard && window.ClipboardItem) {
            var clipboardItem = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([clipboardItem]);

            if (copyBtn) {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Berhasil Disalin!</span>';

                setTimeout(function() {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = originalHTML;
                }, 2500);
            }

            showToast('✅ Gambar berhasil di-copy!', 'success');
        } else {
            throw new Error('Clipboard API tidak didukung');
        }
    } catch (error) {
        console.error('Copy error:', error);
        showToast('⚠️ Buka gambar di tab baru untuk copy manual', 'error');
        setTimeout(function() { window.open(currentImageUrl, '_blank'); }, 1200);
    }
}

function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';

    setTimeout(function() { toast.classList.remove('show'); }, 3500);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    var sidebarToggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        var overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // ESC tutup modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeImageModal();
    });

    // Deteksi IP
    fetch('https://api.ipify.org?format=json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var el = document.getElementById('ip-address');
            if (el) el.textContent = data.ip;
        })
        .catch(function() {
            var el = document.getElementById('ip-address');
            if (el) el.textContent = 'Gagal mendeteksi';
        });

    // Staggered card reveal pakai IntersectionObserver
    var items = document.querySelectorAll('.gallery-item');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(function(item) {
            item.style.animationPlayState = 'paused';
            observer.observe(item);
        });
    } else {
        // Fallback: langsung tampilkan semua
        items.forEach(function(item) {
            item.style.opacity = '1';
            item.style.transform = 'none';
        });
    }
});