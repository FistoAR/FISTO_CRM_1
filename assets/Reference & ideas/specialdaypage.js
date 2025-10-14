// Data storage (in production, this would connect to a backend)
let quotes = [
    {
        id: 1,
        date: '2024-12-15',
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs'
    },
    {
        id: 2,
        date: '2024-12-20',
        text: 'Innovation distinguishes between a leader and a follower.',
        author: 'Steve Jobs'
    }
];

let specialDays = [
    {
        id: 1,
        date: '2024-12-25',
        name: 'Christmas Day',
        category: 'Holiday',
        quote: 'Christmas is not a time nor a season, but a state of mind.',
        description: 'Annual Christmas celebration'
    },
    {
        id: 2,
        date: '2025-01-01',
        name: 'New Year\'s Day',
        category: 'Holiday',
        quote: 'Tomorrow is the first day of the rest of your life.',
        description: 'Welcome the new year with hope and determination'
    }
];

let editingItem = null;
let editingType = null;

// Default inspirational quotes
const defaultQuotes = [
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
];

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

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
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
    
    renderQuotesTable();
    showNotification('Quote added successfully!', 'success');
}

function renderQuotesTable() {
    const tbody = document.getElementById('quotesTableBody');
    
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

    // Sort quotes by date (newest first)
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
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    renderSpecialDaysTable();
    renderUpcomingEvents();
    showNotification('Special day added successfully!', 'success');
}

function renderSpecialDaysTable() {
    const tbody = document.getElementById('specialDaysTableBody');
    
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

    // Sort special days by date (newest first)
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

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showRandomQuote() {
    // Combine user quotes with default quotes for random selection
    const allQuotes = [...quotes, ...defaultQuotes];
    
    if (allQuotes.length > 0) {
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        document.getElementById('randomQuote').innerHTML = `
            <p>"${randomQuote.text}"</p>
            <div class="quote-author">- ${randomQuote.author}</div>
        `;
    }
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search functionality
function searchQuotes(searchTerm) {
    const filteredQuotes = quotes.filter(quote => 
        quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.date.includes(searchTerm)
    );
    
    renderFilteredQuotes(filteredQuotes);
}

function searchSpecialDays(searchTerm) {
    const filteredEvents = specialDays.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.date.includes(searchTerm)
    );
    
    renderFilteredSpecialDays(filteredEvents);
}

// Export data functionality
function exportQuotes() {
    const data = quotes.map(quote => ({
        Date: quote.date,
        Quote: quote.text,
        Author: quote.author
    }));
    
    downloadJSON(data, 'motivation_quotes.json');
}

function exportSpecialDays() {
    const data = specialDays.map(event => ({
        Date: event.date,
        Event: event.name,
        Category: event.category,
        Quote: event.quote,
        Description: event.description
    }));
    
    downloadJSON(data, 'special_days.json');
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize page
function initializePage() {
    try {
        // Set up event listeners
        document.getElementById('quoteForm').addEventListener('submit', addQuote);
        document.getElementById('specialDayForm').addEventListener('submit', addSpecialDay);
        document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

        // Set default dates to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quoteDate').value = today;
        document.getElementById('eventDate').value = today;

        // Render initial data
        renderQuotesTable();
        renderSpecialDaysTable();
        renderUpcomingEvents();
        showRandomQuote();

        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Handle escape key for modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('editModal').style.display === 'block') {
                closeModal();
            }
        });

        console.log('Special Day Management system initialized successfully');
        
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error initializing the application', 'error');
    }
}

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', initializePage);