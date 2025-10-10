class ClientManager {
    constructor() {
        this.clients = [];
        this.pendingStatusIndex = null;
        this.pendingStatusNewValue = null;
        this.initializeEventListeners();
        this.setDefaultDate();
    }

    initializeEventListeners() {
        document.getElementById('clientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        document.getElementById('clientModal').addEventListener('click', (e) => {
            if (e.target.id === 'clientModal') this.closeForm();
        });

        document.getElementById('viewModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewModal') this.closeViewModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeForm();
                this.closeViewModal();
            }
        document.getElementById('confirmYesBtn').addEventListener('click', () => {
        this.confirmStatusChange(true);
           });
        document.getElementById('confirmNoBtn').addEventListener('click', () => {
        this.confirmStatusChange(false);
           });
        });
    }

    

    setDefaultDate() {
        const today = new Date().toISOString().split('T');
        document.getElementById('createdDate').value = today;
    }

    openForm() {
        document.getElementById('clientModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeForm() {
        document.getElementById('clientModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    closeViewModal() {
        document.getElementById('viewModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    resetForm() {
        document.getElementById('clientForm').reset();
        this.setDefaultDate();
    }

    handleFormSubmit() {
        const formData = new FormData(document.getElementById('clientForm'));
        const clientData = {
            id: Date.now().toString(),
            customerId: formData.get('customerId'),
            companyName: formData.get('companyName'),
            customerName: formData.get('customerName'),
            createdDate: formData.get('createdDate'),
            industrySegment: formData.get('industrySegment') || 'N/A',
            manufacturersOf: formData.get('manufacturersOf') || 'N/A',
            reference: formData.get('reference') || 'N/A',
            repeatedClient: formData.get('repeatedClient'),
            contactPerson: formData.get('contactPerson') || 'N/A',
            gstNo: formData.get('gstNo') || 'N/A',
            phoneNo: formData.get('phoneNo'),
            mailId: formData.get('mailId'),
            address: formData.get('address') || 'N/A',
            status: 'none'
        };
        this.addClient(clientData);
        this.closeForm();
        this.showToast('Client Added Successfully', `${clientData.customerName} has been added to the client list.`);
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
                    <td colspan="8">
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
                    <select class="status-badge status-${client.status}" onchange="clientManager.updateStatus(${index}, this.value)">
                        <option value="lead" ${client.status.toLowerCase() === 'lead' ? 'selected' : ''}>Lead</option>
                        <option value="drop" ${client.status.toLowerCase() === 'drop' ? 'selected' : ''}>Drop</option>
                        <option value="onboard" ${client.status.toLowerCase() === 'onboard' ? 'selected' : ''}>Onboard</option>
                        <option value="quotation" ${client.status.toLowerCase() === 'quotation' ? 'selected' : ''}>Quotation</option>
                        <option value="inprogress" ${client.status.toLowerCase().replace(/\s+/g, '') === 'inprogress' ? 'selected' : ''}>In progress</option>
                        <option value="notinterest" ${client.status.toLowerCase().replace(/\s+/g, '') === 'notinterest' ? 'selected' : ''}>Not Interest</option>
                    </select>

                </td>
                <td>${this.formatDate(client.createdDate)}</td>
                <td>${client.customerId}</td>
                <td>${client.companyName}</td>
                <td>${client.customerName}</td>
                <td>${client.phoneNo}</td>
                <td>${client.mailId}</td>
                <td>
                    <button class="view-btn" onclick="clientManager.viewClient(${index})">View</button>
                </td>
            </tr>`).join('');
    }

   updateStatus(index, newStatus) {
    // Store pending change info
    this.pendingStatusIndex = index;
    this.pendingStatusNewValue = newStatus;

    const client = this.clients[index];
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = `Are you sure you want to change ${client.companyName} status to ${newStatus} ?`;

    // Show confirm modal
    document.getElementById('confirmModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

confirmStatusChange(confirmed) {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.classList.remove('show');
    document.body.style.overflow = 'auto';

    if (confirmed) {
        // Apply the status change
        const index = this.pendingStatusIndex;
        const newStatus = this.pendingStatusNewValue;
        this.clients[index].status = newStatus;

        const selectElement = document.querySelector(`tr:nth-child(${index + 1}) select`);
        selectElement.className = `status-badge status-${newStatus}`;
        selectElement.value = newStatus;

        // Do NOT show any toast message as requested
    } else {
        // Revert dropdown to old status on cancellation
        if (this.pendingStatusIndex !== null) {
            const selectElement = document.querySelector(`tr:nth-child(${this.pendingStatusIndex + 1}) select`);
            selectElement.value = this.clients[this.pendingStatusIndex].status;
        }
    }

    // Clear pending info
    this.pendingStatusIndex = null;
    this.pendingStatusNewValue = null;
}




    viewClient(index) {
        const client = this.clients[index];
        const viewContent = document.getElementById('viewContent');
        viewContent.innerHTML = `
            <div class="view-grid">
            <div class="view-item"><h4>Status</h4><p style="text-transform: capitalize;">${client.status}</p></div>
                <div class="view-item"><h4>Customer ID</h4><p>${client.customerId}</p></div>
                <div class="view-item"><h4>Company Name</h4><p>${client.companyName}</p></div>
                <div class="view-item" style="grid-column: 1 / -1;">
                    <h4>Address</h4><p>${client.address}</p>
                </div>
                <div class="view-item"><h4>Customer Name</h4><p>${client.customerName}</p></div>
                <div class="view-item"><h4>Contact Person</h4><p>${client.contactPerson}</p></div>
                <div class="view-item"><h4>Phone No</h4><p>${client.phoneNo}</p></div>
                <div class="view-item"><h4>Mail ID</h4><p>${client.mailId}</p></div>
                <div class="view-item"><h4>Repeated Client</h4><p>${client.repeatedClient === 'yes' ? 'Yes' : 'No'}</p></div>
                <div class="view-item"><h4>Industry Segment</h4><p>${client.industrySegment}</p></div>
                <div class="view-item"><h4>Manufacturers Of</h4><p>${client.manufacturersOf}</p></div>
                <div class="view-item"><h4>Reference</h4><p>${client.reference}</p></div>
                <div class="view-item"><h4>GST No</h4><p>${client.gstNo}</p></div>
                <div class="view-item"><h4>Created Date</h4><p>${this.formatDate(client.createdDate)}</p></div>
            </div>`;
        document.getElementById('viewModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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


// Initialize the client manager
const clientManager = new ClientManager();

// Demo clients data
const demoClients = [
    {
        id: '1',
        customerId: 'C1001',
        companyName: 'Acme Corp',
        customerName: 'John Doe',
        createdDate: '2025-09-01',
        industrySegment: 'Manufacturing',
        manufacturersOf: 'Widgets',
        reference: 'Referral',
        repeatedClient: 'no',
        contactPerson: 'Jane Smith',
        gstNo: 'GSTIN12345',
        phoneNo: '9876543210',
        mailId: 'john.doe@acme.com',
        address: '123 Main Street, Chennai',
        status: 'onboard'
    },
    {
        id: '2',
        customerId: 'C1002',
        companyName: 'Globex Ltd.',
        customerName: 'Alice Lee',
        createdDate: '2025-09-03',
        industrySegment: 'IT Services',
        manufacturersOf: 'Software',
        reference: 'Website',
        repeatedClient: 'yes',
        contactPerson: 'Bob Brown',
        gstNo: 'GSTIN67890',
        phoneNo: '9123456780',
        mailId: 'alice.lee@globex.com',
        address: '456 Park Avenue, Coimbatore',
        status: 'quatation'
    }
];

// Add demo clients to the table
demoClients.forEach(client => clientManager.addClient(client));


// Global functions for HTML onclick handlers
function openForm() {
    clientManager.openForm();
}

function closeForm() {
    clientManager.closeForm();
}

function closeViewModal() {
    clientManager.closeViewModal();
}
