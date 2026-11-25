/* ==================== INITIALIZATION & STORAGE KEYS ==================== */
const STORAGE_KEYS = {
  USERS: 'hms_users',
  SESSION: 'hms_active_session',
  PATIENTS: 'hms_patients',
  DOCTORS: 'hms_doctors',
  APPOINTMENTS: 'hms_appointments',
  TIMING: 'hms_timing'
};

// Seed default data if localStorage is empty
function initializeDefaultData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        fullName: 'System Administrator',
        role: 'Hospital Administrator',
        username: 'admin',
        password: 'admin123'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const samplePatients = [
      { id: 'PT-1001', name: 'Aarav Patel', age: 34, gender: 'Male', blood: 'O+', phone: '9876543210', disease: 'Viral Fever & Fatigue' },
      { id: 'PT-1002', name: 'Priya Nair', age: 28, gender: 'Female', blood: 'A+', phone: '9823456781', disease: 'Migraine Consultation' },
      { id: 'PT-1003', name: 'Rohan Deshmukh', age: 52, gender: 'Male', blood: 'B+', phone: '9765432109', disease: 'Hypertension Checkup' }
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(samplePatients));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    const sampleDoctors = [
      { id: 'DR-101', name: 'Dr. Siddharth Verma', specialization: 'Cardiologist', phone: '9811122233', availability: 'Available' },
      { id: 'DR-102', name: 'Dr. Meera Kulkarni', specialization: 'General Physician', phone: '9822233344', availability: 'Available' },
      { id: 'DR-103', name: 'Dr. Kabir Malhotra', specialization: 'Orthopedic', phone: '9833344455', availability: 'In Surgery' }
    ];
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(sampleDoctors));
  }

  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    const today = new Date().toISOString().split('T')[0];
    const sampleAppointments = [
      { id: 'AP-501', patientId: 'PT-1001', patientName: 'Aarav Patel', doctorId: 'DR-102', doctorName: 'Dr. Meera Kulkarni', date: today, time: '10:30', status: 'Scheduled', notes: 'Routine follow-up' },
      { id: 'AP-502', patientId: 'PT-1003', patientName: 'Rohan Deshmukh', doctorId: 'DR-101', doctorName: 'Dr. Siddharth Verma', date: today, time: '14:15', status: 'Scheduled', notes: 'ECG & BP review' }
    ];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(sampleAppointments));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TIMING)) {
    localStorage.setItem(STORAGE_KEYS.TIMING, JSON.stringify({ openTime: '08:00', closeTime: '21:00' }));
  }
}

/* ==================== HELPER FUNCTIONS ==================== */
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function formatTime12Hour(time24) {
  if (!time24) return '';
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
}

/* ==================== AUTHENTICATION & SIGN UP ==================== */
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');

// Toggle between Login and Create Account tabs
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// Handle New Account Creation
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const role = document.getElementById('regRole').value;
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return;
  }

  const users = getData(STORAGE_KEYS.USERS);
  if (users.some((u) => u.username.toLowerCase() === username)) {
    showToast('Username already exists. Choose another.', 'error');
    return;
  }

  const newUser = { fullName, role, username, password };
  users.push(newUser);
  setData(STORAGE_KEYS.USERS, users);

  registerForm.reset();
  showToast('Account created successfully! Please sign in.', 'success');
  tabLogin.click();
  document.getElementById('loginUsername').value = username;
});

// Handle Admin Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const users = getData(STORAGE_KEYS.USERS);
  const matchedUser = users.find(
    (u) => u.username.toLowerCase() === username && u.password === password
  );

  if (!matchedUser) {
    showToast('Invalid username or password!', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(matchedUser));
  showToast(`Welcome back, ${matchedUser.fullName}!`, 'success');
  loadApp(matchedUser);
});

// Handle Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  appSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  loginForm.reset();
  showToast('Logged out securely.', 'success');
});

function loadApp(user) {
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  document.getElementById('currentUserName').textContent = user.fullName;
  document.getElementById('currentUserRole').textContent = user.role;
  refreshAllViews();
}

/* ==================== NAVIGATION & RESPONSIVE SIDEBAR ==================== */
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const viewTitles = {
  dashboardView: 'Dashboard Overview',
  patientsView: 'Patient Management',
  doctorsView: 'Doctor Management',
  appointmentsView: 'Appointment Scheduling',
  timingView: 'Hospital Timing & Status'
};

