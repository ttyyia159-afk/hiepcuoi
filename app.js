/**
 * MyFsend - Ứng dụng chia sẻ phai chạy trên nền tảng Firebase & Google Cloud
 * Tự động tải phai lên Cloud Storage và lưu thông tin vào Firestore Database.
 */

// Import các thư viện chính thức của Firebase từ Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =========================================================================
// 🔑 BƯỚC QUAN TRỌNG: DÁN CẤU HÌNH DỰ ÁN FIREBASE CỦA BẠN VÀO ĐÂY
// (Xem hướng dẫn chi tiết cách lấy mã này ở file HUONG_DAN_FIREBASE.md)
// =========================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Kiểm tra xem người dùng đã cấu hình Firebase chưa
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
if (!isConfigured) {
  const configWarning = document.getElementById("configWarning");
  if (configWarning) configWarning.classList.remove("hidden");
  console.warn("Chưa cấu hình Firebase! Hãy dán firebaseConfig vào file app.js");
}

let app, storage, db;
if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Lỗi khởi tạo Firebase:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra ID phai trên liên kết: #d=xyz hoặc ?d=xyz
  const fileId = getFileIdFromUrl();

  if (fileId) {
    // Chế độ: Người nhận (Receiver)
    initReceiver(fileId);
  } else {
    // Chế độ: Người gửi (Sender)
    initSender();
  }

  // ========================================================
  // 1. LOGIC DÀNH CHO NGƯỜI GỬI (SENDER)
  // ========================================================
  function initSender() {
    const senderSection = document.getElementById("senderSection");
    const receiverSection = document.getElementById("receiverSection");
    senderSection.classList.remove("hidden");
    receiverSection.classList.add("hidden");

    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const btnBrowseFile = document.getElementById("btnBrowseFile");
    const filePreview = document.getElementById("filePreview");
    const previewFileName = document.getElementById("previewFileName");
    const previewFileSize = document.getElementById("previewFileSize");
    const previewExtBadge = document.getElementById("previewExtBadge");
    const btnRemoveFile = document.getElementById("btnRemoveFile");

    const inputNote = document.getElementById("inputNote");
    const btnStartUpload = document.getElementById("btnStartUpload");

    const senderStepSelect = document.getElementById("senderStepSelect");
    const senderStepUploading = document.getElementById("senderStepUploading");
    const senderStepSuccess = document.getElementById("senderStepSuccess");

    const uploadProgressBar = document.getElementById("uploadProgressBar");
    const uploadProgressStats = document.getElementById("uploadProgressStats");
    const uploadProgressPercent = document.getElementById("uploadProgressPercent");

    const successFileName = document.getElementById("successFileName");
    const successFileSize = document.getElementById("successFileSize");
    const shareUrlInput = document.getElementById("shareUrlInput");
    const btnCopyShareUrl = document.getElementById("btnCopyShareUrl");
    const copyBtnText = document.getElementById("copyBtnText");
    const btnUploadAnother = document.getElementById("btnUploadAnother");

    let selectedFile = null;

    // Chọn phai
    btnBrowseFile.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
      }
    });

    ["dragenter", "dragover"].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setFile(e.dataTransfer.files[0]);
      }
    });

    function setFile(file) {
      selectedFile = file;
      previewFileName.textContent = file.name;
      previewFileSize.textContent = formatBytes(file.size);
      const ext = (file.name.split(".").pop() || "BIN").toUpperCase();
      previewExtBadge.textContent = ext.slice(0, 4);

      dropzone.classList.add("hidden");
      filePreview.classList.remove("hidden");
      btnStartUpload.disabled = false;
    }

    btnRemoveFile.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = "";
      filePreview.classList.add("hidden");
      dropzone.classList.remove("hidden");
      btnStartUpload.disabled = true;
    });

    // Bắt đầu tải phai lên máy chủ Google Cloud Storage
    btnStartUpload.addEventListener("click", async () => {
      if (!selectedFile) return;

      if (!isConfigured) {
        alert("Bạn chưa dán mã cấu hình Firebase vào file app.js! Vui lòng làm theo hướng dẫn trong file HUONG_DAN_FIREBASE.md trước khi tải phai nhé.");
        return;
      }

      senderStepSelect.classList.add("hidden");
      senderStepUploading.classList.remove("hidden");

      uploadProgressBar.style.width = "0%";
      uploadProgressPercent.textContent = "0%";
      uploadProgressStats.textContent = `0 MB / ${formatBytes(selectedFile.size)}`;

      // Tạo mã định danh duy nhất cho phai
      const newFileId = "fs-" + Math.random().toString(36).substring(2, 9);
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageRef = ref(storage, `uploads/${newFileId}/${cleanFileName}`);

      // Thực hiện upload lên Cloud Storage với thanh tiến trình
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          uploadProgressBar.style.width = progress + "%";
          uploadProgressPercent.textContent = progress + "%";
          uploadProgressStats.textContent = `${formatBytes(snapshot.bytesTransferred)} / ${formatBytes(snapshot.totalBytes)}`;
        },
        (error) => {
          console.error("Lỗi khi tải phai lên:", error);
          alert("Lỗi tải phai lên Firebase: " + error.message);
          senderStepUploading.classList.add("hidden");
          senderStepSelect.classList.remove("hidden");
        },
        async () => {
          // Khi tải lên Google Cloud thành công: Lấy link download trực tiếp
          try {
            const directDownloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Lưu thông tin tệp tin vào Firestore Database
            await setDoc(doc(db, "files", newFileId), {
              name: selectedFile.name,
              size: selectedFile.size,
              downloadUrl: directDownloadUrl,
              note: inputNote.value.trim(),
              createdAt: new Date().toISOString()
            });

            // Chuyển sang màn hình thành công
            senderStepUploading.classList.add("hidden");
            senderStepSuccess.classList.remove("hidden");

            successFileName.textContent = selectedFile.name;
            successFileSize.textContent = formatBytes(selectedFile.size);

            const baseUrl = window.location.href.split("#")[0].split("?")[0];
            const shareUrl = `${baseUrl}#d=${newFileId}`;
            shareUrlInput.value = shareUrl;

          } catch (err) {
            console.error("Lỗi lưu thông tin:", err);
            alert("Lỗi lưu thông tin phai: " + err.message);
            senderStepUploading.classList.add("hidden");
            senderStepSelect.classList.remove("hidden");
          }
        }
      );
    });

    // Nút Sao chép liên kết để gửi cho bạn bè (Không cần quét QR)
    btnCopyShareUrl.addEventListener("click", () => {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrlInput.value);
      } else {
        document.execCommand("copy");
      }
      btnCopyShareUrl.classList.add("copied");
      copyBtnText.textContent = "✓ ĐÃ SAO CHÉP LIÊN KẾT THÀNH CÔNG! HÃY DÁN ĐỂ GỬI";
      setTimeout(() => {
        btnCopyShareUrl.classList.remove("copied");
        copyBtnText.textContent = "SAO CHÉP LIÊN KẾT ĐỂ GỬI CHO BẠN BÈ";
      }, 2500);
    });

    btnUploadAnother.addEventListener("click", () => {
      selectedFile = null;
      fileInput.value = "";
      inputNote.value = "";
      filePreview.classList.add("hidden");
      dropzone.classList.remove("hidden");
      btnStartUpload.disabled = true;
      senderStepSuccess.classList.add("hidden");
      senderStepSelect.classList.remove("hidden");
    });
  }

  // ========================================================
  // 2. LOGIC DÀNH CHO NGƯỜI NHẬN (RECEIVER)
  // ========================================================
  async function initReceiver(fileId) {
    const senderSection = document.getElementById("senderSection");
    const receiverSection = document.getElementById("receiverSection");
    senderSection.classList.add("hidden");
    receiverSection.classList.remove("hidden");

    const receiverLoading = document.getElementById("receiverLoading");
    const receiverReady = document.getElementById("receiverReady");
    const receiverError = document.getElementById("receiverError");

    const rcFileIcon = document.getElementById("rcFileIcon");
    const rcFileName = document.getElementById("rcFileName");
    const rcFileSize = document.getElementById("rcFileSize");
    const rcNoteBox = document.getElementById("rcNoteBox");
    const rcNoteText = document.getElementById("rcNoteText");
    const btnDownloadFile = document.getElementById("btnDownloadFile");

    if (!isConfigured) {
      receiverLoading.classList.add("hidden");
      receiverError.classList.remove("hidden");
      return;
    }

    try {
      // Lấy thông tin phai từ Firestore Database
      const fileDoc = await getDoc(doc(db, "files", fileId));

      if (fileDoc.exists()) {
        const data = fileDoc.data();

        receiverLoading.classList.add("hidden");
        receiverReady.classList.remove("hidden");

        document.title = "Tải phai: " + data.name + " - MyFsend";
        // Hiển thị tên phai và dung lượng rõ ràng cho người nhận
        rcFileName.textContent = data.name;
        rcFileSize.textContent = "Dung lượng: " + formatBytes(data.size);

        const ext = (data.name.split(".").pop() || "").toUpperCase();
        rcFileIcon.textContent = getFileIconEmoji(ext);

        if (data.note) {
          rcNoteBox.classList.remove("hidden");
          rcNoteText.textContent = `“${data.note}”`;
        }

        // Gán link tải trực tiếp từ máy chủ Google Cloud
        btnDownloadFile.href = data.downloadUrl;
        btnDownloadFile.setAttribute("download", data.name);

      } else {
        receiverLoading.classList.add("hidden");
        receiverError.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin phai:", err);
      receiverLoading.classList.add("hidden");
      receiverError.classList.remove("hidden");
    }

    document.getElementById("btnRcHome").addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
      window.location.search = "";
      window.location.reload();
    });
  }

  // ========================================================
  // 3. TIỆN ÍCH DÙNG CHUNG
  // ========================================================
  function getFileIdFromUrl() {
    // 1. Kiểm tra hash: #d=xyz
    const hash = window.location.hash;
    if (hash && hash.includes("d=")) {
      const match = hash.match(/d=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    // 2. Kiểm tra query param: ?d=xyz
    const params = new URLSearchParams(window.location.search);
    return params.get("d") || "";
  }

  function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function getFileIconEmoji(ext) {
    switch (ext) {
      case "ZIP": case "RAR": case "7Z": case "TAR": case "GZ": return "📦";
      case "MP4": case "MKV": case "MOV": case "AVI": return "🎬";
      case "MP3": case "WAV": case "FLAC": return "🎵";
      case "PDF": return "📕";
      case "DOC": case "DOCX": return "📘";
      case "XLS": case "XLSX": return "📊";
      case "PPT": case "PPTX": return "📙";
      case "PNG": case "JPG": case "JPEG": case "GIF": return "🖼️";
      case "EXE": case "MSI": case "BAT": return "⚙️";
      default: return "📄";
    }
  }

  // Nút gửi phai mới trên header
  const btnNewShare = document.getElementById("btnNewShare");
  const logoReload = document.getElementById("logoReload");
  [btnNewShare, logoReload].forEach(el => {
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "";
        window.location.search = "";
        window.location.reload();
      });
    }
  });
});
