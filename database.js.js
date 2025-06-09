// Simple local database for family management using localStorage

const STORAGE_KEY = "familyDB";

const familyDB = {
  // Load all data from localStorage
  _loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { members: [] };
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { members: [] };
    }
  },

  // Save data to localStorage
  _saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Add a new member
  addMember(member) {
    const data = this._loadData();
    // Check if Aadhaar already exists
    if (data.members.some(m => m.aadhar === member.aadhar)) {
      throw new Error("Aadhaar already exists");
    }
    // Add date
    member.addedDate = new Date().toISOString();
    data.members.push(member);
    this._saveData(data);
    return member;
  },

  // Get all members
  getAllMembers() {
    const data = this._loadData();
    return data.members || [];
  },

  // Get members by Jan Aadhaar
  getFamilyMembers(jan_aadhar) {
    const data = this._loadData();
    return data.members.filter(m => m.jan_aadhar === jan_aadhar);
  },

  // Get stats (total members, total families)
  getStats() {
    const members = this.getAllMembers();
    const totalMembers = members.length;
    const familiesSet = new Set(members.map(m => m.jan_aadhar));
    const totalFamilies = familiesSet.size;
    return { totalMembers, totalFamilies };
  },

  // Export all data
  exportData() {
    return this._loadData();
  },

  // Import data (replace all)
  importData(newData) {
    if (!newData || !Array.isArray(newData.members)) {
      throw new Error("Invalid data format");
    }
    // Optionally validate each member object here
    this._saveData({ members: newData.members });
  }
};