function switchView(targetId) {
  navItems.forEach((btn) => btn.classList.toggle('active', btn.dataset.target === targetId));
  viewSections.forEach((sec) => sec.classList.toggle('active', sec.id === targetId));
  pageTitle.textContent = viewTitles[targetId] || 'Dashboard';
  closeMobileSidebar();
  refreshAllViews();
}

navItems.forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.target));
});

function closeMobileSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

document.getElementById('openSidebar').addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
});
document.getElementById('closeSidebar').addEventListener('click', closeMobileSidebar);
sidebarOverlay.addEventListener('click', closeMobileSidebar);

/* ==================== LIVE CLOCK & HOSPITAL TIMING ==================== */
function updateClockAndStatus() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('liveTime').textContent = timeString;
  document.getElementById('liveDate').textContent = dateString;
  document.getElementById('timingBigClock').textContent = timeString;
  document.getElementById('timingBigDate').textContent = dateString;

  const timing = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMING)) || { openTime: '08:00', closeTime: '21:00' };
  const [openH, openM] = timing.openTime.split(':').map(Number);
  const [closeH, closeM] = timing.closeTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  // Header status badge
  const headerPill = document.getElementById('headerHospitalStatus');
  const headerText = document.getElementById('headerStatusText');
  headerPill.classList.toggle('closed', !isOpen);
  headerText.textContent = isOpen ? 'Hospital Open' : 'Hospital Closed';

  // Dashboard stat card
  document.getElementById('statHospitalStatus').textContent = isOpen ? 'OPEN' : 'CLOSED';
  document.getElementById('statHospitalHours').textContent = `${formatTime12Hour(timing.openTime)} – ${formatTime12Hour(timing.closeTime)}`;

  // Timing page display
  const bigBadge = document.getElementById('timingBigBadge');
  bigBadge.textContent = isOpen ? 'OPEN NOW' : 'CLOSED NOW';
  bigBadge.classList.toggle('closed', !isOpen);
  document.getElementById('displayOpenTime').textContent = formatTime12Hour(timing.openTime);
  document.getElementById('displayCloseTime').textContent = formatTime12Hour(timing.closeTime);
}

document.getElementById('timingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const openTime = document.getElementById('openTimeInput').value;
  const closeTime = document.getElementById('closeTimeInput').value;

  if (openTime >= closeTime) {
    showToast('Closing time must be later than opening time!', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.TIMING, JSON.stringify({ openTime, closeTime }));
  updateClockAndStatus();
  showToast('Hospital operating hours updated!', 'success');
});

/* ==================== PATIENT MANAGEMENT ==================== */
const patientForm = document.getElementById('patientForm');

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idInput = document.getElementById('patientId').value;
  const name = document.getElementById('patientName').value.trim();
  const age = document.getElementById('patientAge').value;
  const gender = document.getElementById('patientGender').value;
  const blood = document.getElementById('patientBlood').value;
  const phone = document.getElementById('patientPhone').value.trim();
  const disease = document.getElementById('patientDisease').value.trim();

  let patients = getData(STORAGE_KEYS.PATIENTS);

  if (idInput) {
    patients = patients.map((p) => (p.id === idInput ? { id: idInput, name, age, gender, blood, phone, disease } : p));
    showToast('Patient record updated!', 'success');
  } else {
    const newId = 'PT-' + Math.floor(1000 + Math.random() * 9000);
    patients.unshift({ id: newId, name, age, gender, blood, phone, disease });
    showToast('New patient registered!', 'success');
  }

  setData(STORAGE_KEYS.PATIENTS, patients);
  resetPatientForm();
  refreshAllViews();
});

function renderPatients() {
  const patients = getData(STORAGE_KEYS.PATIENTS);
  const query = document.getElementById('patientSearch').value.toLowerCase();
  const genderFilter = document.getElementById('patientGenderFilter').value;

  const filtered = patients.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.disease.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query);
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchesQuery && matchesGender;
  });

  const tbody = document.getElementById('patientsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;">No patient records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (p) => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.age} yrs / ${p.gender}</td>
      <td><span class="badge badge-blue">${p.blood}</span></td>
      <td>${p.phone}</td>
      <td>${p.disease}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" title="View Details" onclick="viewPatient('${p.id}')"><i class="fa-solid fa-eye"></i></button>
          <button class="action-btn edit" title="Edit" onclick="editPatient('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" title="Delete" onclick="deletePatient('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`
    )
    .join('');
}

