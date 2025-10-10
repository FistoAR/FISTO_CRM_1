// Essential Configuration and Data Storage
// config.js - Streamlined version

// ============= DATA STORAGE =============
// Keep these as they contain actual application data

// Quotes data for special day management
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

// Special days data
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

// Leave requests data
let leaveRequests = [
    {
        id: 1,
        employee: 'John Doe',
        department: 'Engineering',
        type: 'Annual Leave',
        reason: 'Family vacation',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        duration: 5,
        status: 'pending',
        submitted: '2025-07-15',
        comments: ''
    }
];

// Default inspirational quotes for dashboard
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

// ============= APPLICATION STATE =============
// Keep these for backward compatibility with existing functions

let editingItem = null;
let editingType = null;
let isLoggedIn = true;
let activities = [];
let currentTab = {};

// ============= UTILITY FUNCTIONS =============
// Keep these if other parts of your application use them

// Get random quote for dashboard
function getRandomQuote() {
    return defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
}

// Data manipulation functions
function addQuote(quote) {
    const newId = Math.max(...quotes.map(q => q.id), 0) + 1;
    quotes.push({ ...quote, id: newId });
}

function updateQuote(id, updatedQuote) {
    const index = quotes.findIndex(q => q.id === id);
    if (index !== -1) {
        quotes[index] = { ...quotes[index], ...updatedQuote };
    }
}

function deleteQuote(id) {
    quotes = quotes.filter(q => q.id !== id);
}

function addSpecialDay(specialDay) {
    const newId = Math.max(...specialDays.map(s => s.id), 0) + 1;
    specialDays.push({ ...specialDay, id: newId });
}

function updateSpecialDay(id, updatedDay) {
    const index = specialDays.findIndex(s => s.id === id);
    if (index !== -1) {
        specialDays[index] = { ...specialDays[index], ...updatedDay };
    }
}

function deleteSpecialDay(id) {
    specialDays = specialDays.filter(s => s.id !== id);
}

function addLeaveRequest(request) {
    const newId = Math.max(...leaveRequests.map(r => r.id), 0) + 1;
    leaveRequests.push({ ...request, id: newId });
}

function updateLeaveRequest(id, updatedRequest) {
    const index = leaveRequests.findIndex(r => r.id === id);
    if (index !== -1) {
        leaveRequests[index] = { ...leaveRequests[index], ...updatedRequest };
    }
}

function deleteLeaveRequest(id) {
    leaveRequests = leaveRequests.filter(r => r.id !== id);
}

// ============= EXPORT FOR MODULE USAGE =============
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        quotes,
        specialDays,
        leaveRequests,
        defaultQuotes,
        editingItem,
        editingType,
        isLoggedIn,
        activities,
        currentTab,
        getRandomQuote,
        addQuote,
        updateQuote,
        deleteQuote,
        addSpecialDay,
        updateSpecialDay,
        deleteSpecialDay,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest
    };
}