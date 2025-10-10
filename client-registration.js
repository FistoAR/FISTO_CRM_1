let remarksInput = document.getElementById('remarks');
let projectNameInput = document.getElementById('projectname');
let projectDescInput = document.getElementById('allocProjectDescription');


class ClientManager {
    constructor() {
        this.clients = [];
        this.pendingStatusIndex = null;
        this.pendingStatusNewValue = null;
        this.currentEditingIndex = null;
        this.initializeEventListeners();
        this.setDefaultDate();
        this.loadClients();
    }

    initializeEventListeners() {
        document.getElementById('clientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        document.getElementById('confirmYesBtn').addEventListener('click', () => {
            this.confirmStatusChange(true);
        });

        document.getElementById('confirmNoBtn').addEventListener('click', () => {
            this.confirmStatusChange(false);
        });

        document.getElementById('clientConfirmYesBtn').addEventListener('click', () => {
            this.confirmDelete(true);
        });

        document.getElementById('clientConfirmNoBtn').addEventListener('click', () => {
            this.confirmDelete(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeForm();
                this.closeclientViewModal();
                this.closeDeleteModal();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('Date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    async submitViewClientChanges(index) {
        const form = document.getElementById('viewClientForm');
        
        if (!form.reportValidity()) return;

        const clientData = {
            date: document.getElementById('viewDate').value,
            customer_id: document.getElementById('viewCustomerId').value,
            company_name: document.getElementById('viewCompanyName').value,
            customer_name: document.getElementById('viewCustomerName').value,
            address: document.getElementById('viewAddress').value || 'N/A',
            industry_type: document.getElementById('viewIndustryType').value || 'N/A',
            website: document.getElementById('viewWebsite').value || 'N/A',
            reference: document.getElementById('viewReference').value || 'N/A',
            remarks: document.getElementById('viewRemarks').value || 'N/A',
            contact_person: document.getElementById('viewContactPerson').value || 'N/A',
            phone_number: document.getElementById('viewPhoneNo').value,
            mail_id: document.getElementById('viewMailId').value,
            designation: document.getElementById('viewDesignation').value || 'N/A',
        };

        const client = this.clients[index];
        
        try {
            const updateFormData = new FormData();
            updateFormData.append('customer_id', client.customerId);
            updateFormData.append('date', clientData.date);
            updateFormData.append('company_name', clientData.company_name);
            updateFormData.append('customer_name', clientData.customer_name);
            updateFormData.append('address', clientData.address);
            updateFormData.append('industry_type', clientData.industry_type);
            updateFormData.append('website', clientData.website);
            updateFormData.append('reference', clientData.reference);
            updateFormData.append('remarks', clientData.remarks);
            updateFormData.append('contact_person', clientData.contact_person);
            updateFormData.append('phone_number', clientData.phone_number);
            updateFormData.append('mail_id', clientData.mail_id);
            updateFormData.append('designation', clientData.designation);

            const response = await fetch('https://www.fist-o.com/web_crm/update_client.php', {
                method: 'POST',
                body: updateFormData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                Object.assign(this.clients[index], {
                    Date: clientData.date,
                    updatedAt: new Date().toISOString(), // Update the timestamp
                    customerId: clientData.customer_id,
                    companyName: clientData.company_name,
                    customerName: clientData.customer_name,
                    address: clientData.address,
                    industryType: clientData.industry_type,
                    website: clientData.website,
                    reference: clientData.reference,
                    remarks: clientData.remarks,
                    contactPerson: clientData.contact_person,
                    phoneNo: clientData.phone_number,
                    mailId: clientData.mail_id,
                    designation: clientData.designation
                });
                this.updateTable();
                this.closeclientViewModal();
                this.showToast('Client Updated Successfully', `${clientData.customer_name} has been updated.`);
            } else {
                this.showToast('Error', result.message || 'Failed to update client');
                console.error('Server error:', result);
            }
        } catch (err) {
            this.showToast('Error', 'Network error while updating client');
            console.error('Fetch error:', err);
        }
    }

async confirmStatusChange(confirmed) {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.classList.remove('show');
    document.body.style.overflow = 'auto';

    const index = this.pendingStatusIndex;
    const newStatus = this.pendingStatusNewValue;
    const remarksInput = document.getElementById('remarks');
    const newRemarks = remarksInput ? remarksInput.value.trim() : '';

    if (confirmed && index != null && this.clients && this.clients[index]) {
        const client = this.clients[index];

        try {
            const updateFormData = new FormData();
            updateFormData.append('customer_id', client.customerId);
            updateFormData.append('status', newStatus);
            updateFormData.append('remarks', newRemarks || client.remarks);

            if (newStatus.toLowerCase() === 'onboard') {
                const projectNameInput = document.querySelector('#projectFields input#projectname');
                const projectDescInput = document.querySelector('#projectFields textarea#allocProjectDescription');

                const projectName = projectNameInput ? projectNameInput.value.trim() : '';
                const projectDesc = projectDescInput ? projectDescInput.value.trim() : '';


                updateFormData.append('project_name', projectName);
                updateFormData.append('project_description', projectDesc);
                console.log('projectDesc')
            }

            // Disable the Yes button here if needed to prevent double clicks

            const response = await fetch('https://www.fist-o.com/web_crm/update_client_status.php', {
                method: 'POST',
                body: updateFormData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                this.clients[index].status = newStatus;
                this.clients[index].remarks = newRemarks || client.remarks;
                this.clients[index].updatedAt = new Date().toISOString();
            if (newStatus.toLowerCase() === 'onboard') {
                const projectNameInput = document.querySelector('#projectFields input#projectname');
                const projectDescInput = document.querySelector('#projectFields textarea#allocProjectDescription');

                this.clients[index].projectName = projectNameInput ? projectNameInput.value.trim() : 'N/A';
                this.clients[index].projectDescription = projectDescInput ? projectDescInput.value.trim() : 'N/A';
            }


                const selectElement = document.querySelector(`tr:nth-child(${index + 1}) select`);
                if (selectElement) {
                    selectElement.className = `status-badge status-${newStatus}`;
                    selectElement.value = newStatus;
                }

                this.updateTable();
                this.showToast('Success', 'Status and project details updated successfully');
            } else {
                this.showToast('Error', result.message || 'Failed to update');
                console.error('Server error:', result);
            }
        } catch (err) {
            this.showToast('Error', 'Network error while updating');
            console.error('Update error:', err);
        }
    } else if (!confirmed && index != null && this.clients && this.clients[index]) {
        const selectElement = document.querySelector(`tr:nth-child(${index + 1}) select`);
        if (selectElement) {
            selectElement.value = this.clients[index].status;
        }
    }

    this.pendingStatusIndex = null;
    this.pendingStatusNewValue = null;

    // Clear all inputs after closing modal
    if (remarksInput) remarksInput.value = '';
    const projectNameInput = document.getElementById('projectname');
    const projectDescInput = document.getElementById('allocProjectDescription');
    if (projectNameInput) projectNameInput.value = '';
    if (projectDescInput) projectDescInput.value = '';
}

    async loadClients() {
        try {
            const response = await fetch('https://www.fist-o.com/web_crm/fetch_clients.php', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                this.clients = result.data.map(clientRecord => ({
                    id: clientRecord.id,
                    Date: clientRecord.date,
                    customerId: clientRecord.customer_id,
                    companyName: clientRecord.company_name,
                    customerName: clientRecord.customer_name,
                    address: clientRecord.address || 'N/A',
                    industryType: clientRecord.industry_type || 'N/A',
                    website: clientRecord.website || 'N/A',
                    reference: clientRecord.reference || 'N/A',
                    remarks: clientRecord.remarks || 'N/A',
                    contactPerson: clientRecord.contact_person || 'N/A',
                    phoneNo: clientRecord.phone_number || 'N/A',
                    mailId: clientRecord.mail_id || 'N/A',
                    designation: clientRecord.designation || 'N/A',
                    status: clientRecord.status || 'none',
                    createdAt: clientRecord.created_at,
                    updatedAt: clientRecord.updated_at // Store updated_at
                }));
                
                this.updateTable();
                this.showToast('Success', `Loaded ${this.clients.length} clients`);
            } else {
                console.error('Failed to load clients:', result);
                this.showToast('Warning', 'Failed to load clients: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error loading clients:', err);
            this.showToast('Warning', 'Network error: ' + err.message);
        }
    }

    openForm() {
        this.currentEditingIndex = null;
        document.getElementById('clientModal').classList.add('show');
        document.body.style.overflow = 'hidden';
        const submitBtn = document.querySelector('#clientModal .btn-primary');
        if (submitBtn) submitBtn.textContent = 'Add Client';
    }

    closeForm() {
        document.getElementById('clientModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    closeclientViewModal() {
        document.getElementById('clientviewModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    closeDeleteModal() {
        const deleteModal = document.getElementById('clientDeleteModal');
        if (deleteModal) {
            deleteModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    resetForm() {
        document.getElementById('clientForm').reset();
        this.setDefaultDate();
        this.currentEditingIndex = null;
    }

    async handleFormSubmit() {
        const form = document.getElementById('clientForm');

        if (!form.reportValidity()) return;

        const formData = new FormData(form);

        const clientData = {
            Date: formData.get('Date'),
            customerId: formData.get('customerId'),
            companyName: formData.get('companyName'),
            customerName: formData.get('customerName'),
            address: formData.get('address') || 'N/A',
            industryType: formData.get('industryType') || 'N/A',
            website: formData.get('website') || 'N/A',
            reference: formData.get('reference') || 'N/A',
            remarks: formData.get('clientremarks') || 'N/A',
            contactPerson: formData.get('contactPerson') || 'N/A',
            phoneNumber: formData.get('phoneNo'),
            mailId: formData.get('mailId'),
            designation: formData.get('designation') || 'N/A'
        };

        if (this.currentEditingIndex !== null) {
            await this.updateClient(clientData);
        } else {
            await this.addNewClient(clientData);
        }
    }

    async addNewClient(clientData) {
        try {
            const response = await fetch('https://www.fist-o.com/web_crm/client_registration.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                clientData.id = result.id || Date.now().toString();
                clientData.status = 'none';
                clientData.createdAt = new Date().toISOString();
                clientData.updatedAt = new Date().toISOString();
                this.addClient(clientData);
                this.closeForm();
                this.showToast('Client Added Successfully', `${clientData.customerName} has been saved.`);
            } else {
                this.showToast('Error', result.message || 'Failed to save client');
                console.error('Server error:', result);
            }
        } catch (err) {
            this.showToast('Error', 'Network error while saving client');
            console.error('Fetch error:', err);
        }
    }

    async updateClient(clientData) {
        const client = this.clients[this.currentEditingIndex];
        
        try {
            const updateFormData = new FormData();
            updateFormData.append('customer_id', client.customerId);
            updateFormData.append('Date', clientData.Date);
            updateFormData.append('companyName', clientData.companyName);
            updateFormData.append('customerName', clientData.customerName);
            updateFormData.append('address', clientData.address);
            updateFormData.append('industryType', clientData.industryType);
            updateFormData.append('website', clientData.website);
            updateFormData.append('reference', clientData.reference);
            updateFormData.append('remarks', clientData.remarks);
            updateFormData.append('contactPerson', clientData.contactPerson);
            updateFormData.append('phoneNumber', clientData.phoneNumber);
            updateFormData.append('mailId', clientData.mailId);
            updateFormData.append('designation', clientData.designation);

            const response = await fetch('https://www.fist-o.com/web_crm/update_client.php', {
                method: 'POST',
                body: updateFormData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                Object.assign(this.clients[this.currentEditingIndex], clientData);
                this.clients[this.currentEditingIndex].updatedAt = new Date().toISOString();
                this.updateTable();
                this.closeForm();
                this.showToast('Client Updated Successfully', `${clientData.customerName} has been updated.`);
            } else {
                this.showToast('Error', result.message || 'Failed to update client');
                console.error('Server error:', result);
            }
        } catch (err) {
            this.showToast('Error', 'Network error while updating client');
            console.error('Fetch error:', err);
        }
    }

    editClient(index) {
        const client = this.clients[index];
        this.currentEditingIndex = index;

        document.getElementById('Date').value = client.Date || '';
        document.getElementById('customerId').value = client.customerId || '';
        document.getElementById('companyName').value = client.companyName || '';
        document.getElementById('customerName').value = client.customerName || '';
        document.getElementById('address').value = client.address || '';
        document.getElementById('industryType').value = client.industryType || '';
        document.getElementById('website').value = client.website || '';
        document.getElementById('reference').value = client.reference || '';
        document.getElementById('clientremarks').value = client.remarks || '';
        document.getElementById('contactPerson').value = client.contactPerson || '';
        document.getElementById('phoneNo').value = client.phoneNo || '';
        document.getElementById('mailId').value = client.mailId || '';
        document.getElementById('designation').value = client.designation || '';

        document.getElementById('customerId').disabled = true;

        const modalTitle = document.querySelector('#clientModal .modal-title');
        if (modalTitle) modalTitle.textContent = 'Edit Client';
        
        const submitBtn = document.querySelector('#clientModal .btn-primary');
        if (submitBtn) submitBtn.textContent = 'Update Client';

        document.getElementById('clientModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    async deleteClient(index) {
        const client = this.clients[index];
        
        const deleteMessage = document.getElementById('clientDeleteMessage');
        if (deleteMessage) {
            deleteMessage.textContent = `Are you sure you want to delete ${client.companyName} (${client.customerName})? This action cannot be undone.`;
        }
        
        this.pendingDeleteIndex = index;
        const deleteModal = document.getElementById('clientDeleteModal');
        deleteModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    async confirmDelete(confirmed) {
        const deleteModal = document.getElementById('clientDeleteModal');
        deleteModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        if (!confirmed || this.pendingDeleteIndex === null) {
            this.pendingDeleteIndex = null;
            return;
        }

        const index = this.pendingDeleteIndex;
        const client = this.clients[index];

        try {
            const deleteFormData = new FormData();
            deleteFormData.append('customer_id', client.customerId);

            const response = await fetch('https://www.fist-o.com/web_crm/delete_client.php', {
                method: 'POST',
                body: deleteFormData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                this.clients.splice(index, 1);
                this.updateTable();
                this.showToast('Client Deleted Successfully', `${client.companyName} has been deleted.`);
            } else {
                this.showToast('Error', result.message || 'Failed to delete client');
                console.error('Server error:', result);
            }
        } catch (err) {
            this.showToast('Error', 'Network error while deleting client');
            console.error('Fetch error:', err);
        }

        this.pendingDeleteIndex = null;
    }

    addClient(clientData) {
        this.clients.push(clientData);
        this.updateTable();
    }

    updateTable() {
        const tbody = document.getElementById('clientTableBody');
        if (this.clients.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="12">
                        <div class="empty-content">
                            <i class="fas fa-users"></i>
                            <p>No clients found</p>
                            <small>Click "Add Client" to get started</small>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = this.clients.map((client, index) => `
            <tr>
                <td>
                    <select class="status-badge status-${(client.status || 'none').toLowerCase().replace(/\s+/g, '')}" 
                            onchange="clientManager.updateStatus(${index}, this.value)">
                        <option value="lead" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'lead' ? 'selected' : ''}>Lead</option>
                        <option value="drop" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'drop' ? 'selected' : ''}>Drop</option>
                        <option value="onboard" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'onboard' ? 'selected' : ''}>Onboard</option>
                        <option value="quotation" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'quotation' ? 'selected' : ''}>Quotation</option>
                        <option value="inprogress" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'inprogress' ? 'selected' : ''}>In Progress</option>
                        <option value="notinterest" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'notinterest' ? 'selected' : ''}>Not Interest</option>
                        <option value="none" ${(client.status || '').toLowerCase().replace(/\s+/g, '') === 'none' ? 'selected' : ''}>None</option>
                    </select>
                </td>
                <td>${client.remarks}</td>
                <td>${this.formatDate(client.Date)}</td>
                <td>${this.formatDate(client.updatedAt)}</td>
                <td>${client.customerId}</td>
                <td>${client.companyName}</td>
                <td>${client.customerName}</td>
                <td>${client.phoneNo}</td>
                <td>${client.mailId}</td>
                <td>
                    <button class="view-btn" onclick="clientManager.viewClient(${index})" style="
                        background: #17a2b8;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
                <td>
                    <button class="delete-btn" onclick="clientManager.deleteClient(${index})" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`).join('');
    }

updateStatus(index, newStatus) {
    this.pendingStatusIndex = index;
    this.pendingStatusNewValue = newStatus;

    const client = this.clients[index];
    const confirmMessage = document.getElementById('confirmMessage');

    // Updated IDs to match your HTML:
    let remarksInput = document.getElementById('remarks');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const projectFields = document.getElementById('projectFields');
    let projectNameInput = document.getElementById('projectname');
    let projectDescInput = document.getElementById('allocProjectDescription');

    confirmMessage.textContent = `Are you sure you want to change ${client.companyName} status to ${newStatus}?`;

    if (newStatus.toLowerCase() === 'onboard') {
        projectFields.style.display = 'block';
        if (projectNameInput) projectNameInput.required = true;
        if (projectDescInput) projectDescInput.required = true;
    } else {
        projectFields.style.display = 'none';
        if (projectNameInput) {
            projectNameInput.required = false;
            projectNameInput.value = '';
        }
        if (projectDescInput) {
            projectDescInput.required = false;
            projectDescInput.value = '';
        }
    }

    // Clear all inputs
    if (remarksInput) remarksInput.value = '';
    if (projectNameInput) projectNameInput.value = '';
    if (projectDescInput) projectDescInput.value = '';

    // Disable Yes button initially
    confirmYesBtn.disabled = true;
    confirmYesBtn.style.opacity = '0.5';
    confirmYesBtn.style.cursor = 'not-allowed';

    // Validation function
    const validateFields = () => {
        console.log('hi')
        const remarksFilled = remarksInput && remarksInput.value.trim() !== '';
        if (newStatus.toLowerCase() === 'onboard') {
            const projectNameFilled = projectNameInput && projectNameInput.value.trim() !== '';
            const projectDescFilled = projectDescInput && projectDescInput.value.trim() !== '';
            if (remarksFilled && projectNameFilled) {
                confirmYesBtn.disabled = false;
                confirmYesBtn.style.opacity = '1';
                confirmYesBtn.style.cursor = 'pointer';
            } else {
                confirmYesBtn.disabled = true;
                confirmYesBtn.style.opacity = '0.5';
                confirmYesBtn.style.cursor = 'not-allowed';
            }
        } else {
            if (remarksFilled) {
                confirmYesBtn.disabled = false;
                confirmYesBtn.style.opacity = '1';
                confirmYesBtn.style.cursor = 'pointer';
            } else {
                confirmYesBtn.disabled = true;
                confirmYesBtn.style.opacity = '0.5';
                confirmYesBtn.style.cursor = 'not-allowed';
            }
        }
    };

    // Clone inputs to remove old listeners & re-assign references
   // Clone inputs to remove old event listeners and update variables
        if (remarksInput) {
            const newRemarksInput = remarksInput.cloneNode(true);
            remarksInput.parentNode.replaceChild(newRemarksInput, remarksInput);
            remarksInput = newRemarksInput;
            remarksInput.addEventListener('input', validateFields);
        }

        if (newStatus.toLowerCase() === 'onboard') {
            if (projectNameInput) {
                const newProjectNameInput = projectNameInput.cloneNode(true);
                projectNameInput.parentNode.replaceChild(newProjectNameInput, projectNameInput);
                projectNameInput = newProjectNameInput;
                projectNameInput.addEventListener('input', validateFields);
            }
          if (projectDescInput) {
                const newProjectDescInput = projectDescInput.cloneNode(true);
                projectDescInput.parentNode.replaceChild(newProjectDescInput, projectDescInput);
                projectDescInput = newProjectDescInput; // ✅ THIS LINE IS MISSING
                projectDescInput.addEventListener('input', validateFields);
            }

        }

    // Show modal & disable background scroll
    document.getElementById('confirmModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}




    viewClient(index) {
        const client = this.clients[index];
        const clientviewContent = document.getElementById('clientviewContent');

        clientviewContent.innerHTML = `
            <form class="clientform-scrollable-container" id="viewClientForm" novalidate>
                <h3 class="sticky-heading">Client Details</h3>
                <div class="client-details-grid">
                    <div class="form-group">
                        <label for="viewDate">Date *</label>
                        <input type="date" id="viewDate" name="Date" value="${client.Date ? new Date(client.Date).toISOString().split('T')[0] : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewCustomerId">Customer ID *</label>
                        <input type="text" id="viewCustomerId" name="customerId" value="${client.customerId || ''}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="viewCompanyName">Company Name *</label>
                        <input type="text" id="viewCompanyName" name="companyName" value="${client.companyName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewCustomerName">Customer Name *</label>
                        <input type="text" id="viewCustomerName" name="customerName" value="${client.customerName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewAddress">Address</label>
                        <textarea id="viewAddress" name="address" rows="3">${client.address || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="viewIndustryType">Industry Type</label>
                        <input type="text" id="viewIndustryType" name="industryType" value="${client.industryType || ''}">
                    </div>
                    <div class="form-group">
                        <label for="viewWebsite">Website</label>
                        <input type="url" id="viewWebsite" name="website" value="${client.website || ''}">
                    </div>
                    <div class="form-group">
                        <label for="viewReference">Reference</label>
                        <input type="text" id="viewReference" name="reference" value="${client.reference || ''}">
                    </div>
                    <div class="form-group">
                        <label for="viewRemarks">Remarks *</label>
                        <input type="text" id="viewRemarks" name="clientremarks" value="${client.remarks || ''}" required>
                    </div>
                </div>

                <h3 class="sticky-heading">Contact Details</h3>
                <div class="content-details-grid">
                    <div class="form-group">
                        <label for="viewContactPerson">Contact Person *</label>
                        <input type="text" id="viewContactPerson" name="contactPerson" value="${client.contactPerson || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewPhoneNo">Phone Number *</label>
                        <input type="tel" id="viewPhoneNo" name="phoneNo" value="${client.phoneNo || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewMailId">Mail ID *</label>
                        <input type="email" id="viewMailId" name="mailId" value="${client.mailId || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="viewDesignation">Designation *</label>
                        <input type="text" id="viewDesignation" name="designation" value="${client.designation || ''}" required>
                    </div>
                </div>
                 <div class="sticky-submit-container">
                <button type="button" class="btn btn-primary" onclick="clientManager.submitViewClientChanges(${index})">Submit</button>
            </div>
            </form>

        `;

        document.getElementById('clientviewModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(title, description) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<h4>${title}</h4><p>${description}</p>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }
}

const clientManager = new ClientManager();

function openForm() {
    document.getElementById('customerId').disabled = false;
    const modalTitle = document.querySelector('#clientModal .modal-title');
    if (modalTitle) modalTitle.textContent = 'Add New Client';
    clientManager.openForm();
}

function closeForm() {
    clientManager.closeForm();
}

function closeclientViewModal() {
    clientManager.closeclientViewModal();
}