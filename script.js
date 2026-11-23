/* ==================== STATE & STORAGE INITIALIZATION ==================== */
const STORAGE_KEYS = {
  AUTH: 'medicore_auth',
  PATIENTS: 'medicore_patients',
  DOCTORS: 'medicore_doctors',
  APPOINTMENTS: 'medicore_appointments'
};

// Preload realistic sample records on first visit for presentation readiness
const DEFAULT_PATIENTS = [
  { id: 'P-1001', name: 'Aarav Sharma', age: 34, gender: 'Male', blood: 'B+', phone: '9876543210', disease: 'Hypertension Checkup' },
  { id: 'P-1002', name: 'Ananya Verma', age: 27, gender: 'Female', blood: 'O+', phone: '9823456712', disease: 'Migraine & Fatigue' },
  { id: 'P-1003', name: 'Rohan Kulkarni', age: 45, gender: 'Male', blood: 'A+', phone: '9765432109', disease: 'Knee Joint Pain' }
];

const DEFAULT_DOCTORS = [
  { id: 'D-201', name: 'Dr. Vikramaditya Nair', specialization: 'Cardiologist', phone: '9112233445', availability: 'Available' },
  { id: 'D-202', name: 'Dr. Meera Deshmukh', specialization: 'Neurologist', phone: '9223344556', availability: 'Available' },
  { id: 'D-203', name: 'Dr. Kabir Malhotra', specialization: 'Orthopedic', phone: '9334455667', availability: 'In Surgery' }
];

const DEFAULT_APPOINTMENTS = [
  { id: 'APT-301', patientId: 'P-1001', doctorId: 'D-201', date: new Date().toISOString().split('T')[0], time: '10:30', status: 'Scheduled', notes: 'Routine ECG & BP review' },
  { id: 'APT-302', patientId: 'P-1002', doctorId: 'D-202', date: new Date().toISOString().split('T')[0], time: '14:15', status: 'Completed', notes: 'Follow-up consultation' }
];

function getData(key, fallback) {
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return [...fallback];
  }
  return JSON.parse(existing);
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let patients = getData(STORAGE_KEYS.PATIENTS, DEFAULT_PATIENTS);
let doctors = getData(STORAGE_KEYS.DOCTORS, DEFAULT_DOCTORS);
let appointments = getData(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);

/* ==================== TOAST NOTIFICATIONS ==================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ==================== 1. AUTHENTICATION (LOGIN / LOGOUT) ==================== */
const loginView = document.getElementById('login-view');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');

function checkAuth() {
  const isLoggedIn = localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  if (isLoggedIn) {
    loginView.classList.add('hidden');
    appShell.classList.remove('hidden');
    refreshAllViews();
  } else {
    loginView.classList.remove('hidden');
    appShell.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  if (!user || !pass) {
    showToast('Please enter both username and password.', 'error');
    return;
  }

  if (user === 'admin' && pass === 'admin123') {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    showToast('Login successful! Welcome back, Admin.', 'success');
    loginForm.reset();
    checkAuth();
  } else {
    showToast('Invalid credentials! Try admin / admin123', 'error');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  showToast('Logged out successfully.', 'info');
  checkAuth();
});

/* ==================== NAVIGATION & MOBILE MENU ==================== */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('page-title');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

const TITLES = {
  'dashboard-section': 'Admin Dashboard',
  'patients-section': 'Patient Management',
  'doctors-section': 'Doctor Management',
  'appointments-section': 'Appointment Management'
};

function switchTab(targetId) {
  navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
  sections.forEach(sec => sec.classList.toggle('active', sec.id === targetId));
  pageTitle.textContent = TITLES[targetId] || 'Dashboard';

  // Close mobile sidebar
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.target));
});

document.getElementById('menu-toggle').addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