window.viewPatient = (id) => {
  const p = getData(STORAGE_KEYS.PATIENTS).find((item) => item.id === id);
  if (!p) return;
  document.getElementById('patientModalBody').innerHTML = `
    <p><span>Patient ID:</span> <strong>${p.id}</strong></p>
    <p><span>Full Name:</span> <strong>${p.name}</strong></p>
    <p><span>Age &amp; Gender:</span> <strong>${p.age} Years (${p.gender})</strong></p>
    <p><span>Blood Group:</span> <strong>${p.blood}</strong></p>
    <p><span>Contact Number:</span> <strong>${p.phone}</strong></p>
    <p><span>Diagnosis / Notes:</span> <strong>${p.disease}</strong></p>
  `;
  document.getElementById('patientModal').classList.remove('hidden');
};

window.closeModal = () => document.getElementById('patientModal').classList.add('hidden');

window.editPatient = (id) => {
  const p = getData(STORAGE_KEYS.PATIENTS).find((item) => item.id === id);
  if (!p) return;
  document.getElementById('patientId').value = p.id;
  document.getElementById('patientName').value = p.name;
  document.getElementById('patientAge').value = p.age;
  document.getElementById('patientGender').value = p.gender;
  document.getElementById('patientBlood').value = p.blood;
  document.getElementById('patientPhone').value = p.phone;
  document.getElementById('patientDisease').value = p.disease;

  document.getElementById('patientFormTitle').innerHTML = `<i class="fa-solid fa-user-pen"></i> Edit Patient (${p.id})`;
  document.getElementById('cancelPatientEdit').classList.remove('hidden');
};

window.deletePatient = (id) => {
  if (!confirm('Delete this patient record permanently?')) return;
  const updated = getData(STORAGE_KEYS.PATIENTS).filter((p) => p.id !== id);
  setData(STORAGE_KEYS.PATIENTS, updated);
  showToast('Patient record deleted.', 'error');
  refreshAllViews();
};

function resetPatientForm() {
  patientForm.reset();
  document.getElementById('patientId').value = '';
  document.getElementById('patientFormTitle').innerHTML = `<i class="fa-solid fa-user-plus"></i> Register New Patient`;
  document.getElementById('cancelPatientEdit').classList.add('hidden');
}

document.getElementById('cancelPatientEdit').addEventListener('click', resetPatientForm);
document.getElementById('patientSearch').addEventListener('input', renderPatients);
document.getElementById('patientGenderFilter').addEventListener('change', renderPatients);

/* ==================== DOCTOR MANAGEMENT ==================== */
const doctorForm = document.getElementById('doctorForm');

doctorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idInput = document.getElementById('doctorId').value;
  const name = document.getElementById('doctorName').value.trim();
  const specialization = document.getElementById('doctorSpec').value;
  const phone = document.getElementById('doctorPhone').value.trim();
  const availability = document.getElementById('doctorAvailability').value;

  let doctors = getData(STORAGE_KEYS.DOCTORS);

  if (idInput) {
    doctors = doctors.map((d) => (d.id === idInput ? { id: idInput, name, specialization, phone, availability } : d));
    showToast('Doctor details updated!', 'success');
  } else {
    const newId = 'DR-' + Math.floor(100 + Math.random() * 900);
    doctors.unshift({ id: newId, name, specialization, phone, availability });
    showToast('New doctor added!', 'success');
  }

  setData(STORAGE_KEYS.DOCTORS, doctors);
  resetDoctorForm();
  refreshAllViews();
});

