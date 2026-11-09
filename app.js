/**
 * MyFsend P2P - JavaScript truyền file trực tiếp qua WebRTC (DataChannel)
 * Tương thích 100% với Web tĩnh GitHub Pages.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Config STUN server công khai của Google (miễn phí, không cần đăng ký)
  const peerConfig = {
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    }
  };

  const CHUNK_SIZE = 64 * 1024; // 64 KB mỗi mảnh dữ liệu

  // Kiểm tra Room ID trên URL: #room=xyz hoặc ?room=xyz
  let targetRoomId = getRoomIdFromUrl();

  if (targetRoomId) {
    // Chế độ: Người nhận (Receiver)
    initReceiver(targetRoomId);
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

    const inputPassword = document.getElementById("inputPassword");
    const inputNote = document.getElementById("inputNote");
    const btnStartShare = document.getElementById("btnStartShare");

    const senderStepSelect = document.getElementById("senderStepSelect");
    const senderStepActive = document.getElementById("senderStepActive");
    const senderStatusPill = document.getElementById("senderStatusPill");
    const senderStatusText = document.getElementById("senderStatusText");

    const shareUrlInput = document.getElementById("shareUrlInput");
    const btnCopyShareUrl = document.getElementById("btnCopyShareUrl");
    const copyBtnText = document.getElementById("copyBtnText");
    const qrContainer = document.getElementById("qrContainer");

    const senderProgressCard = document.getElementById("senderProgressCard");
    const senderProgressTitle = document.getElementById("senderProgressTitle");
    const senderProgressPercent = document.getElementById("senderProgressPercent");
    const senderProgressBar = document.getElementById("senderProgressBar");
    const senderProgressStats = document.getElementById("senderProgressStats");
    const senderSpeedStats = document.getElementById("senderSpeedStats");

    let selectedFile = null;
    let senderPeer = null;

    // Chọn file
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
      btnStartShare.disabled = false;
    }

    btnRemoveFile.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = "";
      filePreview.classList.add("hidden");
      dropzone.classList.remove("hidden");
      btnStartShare.disabled = true;
    });

    // Bắt đầu tạo kết nối chia sẻ
    btnStartShare.addEventListener("click", () => {
      if (!selectedFile) return;

      btnStartShare.disabled = true;
      btnStartShare.textContent = "Đang khởi tạo kết nối P2P...";

      const customRoomId = "fsend-" + Math.random().toString(36).substring(2, 9);
      senderPeer = new Peer(customRoomId, peerConfig);

      senderPeer.on("open", (id) => {
        senderStepSelect.classList.add("hidden");
        senderStepActive.classList.remove("hidden");

        const baseUrl = window.location.href.split("#")[0].split("?")[0];
        const shareUrl = `${baseUrl}#room=${id}`;
        shareUrlInput.value = shareUrl;

        // Tạo mã QR Code
        qrContainer.innerHTML = "";
        if (window.QRCode && window.QRCode.generateCanvas) {
          try {
            const canvas = window.QRCode.generateCanvas(shareUrl, 160);
            qrContainer.appendChild(canvas);
          } catch (err) {
            console.error("QR Error:", err);
          }
        }
      });

      senderPeer.on("error", (err) => {
        alert("Lỗi kết nối WebRTC: " + err.message);
        btnStartShare.disabled = false;
        btnStartShare.textContent = "TẠO LINK CHIA SẺ TRỰC TIẾP 🚀";
      });

      // Lắng nghe kết nối từ người nhận
      senderPeer.on("connection", (conn) => {
        conn.on("open", () => {
          senderStatusPill.classList.add("status-connected");
          senderStatusText.textContent = "⚡ Người nhận đã kết nối! Đang chuẩn bị truyền file...";

          // Gửi thông tin file cho người nhận
          conn.send({
            type: "metadata",
            name: selectedFile.name,
            size: selectedFile.size,
            hasPassword: !!inputPassword.value.trim(),
            note: inputNote.value.trim()
          });
        });

        // Xử lý tín hiệu từ người nhận
        conn.on("data", (msg) => {
          if (!msg) return;

          if (msg.type === "verify-password") {
            const correctPass = inputPassword.value.trim();
            if (msg.password === correctPass) {
              conn.send({ type: "password-result", success: true });
            } else {
              conn.send({ type: "password-result", success: false });
            }
          } else if (msg.type === "start-download") {
            // Bắt đầu truyền file theo từng mảnh
            sendFileData(conn, selectedFile);
          }
        });

        conn.on("close", () => {
          senderStatusPill.classList.remove("status-connected");
          senderStatusText.textContent = "Đang chờ người nhận mở link...";
        });
      });
    });

    // Hàm đọc và truyền dữ liệu theo chunk để không tràn bộ nhớ
    function sendFileData(conn, file) {
      senderProgressCard.classList.remove("hidden");
      senderProgressTitle.textContent = "Đang truyền tệp tin sang người nhận...";

      let offset = 0;
      const totalSize = file.size;
      const startTime = Date.now();
      let lastTime = startTime;
      let lastLoaded = 0;

      function readNextChunk() {
        if (offset >= totalSize) {
          conn.send({ type: "complete" });
          senderProgressPercent.textContent = "100%";
          senderProgressBar.style.width = "100%";
          senderProgressTitle.textContent = "✓ Đã gửi tệp tin thành công!";
          return;
        }

        // Kiểm tra buffer của WebRTC DataChannel để không bị nghẽn
        if (conn.dataChannel && conn.dataChannel.bufferedAmount > 1024 * 512) {
          setTimeout(readNextChunk, 50);
          return;
        }

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const reader = new FileReader();

        reader.onload = (e) => {
          conn.send({
            type: "chunk",
            data: e.target.result,
            offset: offset,
            total: totalSize
          });

          offset += e.target.result.byteLength;

          // Cập nhật tiến trình trên giao diện người gửi
          const percent = Math.min(100, Math.round((offset / totalSize) * 100));
          senderProgressPercent.textContent = percent + "%";
          senderProgressBar.style.width = percent + "%";
          senderProgressStats.textContent = `${formatBytes(offset)} / ${formatBytes(totalSize)}`;

          const now = Date.now();
          const duration = (now - lastTime) / 1000;
          if (duration >= 0.5) {
            const bytesDiff = offset - lastLoaded;
            const speed = bytesDiff / duration;
            senderSpeedStats.textContent = formatBytes(speed) + "/s";
            lastLoaded = offset;
            lastTime = now;
          }

          readNextChunk();
        };

        reader.readAsArrayBuffer(slice);
      }

      readNextChunk();
    }

    // Sao chép link
    btnCopyShareUrl.addEventListener("click", () => {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrlInput.value);
      } else {
        document.execCommand("copy");
      }
      btnCopyShareUrl.classList.add("copied");
      copyBtnText.textContent = "Đã Chép! ✓";
      setTimeout(() => {
        btnCopyShareUrl.classList.remove("copied");
        copyBtnText.textContent = "Sao Chép";
      }, 2000);
    });
  }

  // ========================================================
  // 2. LOGIC DÀNH CHO NGƯỜI NHẬN (RECEIVER)
  // ========================================================
  function initReceiver(roomId) {
    const senderSection = document.getElementById("senderSection");
    const receiverSection = document.getElementById("receiverSection");
    senderSection.classList.add("hidden");
    receiverSection.classList.remove("hidden");

    const receiverConnecting = document.getElementById("receiverConnecting");
    const receiverReady = document.getElementById("receiverReady");
    const receiverError = document.getElementById("receiverError");

    const rcFileIcon = document.getElementById("rcFileIcon");
    const rcFileName = document.getElementById("rcFileName");
    const rcFileSize = document.getElementById("rcFileSize");
    const rcNoteBox = document.getElementById("rcNoteBox");
    const rcNoteText = document.getElementById("rcNoteText");

    const rcPasswordBox = document.getElementById("rcPasswordBox");
    const rcInputPassword = document.getElementById("rcInputPassword");
    const rcPassError = document.getElementById("rcPassError");
    const btnReceiverDownload = document.getElementById("btnReceiverDownload");

    const receiverProgressCard = document.getElementById("receiverProgressCard");
    const rcProgressTitle = document.getElementById("rcProgressTitle");
    const rcProgressPercent = document.getElementById("rcProgressPercent");
    const rcProgressBar = document.getElementById("rcProgressBar");
    const rcProgressStats = document.getElementById("rcProgressStats");
    const rcSpeedStats = document.getElementById("rcSpeedStats");

    let receiverPeer = new Peer(peerConfig);
    let connection = null;
    let fileMeta = null;
    let receivedChunks = [];
    let receivedBytes = 0;
    let lastTime = Date.now();
    let lastLoaded = 0;

    receiverPeer.on("open", () => {
      // Kết nối tới Peer ID của người gửi
      connection = receiverPeer.connect(roomId, { reliable: true });

      connection.on("open", () => {
        // Đã kết nối xong với người gửi, chờ nhận thông tin file
      });

      connection.on("data", (msg) => {
        if (!msg) return;

        if (msg.type === "metadata") {
          fileMeta = msg;
          renderReceiverMeta(msg);
        } else if (msg.type === "password-result") {
          if (msg.success) {
            rcPassError.style.display = "none";
            startDownloading();
          } else {
            rcPassError.style.display = "block";
            btnReceiverDownload.disabled = false;
            btnReceiverDownload.textContent = "TẢI XUỐNG TỆP TIN 📥";
          }
        } else if (msg.type === "chunk") {
          // Nhận 1 mảnh dữ liệu
          receivedChunks.push(msg.data);
          receivedBytes += msg.data.byteLength;

          const total = msg.total;
          const percent = Math.min(100, Math.round((receivedBytes / total) * 100));
          rcProgressPercent.textContent = percent + "%";
          rcProgressBar.style.width = percent + "%";
          rcProgressStats.textContent = `${formatBytes(receivedBytes)} / ${formatBytes(total)}`;

          const now = Date.now();
          const duration = (now - lastTime) / 1000;
          if (duration >= 0.5) {
            const speed = (receivedBytes - lastLoaded) / duration;
            rcSpeedStats.textContent = formatBytes(speed) + "/s";
            lastLoaded = receivedBytes;
            lastTime = now;
          }
        } else if (msg.type === "complete") {
          // Hoàn tất tải!
          rcProgressTitle.textContent = "✓ Tải file hoàn tất!";
          rcProgressPercent.textContent = "100%";
          rcProgressBar.style.width = "100%";

          // Ghép các chunk thành Blob và kích hoạt tải về máy
          const blob = new Blob(receivedChunks);
          const dlUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = dlUrl;
          a.download = fileMeta.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          btnReceiverDownload.textContent = "✓ ĐÃ LƯU TỆP TIN XUỐNG MÁY";
          btnReceiverDownload.style.background = "var(--success)";
        }
      });

      connection.on("close", () => {
        if (receivedBytes < (fileMeta ? fileMeta.size : 1)) {
          showReceiverError("Mất Kết Nối", "Người gửi đã đóng trang web hoặc kết nối mạng bị gián đoạn.");
        }
      });

      connection.on("error", (err) => {
        showReceiverError("Lỗi Kết Nối", err.message);
      });
    });

    receiverPeer.on("error", (err) => {
      showReceiverError("Không Tìm Thấy Người Gửi", "Mã phòng không tồn tại hoặc người gửi đã tắt máy.");
    });

    function renderReceiverMeta(meta) {
      receiverConnecting.classList.add("hidden");
      receiverReady.classList.remove("hidden");

      rcFileName.textContent = meta.name;
      rcFileSize.textContent = formatBytes(meta.size);
      const ext = (meta.name.split(".").pop() || "").toUpperCase();
      rcFileIcon.textContent = getFileIconEmoji(ext);

      if (meta.note) {
        rcNoteBox.classList.remove("hidden");
        rcNoteText.textContent = `“${meta.note}”`;
      }

      if (meta.hasPassword) {
        rcPasswordBox.classList.remove("hidden");
      }
    }

    btnReceiverDownload.addEventListener("click", () => {
      if (!connection) return;

      btnReceiverDownload.disabled = true;
      btnReceiverDownload.textContent = "Đang chuẩn bị tải...";

      if (fileMeta && fileMeta.hasPassword) {
        const pass = rcInputPassword.value.trim();
        if (!pass) {
          rcPassError.textContent = "Vui lòng nhập mật khẩu!";
          rcPassError.style.display = "block";
          btnReceiverDownload.disabled = false;
          btnReceiverDownload.textContent = "TẢI XUỐNG TỆP TIN 📥";
          return;
        }
        // Gửi xác thực pass cho người gửi
        connection.send({ type: "verify-password", password: pass });
      } else {
        startDownloading();
      }
    });

    function startDownloading() {
      receiverProgressCard.classList.remove("hidden");
      rcProgressTitle.textContent = "Đang nhận tệp tin từ người gửi...";
      receivedChunks = [];
      receivedBytes = 0;
      lastTime = Date.now();
      lastLoaded = 0;

      // Báo người gửi bắt đầu đẩy dữ liệu
      connection.send({ type: "start-download" });
    }

    function showReceiverError(title, desc) {
      receiverConnecting.classList.add("hidden");
      receiverReady.classList.add("hidden");
      receiverError.classList.remove("hidden");
      document.getElementById("rcErrorTitle").textContent = title;
      document.getElementById("rcErrorDesc").textContent = desc;
    }

    document.getElementById("btnRcHome").addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
      window.location.reload();
    });
  }

  // ========================================================
  // 3. TIỆN ÍCH DÙNG CHUNG
  // ========================================================
  function getRoomIdFromUrl() {
    // 1. Kiểm tra hash: #room=xyz
    const hash = window.location.hash;
    if (hash && hash.includes("room=")) {
      const match = hash.match(/room=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    // 2. Kiểm tra query param: ?room=xyz
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "";
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

  // Nút gửi tệp mới trên header
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