/* ==================== 6. LIVE CLOCK & HOSPITAL TIMING ==================== */
function updateClockAndStatus() {
  const now = new Date();
  
  // Format Date
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('live-date').textContent = now.toLocaleDateString('en-IN', dateOptions);
  
  // Format Time
  document.getElementById('live-clock').textContent = now.toLocaleTimeString('en-IN');

  // Hospital OPD Hours: 08:00 AM (8) to 08:00 PM (20)
  const currentHour = now.getHours();
  const isOpen = currentHour >= 8 && currentHour < 20;

  const badge = document.getElementById('hospital-status-badge');
  const statusText = document.getElementById('hospital-status-text');
  const panelStatus = document.getElementById('panel-status-text');

  if (isOpen) {
    badge.className = 'status-badge status-open';
    statusText.textContent = 'HOSPITAL OPEN';
    if (panelStatus) panelStatus.textContent = 'Open (OPD Active)';
  } else {
    badge.className = 'status-badge status-closed';
    statusText.textContent = 'OPD CLOSED';
    if (panelStatus) panelStatus.textContent = 'Closed (Emergency Only)';
  }
}

setInterval(updateClockAndStatus, 1000);
updateClockAndStatus();

/* ==================== 2. DASHBOARD OVERVIEW ==================== */
function renderDashboard() {
  document.getElementById('stat-patients').textContent = patients.length;
  document.getElementById('stat-doctors').textContent = doctors.length;
  document.getElementById('stat-appointments').textContent = appointments.length;

  const availableDocs = doctors.filter(d => d.availability === 'Available').length;
  document.getElementById('stat-available-doctors').textContent = `${availableDocs} Available now`;

  const scheduledAppts = appointments.filter(a => a.status === 'Scheduled').length;
  document.getElementById('stat-scheduled-appts').textContent = `${scheduledAppts} Scheduled`;

  // Recent Appointments Table
  const tbody = document.getElementById('recent-appointments-body');
  const recent = [...appointments].slice(-5).reverse();

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#64748b;">No appointments booked yet.</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(appt => {
    const patient = patients.find(p => p.id === appt.patientId);
    const doctor = doctors.find(d => d.id === appt.doctorId);
    const badgeClass = appt.status === 'Completed' ? 'badge-green' : appt.status === 'Cancelled' ? 'badge-danger' : 'badge-blue';
    return `
      <tr>
        <td><strong>${patient ? patient.name : 'Unknown Patient'}</strong></td>
        <td>${doctor ? doctor.name : 'Unknown Doctor'}</td>
        <td>${appt.date} at ${appt.time}</td>
        <td><span class="badge ${badgeClass}">${appt.status}</span></td>
      </tr>
    `;
  }).join('');
}

/* ==================== 3. PATIENT MANAGEMENT ==================== */
const patientForm = document.getElementById('patient-form');
const patientSearch = document.getElementById('patient-search');
const patientGenderFilter = document.getElementById('patient-gender-filter');

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('patient-id').value;
  const name = document.getElementById('patient-name').value.trim();
  const age = document.getElementById('patient-age').value.trim();
  const gender = document.getElementById('patient-gender').value;
  const blood = document.getElementById('patient-blood').value;
  const phone = document.getElementById('patient-phone').value.trim();
  const disease = document.getElementById('patient-disease').value.trim();

  if (!name || !age || !gender || !blood || !phone || !disease) {
    showToast('Please fill in all required patient fields.', 'error');
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    showToast('Please enter a valid 10-digit phone number.', 'error');
    return;
  }

  if (id) {
    // Update existing patient
    const idx = patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      patients[idx] = { id, name, age, gender, blood, phone, disease };
      showToast('Patient details updated successfully!', 'success');
    }
  } else {
    // Create new patient
    const newId = 'P-' + (1000 + patients.length + Math.floor(Math.random() * 900));
    patients.push({ id: newId, name, age, gender, blood, phone, disease });
    showToast('New patient registered successfully!', 'success');
  }

  saveData(STORAGE_KEYS.PATIENTS, patients);
  resetPatientForm();
  refreshAllViews();
});