function renderDoctors() {
  const doctors = getData(STORAGE_KEYS.DOCTORS);
  const query = document.getElementById('doctorSearch').value.toLowerCase();
  const statusFilter = document.getElementById('doctorStatusFilter').value;

  const filtered = doctors.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(query) || d.specialization.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || d.availability === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const tbody = document.getElementById('doctorsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#64748b;">No doctors found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((d) => {
      const badgeClass = d.availability === 'Available' ? 'badge-green' : d.availability === 'In Surgery' ? 'badge-amber' : 'badge-red';
      return `
      <tr>
        <td><strong>${d.name}</strong><br><small style="color:#64748b">${d.id}</small></td>
        <td>${d.specialization}</td>
        <td>${d.phone}</td>
        <td><span class="badge ${badgeClass}">${d.availability}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" title="Edit" onclick="editDoctor('${d.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" title="Delete" onclick="deleteDoctor('${d.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    })
    .join('');
}

window.editDoctor = (id) => {
  const d = getData(STORAGE_KEYS.DOCTORS).find((item) => item.id === id);
  if (!d) return;
  document.getElementById('doctorId').value = d.id;
  document.getElementById('doctorName').value = d.name;
  document.getElementById('doctorSpec').value = d.specialization;
  document.getElementById('doctorPhone').value = d.phone;
  document.getElementById('doctorAvailability').value = d.availability;

  document.getElementById('doctorFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Doctor (${d.id})`;
  document.getElementById('cancelDoctorEdit').classList.remove('hidden');
};

window.deleteDoctor = (id) => {
  if (!confirm('Remove this doctor from the system?')) return;
  const updated = getData(STORAGE_KEYS.DOCTORS).filter((d) => d.id !== id);
  setData(STORAGE_KEYS.DOCTORS, updated);
  showToast('Doctor removed.', 'error');
  refreshAllViews();
};

function resetDoctorForm() {
  doctorForm.reset();
  document.getElementById('doctorId').value = '';
  document.getElementById('doctorFormTitle').innerHTML = `<i class="fa-solid fa-user-doctor"></i> Add New Doctor`;
  document.getElementById('cancelDoctorEdit').classList.add('hidden');
}

document.getElementById('cancelDoctorEdit').addEventListener('click', resetDoctorForm);
document.getElementById('doctorSearch').addEventListener('input', renderDoctors);
document.getElementById('doctorStatusFilter').addEventListener('change', renderDoctors);

/* ==================== APPOINTMENT MANAGEMENT ==================== */
const appointmentForm = document.getElementById('appointmentForm');

function populateAppointmentDropdowns() {
  const patients = getData(STORAGE_KEYS.PATIENTS);
  const doctors = getData(STORAGE_KEYS.DOCTORS);

  const patientSelect = document.getElementById('apptPatient');
  const doctorSelect = document.getElementById('apptDoctor');

  patientSelect.innerHTML =
    `<option value="">-- Choose Patient --</option>` +
    patients.map((p) => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');

  doctorSelect.innerHTML =
    `<option value="">-- Choose Doctor --</option>` +
    doctors.map((d) => `<option value="${d.id}">${d.name} - ${d.specialization} [${d.availability}]</option>`).join('');
}

appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const idInput = document.getElementById('appointmentId').value;
  const patientId = document.getElementById('apptPatient').value;
  const doctorId = document.getElementById('apptDoctor').value;
  const date = document.getElementById('apptDate').value;
  const time = document.getElementById('apptTime').value;
  const status = document.getElementById('apptStatus').value;
  const notes = document.getElementById('apptNotes').value.trim();

  const patient = getData(STORAGE_KEYS.PATIENTS).find((p) => p.id === patientId);
  const doctor = getData(STORAGE_KEYS.DOCTORS).find((d) => d.id === doctorId);

  if (!patient || !doctor) {
    showToast('Please select valid patient and doctor!', 'error');
    return;
  }

  let appointments = getData(STORAGE_KEYS.APPOINTMENTS);
  const payload = {
    id: idInput || 'AP-' + Math.floor(100 + Math.random() * 900),
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName: doctor.name,
    date,
    time,
    status,
    notes
  };

  if (idInput) {
    appointments = appointments.map((a) => (a.id === idInput ? payload : a));
    showToast('Appointment updated!', 'success');
  } else {
    appointments.unshift(payload);
    showToast('Appointment booked successfully!', 'success');
  }

  setData(STORAGE_KEYS.APPOINTMENTS, appointments);
  resetAppointmentForm();
  refreshAllViews();
});

