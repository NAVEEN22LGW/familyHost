
// Enhanced JavaScript for Offline Family Management
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize dashboard
    initializeDashboard();
    
    // Form validation for Add Member page
    const addMemberForm = document.querySelector('form[action="AddMemberServlet"]');
    if (addMemberForm) {
        addMemberForm.setAttribute('action', '#'); // Remove server action
        
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default for offline mode
            
            if (!validateMemberForm()) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Adding Member...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = {
                name: document.querySelector('input[name="name"]').value.trim(),
                dob: document.querySelector('input[name="dob"]').value,
                aadhar: document.querySelector('input[name="aadhar"]').value.trim(),
                jan_aadhar: document.querySelector('input[name="jan_aadhar"]').value.trim(),
                phone: document.querySelector('input[name="phone"]').value.trim()
            };
            
            // Add to database
            setTimeout(() => {
                try {
                    const member = familyDB.addMember(formData);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showMessage(`Member "${member.name}" added successfully! 🎉`, 'success');
                    this.reset(); // Clear form
                    updateStats(); // Update dashboard stats
                } catch (error) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showMessage('Error adding member: ' + error.message, 'error');
                }
            }, 1000);
        });
    }
    
    // Form validation for Search page
    const searchForm = document.querySelector('form[action="ViewFamilyServlet"]');
    if (searchForm) {
        searchForm.setAttribute('action', '#'); // Remove server action
        
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Always prevent default for offline mode
            
            const janAadhar = document.querySelector('input[name="jan_aadhar"]').value.trim();
            
            if (janAadhar.length < 10 || !/^\d+$/.test(janAadhar)) {
                showMessage('Please enter a valid Jan Aadhaar number (minimum 10 digits)', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Searching...';
            submitBtn.disabled = true;
            
            // Search in local database
            setTimeout(() => {
                try {
                    const members = familyDB.getFamilyMembers(janAadhar);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showSearchResults(members, janAadhar);
                } catch (error) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showMessage('Error searching: ' + error.message, 'error');
                }
            }, 500);
        });
    }
    
    // Auto-format and validate inputs
    setupInputFormatting();
    
    // Add interactive button effects
    addButtonEffects();
});

function initializeDashboard() {
    // Update stats from local database
    updateStats();
    
    // Load recent activity
    loadRecentActivity();
}

function updateStats() {
    const stats = familyDB.getStats();
    
    const totalMembers = document.getElementById('totalMembers');
    const totalFamilies = document.getElementById('totalFamilies');
    
    if (totalMembers) {
        animateNumber(totalMembers, 0, stats.totalMembers, 1000);
    }
    if (totalFamilies) {
        animateNumber(totalFamilies, 0, stats.totalFamilies, 1200);
    }
}

function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress >= 1) {
            clearInterval(timer);
        }
    }, 16);
}

function validateMemberForm() {
    const name = document.querySelector('input[name="name"]').value.trim();
    const aadhar = document.querySelector('input[name="aadhar"]').value.trim();
    const janAadhar = document.querySelector('input[name="jan_aadhar"]').value.trim();
    const phone = document.querySelector('input[name="phone"]').value.trim();
    const dob = document.querySelector('input[name="dob"]').value;
    
    // Validate name
    if (name.length < 2) {
        showMessage('Name must be at least 2 characters long', 'error');
        return false;
    }
    
    // Validate DOB
    if (!dob) {
        showMessage('Please select date of birth', 'error');
        return false;
    }
    
    // Check if Aadhaar already exists
    const existingMember = familyDB.getAllMembers().find(member => member.aadhar === aadhar);
    if (existingMember) {
        showMessage('This Aadhaar number already exists in the database', 'error');
        return false;
    }
    
    // Validate Aadhaar (12 digits)
    if (aadhar.length !== 12 || !/^\d{12}$/.test(aadhar)) {
        showMessage('Aadhaar number must be exactly 12 digits', 'error');
        return false;
    }
    
    // Validate Jan Aadhaar (10+ digits)
    if (janAadhar.length < 10 || !/^\d+$/.test(janAadhar)) {
        showMessage('Jan Aadhaar must be at least 10 digits', 'error');
        return false;
    }
    
    // Validate Phone (10 digits)
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        showMessage('Phone number must be exactly 10 digits', 'error');
        return false;
    }
    
    return true;
}

function setupInputFormatting() {
    // Auto-format phone number input
    const phoneInputs = document.querySelectorAll('input[name="phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    });
    
    // Auto-format Aadhaar input
    const aadharInputs = document.querySelectorAll('input[name="aadhar"]');
    aadharInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value.length > 12) {
                this.value = this.value.slice(0, 12);
            }
        });
    });
    
    // Auto-format Jan Aadhaar input
    const janAadharInputs = document.querySelectorAll('input[name="jan_aadhar"]');
    janAadharInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    });
}

function addButtonEffects() {
    const buttons = document.querySelectorAll('button, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea') || createMessageArea();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageArea.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function createMessageArea() {
    const messageArea = document.createElement('div');
    messageArea.id = 'messageArea';
    document.querySelector('.container').appendChild(messageArea);
    return messageArea;
}

function showSearchResults(members, janAadhar) {
    const resultsSection = document.getElementById('resultsSection');
    const searchResults = document.getElementById('searchResults');
    
    if (resultsSection && searchResults) {
        if (members.length === 0) {
            searchResults.innerHTML = `
                <div class="member-card" style="text-align: center; color: #7f8c8d;">
                    No family members found for Jan Aadhaar: ${janAadhar}
                </div>
            `;
            showMessage('No members found for this Jan Aadhaar number', 'error');
        } else {
            let resultsHTML = '';
            members.forEach(member => {
                resultsHTML += `
                    <div class="member-card">
                        <strong>👤 Name:</strong> ${member.name}<br>
                        <strong>📅 DOB:</strong> ${member.dob}<br>
                        <strong>🆔 Aadhaar:</strong> ${member.aadhar}<br>
                        <strong>📱 Phone:</strong> ${member.phone}<br>
                        <strong>🏠 Jan Aadhaar:</strong> ${member.jan_aadhar}<br>
                        <small style="color: #7f8c8d;">Added: ${new Date(member.addedDate).toLocaleDateString()}</small>
                    </div>
                `;
            });
            searchResults.innerHTML = resultsHTML;
            showMessage(`Found ${members.length} family member(s)! 👨‍👩‍👧‍👦`, 'success');
        }
        resultsSection.style.display = 'block';
    }
}

function clearForm() {
    const form = document.getElementById('addMemberForm');
    if (form) {
        form.reset();
        showMessage('Form cleared successfully! 🗑️', 'success');
    }
}

function showAllFamilies() {
    const allMembers = familyDB.getAllMembers();
    if (allMembers.length === 0) {
        showMessage('No members found in database', 'error');
        return;
    }
    
    showMessage(`Total ${allMembers.length} members found in database! Click View Reports for detailed view.`, 'success');
}

function showReports() {
    // Create reports page
    window.open('reports.html', '_blank');
}

function loadRecentActivity() {
    // Load recent additions
    const recentMembers = familyDB.getAllMembers()
        .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
        .slice(0, 5);
    
    console.log('Recent additions:', recentMembers.length);
}

// Backup and restore functions
function exportData() {
    const data = familyDB.exportData();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `family_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage('Data exported successfully! 💾', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            familyDB.importData(data);
            updateStats();
            showMessage('Data imported successfully! 📥', 'success');
        } catch (error) {
            showMessage('Error importing data: Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
}