function resetPatientForm() {
  patientForm.reset();
  document.getElementById('patient-id').value = '';
  document.getElementById('patient-form-title').textContent = 'Register New Patient';
  document.getElementById('patient-submit-btn').textContent = 'Save Patient Record';
  document.getElementById('cancel-patient-edit').classList.add('hidden');
}

document.getElementById('cancel-patient-edit').addEventListener('click', resetPatientForm);

function renderPatients() {
  const query = patientSearch.value.toLowerCase();
  const genderVal = patientGenderFilter.value;
  const tbody = document.getElementById('patients-table-body');

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.disease.toLowerCase().includes(query);
    const matchesGender = genderVal === 'All' || p.gender === genderVal;
    return matchesSearch && matchesGender;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;">No matching patient records found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.age} yrs / ${p.gender}</td>
      <td><span class="badge badge-danger">${p.blood}</span></td>
      <td>${p.phone}</td>
      <td>${p.disease}</td>
      <td class="table-actions">
        <button class="icon-btn btn-view" onclick="viewPatient('${p.id}')">View</button>
        <button class="icon-btn btn-edit" onclick="editPatient('${p.id}')">Edit</button>
        <button class="icon-btn btn-del" onclick="deletePatient('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.viewPatient = function(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <p><span>Patient ID:</span> <strong>${p.id}</strong></p>
    <p><span>Full Name:</span> <strong>${p.name}</strong></p>
    <p><span>Age / Gender:</span> <strong>${p.age} Years / ${p.gender}</strong></p>
    <p><span>Blood Group:</span> <strong>${p.blood}</strong></p>
    <p><span>Contact Number:</span> <strong>${p.phone}</strong></p>
    <p><span>Primary Condition:</span> <strong>${p.disease}</strong></p>
  `;
  document.getElementById('patient-modal').classList.remove('hidden');
};

document.getElementById('close-modal-btn').addEventListener('click', () => {
  document.getElementById('patient-modal').classList.add('hidden');
});

window.editPatient = function(id) {
  const p = patients.find(item => item.id === id);
  if (!p) return;
  document.getElementById('patient-id').value = p.id;
  document.getElementById('patient-name').value = p.name;
  document.getElementById('patient-age').value = p.age;
  document.getElementById('patient-gender').value = p.gender;
  document.getElementById('patient-blood').value = p.blood;
  document.getElementById('patient-phone').value = p.phone;
  document.getElementById('patient-disease').value = p.disease;

  document.getElementById('patient-form-title').textContent = `Edit Patient (${p.id})`;
  document.getElementById('patient-submit-btn').textContent = 'Update Patient';
  document.getElementById('cancel-patient-edit').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePatient = function(id) {
  if (!confirm('Are you sure you want to delete this patient record?')) return;
  patients = patients.filter(p => p.id !== id);
  saveData(STORAGE_KEYS.PATIENTS, patients);
  showToast('Patient record deleted.', 'info');
  refreshAllViews();
};

patientSearch.addEventListener('input', renderPatients);
patientGenderFilter.addEventListener('change', renderPatients);

/* ==================== 4. DOCTOR MANAGEMENT ==================== */
const doctorForm = document.getElementById('doctor-form');
const doctorSearch = document.getElementById('doctor-search');
const doctorStatusFilter = document.getElementById('doctor-status-filter');

doctorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('doctor-id').value;
  const name = document.getElementById('doctor-name').value.trim();
  const specialization = document.getElementById('doctor-specialization').value;
  const phone = document.getElementById('doctor-phone').value.trim();
  const availability = document.getElementById('doctor-availability').value;

  if (!name || !specialization || !phone) {
    showToast('Please fill in all required doctor fields.', 'error');
    return;
  }

  if (id) {
    const idx = doctors.findIndex(d => d.id === id);
    if (idx !== -1) {
      doctors[idx] = { id, name, specialization, phone, availability };
      showToast('Doctor details updated!', 'success');
    }
  } else {
    const newId = 'D-' + (200 + doctors.length + Math.floor(Math.random() * 90));
    doctors.push({ id: newId, name, specialization, phone, availability });
    showToast('New doctor added to directory!', 'success');
  }

  saveData(STORAGE_KEYS.DOCTORS, doctors);
  resetDoctorForm();
  refreshAllViews();
});

function resetDoctorForm() {
  doctorForm.reset();
  document.getElementById('doctor-id').value = '';
  document.getElementById('doctor-form-title').textContent = 'Add New Doctor';
  document.getElementById('doctor-submit-btn').textContent = 'Save Doctor';
  document.getElementById('cancel-doctor-edit').classList.add('hidden');
}

document.getElementById('cancel-doctor-edit').addEventListener('click', resetDoctorForm);

function renderDoctors() {
  const query = doctorSearch.value.toLowerCase();
  const statusVal = doctorStatusFilter.value;
  const tbody = document.getElementById('doctors-table-body');

  const filtered = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(query) || d.specialization.toLowerCase().includes(query);
    const matchesStatus = statusVal === 'All' || d.availability === statusVal;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">No matching doctors found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(d => {
    const badgeClass = d.availability === 'Available' ? 'badge-green' : d.availability === 'In Surgery' ? 'badge-warning' : 'badge-danger';
    return `
      <tr>
        <td><strong>${d.id}</strong></td>
        <td>${d.name}</td>
        <td>${d.specialization}</td>
        <td>${d.phone}</td>
        <td><span class="badge ${badgeClass}">${d.availability}</span></td>
        <td class="table-actions">
          <button class="icon-btn btn-edit" onclick="editDoctor('${d.id}')">Edit</button>
          <button class="icon-btn btn-del" onclick="deleteDoctor('${d.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.editDoctor = function(id) {
  const d = doctors.find(item => item.id === id);
  if (!d) return;
  document.getElementById('doctor-id').value = d.id;
  document.getElementById('doctor-name').value = d.name;
  document.getElementById('doctor-specialization').value = d.specialization;
  document.getElementById('doctor-phone').value = d.phone;
  document.getElementById('doctor-availability').value = d.availability;

  document.getElementById('doctor-form-title').textContent = `Edit Doctor (${d.id})`;
  document.getElementById('doctor-submit-btn').textContent = 'Update Doctor';
  document.getElementById('cancel-doctor-edit').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteDoctor = function(id) {
  if (!confirm('Remove this doctor from the system?')) return;
  doctors = doctors.filter(d => d.id !== id);
  saveData(STORAGE_KEYS.DOCTORS, doctors);
  showToast('Doctor removed.', 'info');
  refreshAllViews();
};

doctorSearch.addEventListener('input', renderDoctors);
doctorStatusFilter.addEventListener('change', renderDoctors);

/* ==================== 5. APPOINTMENT MANAGEMENT ==================== */
const appointmentForm = document.getElementById('appointment-form');
const appointmentSearch = document.getElementById('appointment-search');
const appointmentStatusFilter = document.getElementById('appointment-status-filter');

function populateAppointmentDropdowns() {
  const patientSelect = document.getElementById('appt-patient');
  const doctorSelect = document.getElementById('appt-doctor');

  patientSelect.innerHTML = '<option value="">-- Select Patient --</option>' +
    patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');

  doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' +
    doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialization} [${d.availability}]</option>`).join('');
}

appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('appointment-id').value;
  const patientId = document.getElementById('appt-patient').value;
  const doctorId = document.getElementById('appt-doctor').value;
  const date = document.getElementById('appt-date').value;
  const time = document.getElementById('appt-time').value;
  const status = document.getElementById('appt-status').value;
  const notes = document.getElementById('appt-notes').value.trim() || 'General Consultation';

  if (!patientId || !doctorId || !date || !time) {
    showToast('Please select patient, doctor, date, and time.', 'error');
    return;
  }

  if (id) {
    const idx = appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      appointments[idx] = { id, patientId, doctorId, date, time, status, notes };
      showToast('Appointment updated successfully!', 'success');
    }
  } else {
    const newId = 'APT-' + (300 + appointments.length + Math.floor(Math.random() * 90));
    appointments.push({ id: newId, patientId, doctorId, date, time, status, notes });
    showToast('Appointment booked successfully!', 'success');
  }

  saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
  resetAppointmentForm();
  refreshAllViews();
});

function resetAppointmentForm() {
  appointmentForm.reset();
  document.getElementById('appointment-id').value = '';
  document.getElementById('appointment-form-title').textContent = 'Book New Appointment';
  document.getElementById('appointment-submit-btn').textContent = 'Confirm Appointment';
  document.getElementById('cancel-appointment-edit').classList.add('hidden');
}

document.getElementById('cancel-appointment-edit').addEventListener('click', resetAppointmentForm);

function renderAppointments() {
  const query = appointmentSearch.value.toLowerCase();
  const statusVal = appointmentStatusFilter.value;
  const tbody = document.getElementById('appointments-table-body');

  const filtered = appointments.filter(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const doctor = doctors.find(d => d.id === a.doctorId);
    const pName = patient ? patient.name.toLowerCase() : '';
    const dName = doctor ? doctor.name.toLowerCase() : '';

    const matchesSearch = pName.includes(query) || dName.includes(query) || a.id.toLowerCase().includes(query);
    const matchesStatus = statusVal === 'All' || a.status === statusVal;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;">No appointments found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const doctor = doctors.find(d => d.id === a.doctorId);
    const badgeClass = a.status === 'Completed' ? 'badge-green' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-blue';

    return `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>${patient ? patient.name : 'Removed Patient'}</td>
        <td>${doctor ? doctor.name : 'Removed Doctor'}</td>
        <td>${a.date} | <strong>${a.time}</strong></td>
        <td>${a.notes}</td>
        <td><span class="badge ${badgeClass}">${a.status}</span></td>
        <td class="table-actions">
          <button class="icon-btn btn-edit" onclick="editAppointment('${a.id}')">Edit</button>
          ${a.status !== 'Cancelled' ? `<button class="icon-btn btn-del" onclick="cancelAppointment('${a.id}')">Cancel</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

window.editAppointment = function(id) {
  const a = appointments.find(item => item.id === id);
  if (!a) return;
  document.getElementById('appointment-id').value = a.id;
  document.getElementById('appt-patient').value = a.patientId;
  document.getElementById('appt-doctor').value = a.doctorId;
  document.getElementById('appt-date').value = a.date;
  document.getElementById('appt-time').value = a.time;
  document.getElementById('appt-status').value = a.status;
  document.getElementById('appt-notes').value = a.notes;

  document.getElementById('appointment-form-title').textContent = `Edit Appointment (${a.id})`;
  document.getElementById('appointment-submit-btn').textContent = 'Update Appointment';
  document.getElementById('cancel-appointment-edit').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelAppointment = function(id) {
  if (!confirm('Cancel this appointment?')) return;
  const idx = appointments.findIndex(a => a.id === id);
  if (idx !== -1) {
    appointments[idx].status = 'Cancelled';
    saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
    showToast('Appointment marked as Cancelled.', 'info');
    refreshAllViews();
  }
};

appointmentSearch.addEventListener('input', renderAppointments);
appointmentStatusFilter.addEventListener('change', renderAppointments);

/* ==================== INITIALIZE APPLICATION ==================== */
function refreshAllViews() {
  renderDashboard();
  renderPatients();
  renderDoctors();
  populateAppointmentDropdowns();
  renderAppointments();
}

// Start App
checkAuth();
