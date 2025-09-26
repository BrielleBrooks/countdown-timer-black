document.addEventListener("DOMContentLoaded", function () {
  let countdowns = JSON.parse(localStorage.getItem("countdowns") || "[]");
  let current = 0;

  const display = document.getElementById("countdown-display");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  function renderCountdown() {
    let emoji = "⏳";
    let title = "No Countdown Yet";
    let datetime = new Date(Date.now() + 60000).toISOString();
    let valid = false;

    if (countdowns.length > 0 && countdowns[current]) {
      emoji = countdowns[current].emoji;
      title = countdowns[current].title;
      datetime = countdowns[current].datetime;
      valid = true;
    }

    const end = new Date(datetime);
    const now = new Date();
    const diff = end - now;

    let d = 0, h = 0, m = 0;

    if (valid && diff > 0) {
      d = Math.floor(diff / (1000 * 60 * 60 * 24));
      h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      m = Math.floor((diff / (1000 * 60)) % 60);
    }

 display.innerHTML = `
  <div class="countdown-container">
    <div class="countdown-emoji">${emoji}</div>
    <p class="countdown-title">${title}</p>
    <div class="countdown-time">
      <div class="time-block">
        <div class="time-value">${String(d).padStart(2, '0')}</div>
        <div class="time-label">Days</div>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <div class="time-value">${String(h).padStart(2, '0')}</div>
        <div class="time-label">Hours</div>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <div class="time-value">${String(m).padStart(2, '0')}</div>
        <div class="time-label">Minutes</div>
      </div>
    </div>
  </div>`;
  }

  function closeModal() {
    modal.classList.add("hidden");
    modalContent.innerHTML = "";
  }

  function renderTimerListView() {
    modalContent.innerHTML = `
      <h2>Timers</h2>
      <div id="timer-list"></div>
      <div class="modal-buttons">
        <button id="createNewBtn" style="background-color: white; color: black;">Create New Timer</button>
        <button id="closeModalBtn">Close</button>
      </div>
    `;

    const list = document.getElementById("timer-list");

    countdowns.forEach((timer, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "timer-entry";

      const label = document.createElement("div");
      label.className = "timer-label";
      label.textContent = `${timer.emoji} ${timer.title}`;
      label.onclick = () => {
        current = index;
        renderCountdown();
        closeModal();
      };

      const buttonRow = document.createElement("div");
      buttonRow.className = "timer-controls";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "mini-btn";
      editBtn.onclick = () => renderEditTimer(index);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "mini-btn";
      deleteBtn.onclick = () => {
  modalContent.innerHTML = `
    <h2>Confirm Delete</h2>
    <p>Are you sure you want to delete "${timer.title}"?</p>
    <div class="modal-buttons">
      <button id="confirmDeleteBtn" style="background-color: red; color: white;">Delete</button>
      <button id="cancelDeleteBtn">Cancel</button>
    </div>
  `;

  document.getElementById("confirmDeleteBtn").onclick = () => {
    countdowns.splice(index, 1);
    localStorage.setItem("countdowns", JSON.stringify(countdowns));
    current = 0;
    renderCountdown();
    renderTimerListView();
  };

  document.getElementById("cancelDeleteBtn").onclick = renderTimerListView;
};

      buttonRow.appendChild(editBtn);
      buttonRow.appendChild(deleteBtn);

      wrapper.appendChild(label);
      wrapper.appendChild(buttonRow);
      list.appendChild(wrapper);
    });

    document.getElementById("createNewBtn").onclick = renderNewTimerForm;
    document.getElementById("closeModalBtn").onclick = closeModal;
  }

  function renderNewTimerForm() {
    modalContent.innerHTML = `
      <h2>New Timer</h2>
      <label for="emojiInput">Emoji</label>
      <input type="text" id="emojiInput" maxlength="2" placeholder="🔥" />
      <label for="titleInput">Title</label>
      <input type="text" id="titleInput" placeholder="e.g., Vacation" />
      <label for="dateInput">Date</label>
      <input type="datetime-local" id="dateInput" />
      <div class="modal-buttons">
        <button id="saveTimerBtn" style="background-color: white; color: black;">Save</button>
        <button id="backBtn">Back</button>
      </div>
    `;

    document.getElementById("saveTimerBtn").onclick = () => {
      const emoji = document.getElementById("emojiInput").value || "⏳";
      const title = document.getElementById("titleInput").value || "New Timer";
      const datetime = document.getElementById("dateInput").value;

      if (!datetime) return alert("Please enter a date.");

      countdowns.push({ emoji, title, datetime });
      localStorage.setItem("countdowns", JSON.stringify(countdowns));
      current = countdowns.length - 1;
      renderCountdown();
      closeModal();
    };

    document.getElementById("backBtn").onclick = renderTimerListView;
  }

  function renderEditTimer(index) {
    const timer = countdowns[index];

    modalContent.innerHTML = `
      <h2>Edit Timer</h2>
      <label for="emojiInput">Emoji</label>
      <input type="text" id="emojiInput" value="${timer.emoji}" />
      <label for="titleInput">Title</label>
      <input type="text" id="titleInput" value="${timer.title}" />
      <label for="dateInput">Date</label>
      <input type="datetime-local" id="dateInput" value="${timer.datetime}" />
      <div class="modal-buttons">
        <button id="saveEditBtn" style="background-color: white; color: black;">Save</button>
        <button id="backBtn">Back</button>
      </div>
    `;

    document.getElementById("saveEditBtn").onclick = () => {
      const emoji = document.getElementById("emojiInput").value || "⏳";
      const title = document.getElementById("titleInput").value || "Untitled";
      const datetime = document.getElementById("dateInput").value;

      if (!datetime) return alert("Please enter a date.");

      countdowns[index] = { emoji, title, datetime };
      localStorage.setItem("countdowns", JSON.stringify(countdowns));
      current = index;
      renderCountdown();
      closeModal();
    };

    document.getElementById("backBtn").onclick = renderTimerListView;
  }

  document.getElementById("settings").onclick = () => {
    renderTimerListView();
    modal.classList.remove("hidden");
  };

  document.getElementById("next").onclick = () => {
    if (countdowns.length > 1) {
      current = (current + 1) % countdowns.length;
      renderCountdown();
    }
  };

  document.getElementById("prev").onclick = () => {
    if (countdowns.length > 1) {
      current = (current - 1 + countdowns.length) % countdowns.length;
      renderCountdown();
    }
  };

  setInterval(renderCountdown, 1000);
  renderCountdown();
});