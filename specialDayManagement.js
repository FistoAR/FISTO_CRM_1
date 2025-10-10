// Special day and quote management functions
// specialDayManagement.js

// Quote management functions
function addQuote(event) {
    event.preventDefault();
    
    const date = document.getElementById('quoteDate').value;
    const text = document.getElementById('quoteText').value.trim();
    const author = document.getElementById('quoteAuthor').value.trim() || 'Unknown';

    if (!date || !text) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const newQuote = {
        id: Date.now(),
        date: date,
        text: text,
        author: author
    };

    quotes.push(newQuote);
    document.getElementById('quoteForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    
    renderQuotesTable();
    showNotification('Quote added successfully!', 'success');
}

function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');
    if (!tbody) return;
    
    if (quotes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-quote-right"></i>
                    <h4>No quotes added yet</h4>
                    <p>Start by adding your first motivational quote!</p>
                </td>
            </tr>
        `;
        return;
    }

    const sortedQuotes = [...quotes].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedQuotes.map(quote => `
        <tr>
            <td>${formatDate(quote.date)}</td>
            <td style="max-width: 300px; word-wrap: break-word;">${quote.text}</td>
            <td>${quote.author}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editQuote(${quote.id})" title="Edit Quote">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteQuote(${quote.id})" title="Delete Quote">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editQuote(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;

    editingItem = quote;
    editingType = 'quote';

    document.getElementById('modalTitle').textContent = 'Edit Quote';
    document.getElementById('modalContent').innerHTML = `
        <div class="form-group">
            <label for="editQuoteDate">Date *</label>
            <input type="date" id="editQuoteDate" value="${quote.date}" required>
        </div>
        <div class="form-group">
            <label for="editQuoteText">Quote *</label>
            <textarea id="editQuoteText" required>${quote.text}</textarea>
        </div>
        <div class="form-group">
            <label for="editQuoteAuthor">Author</label>
            <input type="text" id="editQuoteAuthor" value="${quote.author}" placeholder="Quote author or source">
        </div>
    `;

    document.getElementById('editModal').style.display = 'block';
}

function deleteQuote(id) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes = quotes.filter(q => q.id !== id);
        renderQuotesTable();
        showNotification('Quote deleted successfully!', 'success');
    }
}

