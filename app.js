// ==========================================
// CẤU HÌNH SUPABASE CHO WEB CHIA SẺ FILE (MISEND)
// ==========================================
const SUPABASE_URL = "https://pkogmtsykfgzipueydrq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_f7BzDwTanntw63fdjxqHMg_5nnsfU45";
const BUCKET_NAME = "files";

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');

const progressSection = document.getElementById('progressSection');
const uploadFileName = document.getElementById('uploadFileName');
const uploadFileSize = document.getElementById('uploadFileSize');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const uploadStatusText = document.getElementById('uploadStatusText');

const successSection = document.getElementById('successSection');
const successFileName = document.getElementById('successFileName');
const successFileSize = document.getElementById('successFileSize');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Format file size
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Show Toast
function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Drag & Drop events
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleUpload(files[0]);
    }
});

selectBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleUpload(e.target.files[0]);
    }
});

// Upload Function with Real Progress
function handleUpload(file) {
    if (!file) return;

    // Switch UI to Progress
    dropZone.classList.add('hidden');
    successSection.classList.add('hidden');
    progressSection.classList.remove('hidden');

    uploadFileName.textContent = file.name;
    uploadFileSize.textContent = formatBytes(file.size);
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    uploadStatusText.textContent = 'Đang bắt đầu tải lên máy chủ đám mây...';

    // Tạo mã định danh duy nhất cho file
    const uniqueId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const safeName = encodeURIComponent(file.name.replace(/[\/\\]/g, '_'));
    const objectPath = `${uniqueId}/${safeName}`;

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${objectPath}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    // Header xác thực với Supabase
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');

    // Theo dõi tiến trình tải lên thực tế (Real-time Progress)
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
            progressBar.style.width = percent + '%';
            progressPercent.textContent = percent + '%';
            uploadStatusText.textContent = `Đang tải lên: ${percent}% (${formatBytes(event.loaded)} / ${formatBytes(event.total)})`;
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';
            uploadStatusText.textContent = 'Hoàn tất tải lên!';

            // Tạo link tải công khai trực tiếp từ máy chủ đám mây Supabase
            const directPublicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${objectPath}`;

            let shareUrl = '';
            // Nếu đang chạy trên web (GitHub Pages, hosting...)
            if (window.location.protocol.startsWith('http')) {
                let baseUrl = window.location.href.split('?')[0];
                if (baseUrl.endsWith('index.html')) {
                    baseUrl = baseUrl.replace('index.html', 'download.html');
                } else if (baseUrl.endsWith('/')) {
                    baseUrl = baseUrl + 'download.html';
                } else {
                    baseUrl = baseUrl + '/download.html';
                }
                shareUrl = `${baseUrl}?url=${encodeURIComponent(directPublicUrl)}&name=${encodeURIComponent(file.name)}&size=${encodeURIComponent(formatBytes(file.size))}`;
            } else {
                // Nếu đang mở file trực tiếp trên máy (file:///)
                shareUrl = `${directPublicUrl}?download=${encodeURIComponent(file.name)}`;
            }

            setTimeout(() => {
                progressSection.classList.add('hidden');
                successSection.classList.remove('hidden');

                successFileName.textContent = file.name;
                successFileSize.textContent = formatBytes(file.size);
                shareLinkInput.value = shareUrl;
            }, 500);
        } else {
            console.error("Lỗi khi tải lên:", xhr.status, xhr.responseText);
            alert("Lỗi tải lên máy chủ: " + xhr.statusText);
            resetUI();
        }
    };

    xhr.onerror = () => {
        console.error("Lỗi kết nối mạng khi tải lên");
        alert("Lỗi kết nối mạng đến máy chủ lưu trữ. Vui lòng kiểm tra lại kết nối internet.");
        resetUI();
    };

    // Gửi file
    xhr.send(file);
}

// Copy Link Button
copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); // Mobile
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
        showToast("Đã sao chép liên kết vào bộ nhớ tạm!");
    }).catch(() => {
        document.execCommand('copy');
        showToast("Đã sao chép liên kết!");
    });
});

// Upload another button
uploadAnotherBtn.addEventListener('click', () => {
    resetUI();
});

function resetUI() {
    fileInput.value = '';
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    progressSection.classList.add('hidden');
    successSection.classList.add('hidden');
    dropZone.classList.remove('hidden');
}