function renderAppointments() {
  const appointments = getData(STORAGE_KEYS.APPOINTMENTS);
  const query = document.getElementById('apptSearch').value.toLowerCase();
  const statusFilter = document.getElementById('apptStatusFilter').value;

  const filtered = appointments.filter((a) => {
    const matchesQuery = a.patientName.toLowerCase().includes(query) || a.doctorName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const tbody = document.getElementById('appointmentsTableBody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#64748b;">No appointments found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((a) => {
      const badgeClass = a.status === 'Scheduled' ? 'badge-blue' : a.status === 'Completed' ? 'badge-green' : 'badge-red';
      return `
      <tr>
        <td><strong>${a.patientName}</strong></td>
        <td>${a.doctorName}</td>
        <td>${a.date}</td>
        <td>${formatTime12Hour(a.time)}</td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" title="Edit Appointment" onclick="editAppointment('${a.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="action-btn delete" title="Cancel Appointment" onclick="cancelAppointment('${a.id}')"><i class="fa-solid fa-ban"></i></button>
          </div>
        </td>
      </tr>`;
    })
    .join('');
}

window.editAppointment = (id) => {
  const a = getData(STORAGE_KEYS.APPOINTMENTS).find((item) => item.id === id);
  if (!a) return;
  document.getElementById('appointmentId').value = a.id;
  document.getElementById('apptPatient').value = a.patientId;
  document.getElementById('apptDoctor').value = a.doctorId;
  document.getElementById('apptDate').value = a.date;
  document.getElementById('apptTime').value = a.time;
  document.getElementById('apptStatus').value = a.status;
  document.getElementById('apptNotes').value = a.notes || '';

  document.getElementById('appointmentFormTitle').innerHTML = `<i class="fa-solid fa-calendar-pen"></i> Edit Appointment (${a.id})`;
  document.getElementById('cancelApptEdit').classList.remove('hidden');
};

window.cancelAppointment = (id) => {
  if (!confirm('Mark this appointment as Cancelled?')) return;
  const updated = getData(STORAGE_KEYS.APPOINTMENTS).map((a) =>
    a.id === id ? { ...a, status: 'Cancelled' } : a
  );
  setData(STORAGE_KEYS.APPOINTMENTS, updated);
  showToast('Appointment cancelled.', 'error');
  refreshAllViews();
};

function resetAppointmentForm() {
  appointmentForm.reset();
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentFormTitle').innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Book Appointment`;
  document.getElementById('cancelApptEdit').classList.add('hidden');
}

document.getElementById('cancelApptEdit').addEventListener('click', resetAppointmentForm);
document.getElementById('apptSearch').addEventListener('input', renderAppointments);
document.getElementById('apptStatusFilter').addEventListener('change', renderAppointments);

/* ==================== DASHBOARD OVERVIEW REFRESH ==================== */
function renderDashboard() {
  const patients = getData(STORAGE_KEYS.PATIENTS);
  const doctors = getData(STORAGE_KEYS.DOCTORS);
  const appointments = getData(STORAGE_KEYS.APPOINTMENTS);

  document.getElementById('statPatients').textContent = patients.length;
  document.getElementById('statDoctors').textContent = doctors.length;
  const availDocs = doctors.filter((d) => d.availability === 'Available').length;
  document.getElementById('statAvailableDoctors').textContent = `${availDocs} Available today`;

  document.getElementById('statAppointments').textContent = appointments.length;
  const scheduledCount = appointments.filter((a) => a.status === 'Scheduled').length;
  document.getElementById('statScheduledAppts').textContent = `${scheduledCount} Scheduled`;

  // Recent Appointments Table
  const recentBody = document.getElementById('recentAppointmentsBody');
  const recent = appointments.slice(0, 5);
  recentBody.innerHTML = recent.length
    ? recent
        .map((a) => {
          const badge = a.status === 'Scheduled' ? 'badge-blue' : a.status === 'Completed' ? 'badge-green' : 'badge-red';
          return `
          <tr>
            <td><strong>${a.patientName}</strong></td>
            <td>${a.doctorName}</td>
            <td>${a.date} • ${formatTime12Hour(a.time)}</td>
            <td><span class="badge ${badge}">${a.status}</span></td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="4" style="text-align:center;color:#64748b;">No appointments scheduled yet.</td></tr>`;

  // Doctors On Duty List
  const docList = document.getElementById('dashboardDoctorsList');
  docList.innerHTML = doctors.length
    ? doctors
        .slice(0, 5)
        .map((d) => {
          const badge = d.availability === 'Available' ? 'badge-green' : d.availability === 'In Surgery' ? 'badge-amber' : 'badge-red';
          return `
          <div class="doctor-mini-item">
            <div>
              <strong>${d.name}</strong>
              <small>${d.specialization}</small>
            </div>
            <span class="badge ${badge}">${d.availability}</span>
          </div>`;
        })
        .join('')
    : `<p style="color:#64748b;font-size:0.9rem;">No doctors registered.</p>`;
}

function refreshAllViews() {
  renderDashboard();
  renderPatients();
  renderDoctors();
  populateAppointmentDropdowns();
  renderAppointments();
  updateClockAndStatus();
}

/* ==================== BOOTSTRAP APPLICATION ==================== */
document.addEventListener('DOMContentLoaded', () => {
  initializeDefaultData();

  const timing = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMING));
  if (timing) {
    document.getElementById('openTimeInput').value = timing.openTime;
    document.getElementById('closeTimeInput').value = timing.closeTime;
  }

  updateClockAndStatus();
  setInterval(updateClockAndStatus, 1000);

  const activeSession = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
  if (activeSession) {
    loadApp(activeSession);
  }
});