// Special Days management functions
function addSpecialDay(event) {
    event.preventDefault();
    
    const date = document.getElementById('eventDate').value;
    const name = document.getElementById('eventName').value.trim();
    const category = document.getElementById('eventCategory').value;
    const quote = document.getElementById('eventQuote').value.trim();
    const description = document.getElementById('eventDescription').value.trim();

    if (!date || !name || !category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const newEvent = {
        id: Date.now(),
        date: date,
        name: name,
        category: category,
        quote: quote || '',
        description: description || ''
    };

    specialDays.push(newEvent);
    document.getElementById('specialDayForm').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    renderSpecialDaysTable();
    renderUpcomingEvents();
    showNotification('Special day added successfully!', 'success');
}

function renderSpecialDaysTable() {
    const tbody = document.getElementById('specialDaysTableBody');
    if (!tbody) return;
    
    if (specialDays.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>No special days added yet</h4>
                    <p>Start by adding your first special day!</p>
                </td>
            </tr>
        `;
        return;
    }

    const sortedEvents = [...specialDays].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedEvents.map(event => `
        <tr>
            <td>${formatDate(event.date)}</td>
            <td>${event.name}</td>
            <td><span class="category-badge badge-${event.category.toLowerCase()}">${event.category}</span></td>
            <td style="max-width: 200px; word-wrap: break-word;">${event.quote || 'No quote'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editSpecialDay(${event.id})" title="Edit Special Day">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteSpecialDay(${event.id})" title="Delete Special Day">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;

    const today = new Date();
    const upcoming = specialDays
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h4>No upcoming events</h4>
                <p>Add some special days to see them here!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = upcoming.map(event => {
        const daysUntil = Math.ceil((new Date(event.date) - today) / (1000 * 60 * 60 * 24));
        const timeText = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
        
        return `
            <div class="upcoming-event">
                <div class="event-header">
                    <div class="event-name">${event.name}</div>
                    <span class="category-badge badge-${event.category.toLowerCase()}">${event.category}</span>
                </div>
                <div class="event-date">${formatDate(event.date)} • ${timeText}</div>
                ${event.quote ? `<div class="event-quote">"${event.quote}"</div>` : ''}
                ${event.description ? `<div style="color: #666; font-size: 0.85rem; margin-top: 0.25rem;">${event.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

function editSpecialDay(id) {
    console.log("helo")
    const event = specialDays.find(e => e.id === id);
    if (!event) return;

    editingItem = event;
    editingType = 'specialday';

    document.getElementById('modalTitle').textContent = 'Edit Special Day';
    document.getElementById('modalContent').innerHTML = `
        <div class="form-group">
            <label for="editEventDate">Date *</label>
            <input type="date" id="editEventDate" value="${event.date}" required>
        </div>
        <div class="form-group">
            <label for="editEventName">Event Name *</label>
            <input type="text" id="editEventName" value="${event.name}" required>
        </div>
        <div class="form-group">
            <label for="editEventCategory">Category *</label>
            <select id="editEventCategory" required>
                <option value="Birthday" ${event.category === 'Birthday' ? 'selected' : ''}>Birthday</option>
                <option value="Holiday" ${event.category === 'Holiday' ? 'selected' : ''}>Holiday</option>
                <option value="Announcement" ${event.category === 'Announcement' ? 'selected' : ''}>Announcement</option>
            </select>
        </div>
        <div class="form-group">
            <label for="editEventQuote">Quote (Optional)</label>
            <textarea id="editEventQuote" placeholder="Add a special quote for this day...">${event.quote}</textarea>
        </div>
        <div class="form-group">
            <label for="editEventDescription">Description</label>
            <textarea id="editEventDescription" placeholder="Additional details about this special day...">${event.description}</textarea>
        </div>
    `;

    document.getElementById('editModal').style.display = 'block';
}

function deleteSpecialDay(id) {
    if (confirm('Are you sure you want to delete this special day?')) {
        specialDays = specialDays.filter(e => e.id !== id);
        renderSpecialDaysTable();
        renderUpcomingEvents();
        showNotification('Special day deleted successfully!', 'success');
    }
}

// Modal functions
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    editingItem = null;
    editingType = null;
}

function saveEdit() {
    if (!editingItem || !editingType) return;

    try {
        if (editingType === 'quote') {
            const date = document.getElementById('editQuoteDate').value;
            const text = document.getElementById('editQuoteText').value.trim();
            const author = document.getElementById('editQuoteAuthor').value.trim() || 'Unknown';

            if (!date || !text) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            editingItem.date = date;
            editingItem.text = text;
            editingItem.author = author;
            renderQuotesTable();
            
        } else if (editingType === 'specialday') {
            const date = document.getElementById('editEventDate').value;
            const name = document.getElementById('editEventName').value.trim();
            const category = document.getElementById('editEventCategory').value;
            const quote = document.getElementById('editEventQuote').value.trim();
            const description = document.getElementById('editEventDescription').value.trim();

            if (!date || !name || !category) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            editingItem.date = date;
            editingItem.name = name;
            editingItem.category = category;
            editingItem.quote = quote;
            editingItem.description = description;
            renderSpecialDaysTable();
            renderUpcomingEvents();
        }

        closeModal();
        showNotification('Changes saved successfully!', 'success');
        
    } catch (error) {
        showNotification('Error saving changes. Please try again.', 'error');
        console.error('Save error:', error);
    }
}

// Tab switching functionality for special day management
function switchSpecialDayTab(tabName) {
    // Get the special day content section to scope our queries
    const specialDaySection = document.getElementById('specialday-content');
    if (!specialDaySection) return;
    
    // Hide all tabs within this section
    specialDaySection.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons within this section
    specialDaySection.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Activate the correct button based on tabName
    const buttons = specialDaySection.querySelectorAll('.tab-btn');
    if (tabName === 'quotes' && buttons[0]) {
        buttons[0].classList.add('active');
    } else if (tabName === 'specialdays' && buttons[1]) {
        buttons[1].classList.add('active');
    }
}

// Make functions globally available
window.addQuote = addQuote;
window.renderQuotesTable = renderQuotesTable;
window.editQuote = editQuote;
window.switchSpecialDayTab = switchSpecialDayTab;
window.deleteQuote = deleteQuote;
window.addSpecialDay = addSpecialDay;
window.renderSpecialDaysTable = renderSpecialDaysTable;
window.renderUpcomingEvents = renderUpcomingEvents;
window.editSpecialDay = editSpecialDay;
window.deleteSpecialDay = deleteSpecialDay;
window.closeModal = closeModal;
window.saveEdit = saveEdit;