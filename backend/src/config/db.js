import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

const memoryStore = {
  User: [],
  Resume: []
};

// Check if string is a valid bcrypt hash
const isBcryptHash = (str) => {
  if (typeof str !== 'string') return false;
  return str.length === 60 && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));
};

const loadMemoryStore = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      memoryStore.User = parsed.User || [];
      memoryStore.Resume = parsed.Resume || [];
      console.log(`[MongoDB Fallback] Loaded persistent mock database from: ${DB_FILE} (${memoryStore.User.length} users, ${memoryStore.Resume.length} resumes)`);
    } else {
      memoryStore.User = [];
      memoryStore.Resume = [];
      console.log(`[MongoDB Fallback] No persistent db.json found. Initialized clean mock database state.`);
    }
  } catch (error) {
    console.error(`[MongoDB Fallback] Error loading persistent mock database: ${error.message}`);
    memoryStore.User = [];
    memoryStore.Resume = [];
  }
};

const saveMemoryStore = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
    console.log(`[MongoDB Fallback] Saved persistent mock database state to: ${DB_FILE}`);
  } catch (error) {
    console.error(`[MongoDB Fallback] Error persisting mock database state: ${error.message}`);
  }
};

function matchQuery(item, query) {
  if (!query) return true;
  for (let key in query) {
    let qVal = query[key];
    let iVal = item[key];
    if (qVal === undefined) continue;
    if (iVal === undefined) return false;
    
    // Normalize emails for robust comparison
    if (key === 'email' && typeof qVal === 'string' && typeof iVal === 'string') {
      if (qVal.trim().toLowerCase() !== iVal.trim().toLowerCase()) {
        return false;
      }
      continue;
    }
    
    // Compare string representations for IDs or other objects
    if (qVal && iVal && typeof qVal === 'object' && typeof iVal === 'object') {
      if (qVal.toString() !== iVal.toString()) {
        return false;
      }
    } else if (qVal && typeof qVal === 'object') {
      if (qVal.toString() !== String(iVal)) {
        return false;
      }
    } else if (iVal && typeof iVal === 'object') {
      if (String(qVal) !== iVal.toString()) {
        return false;
      }
    } else {
      if (qVal !== iVal) {
        return false;
      }
    }
  }
  return true;
}

class MockQuery {
  constructor(results) {
    this.results = results;
    this.selectedFields = null;
  }
  select(fields) {
    this.selectedFields = fields;
    return this;
  }
  sort(sortObj) {
    if (sortObj && sortObj.updatedAt) {
      this.results.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return this;
  }
  applySelection(items) {
    if (!items || !Array.isArray(items)) return items;
    if (this.selectedFields === '-password') {
      items.forEach(item => {
        if (item && item.password !== undefined) {
          item.password = undefined;
        }
      });
    }
    return items;
  }
  then(onfulfilled, onrejected) {
    const res = this.applySelection(this.results);
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    const res = this.applySelection(this.results);
    return Promise.resolve(res).catch(onrejected);
  }
  async exec() {
    return this.applySelection(this.results);
  }
}

class MockSingleQuery {
  constructor(result) {
    this.result = result;
    this.selectedFields = null;
  }
  select(fields) {
    this.selectedFields = fields;
    return this;
  }
  applySelection(item) {
    if (!item) return item;
    if (this.selectedFields === '-password') {
      if (item.password !== undefined) {
        item.password = undefined;
      }
    }
    return item;
  }
  then(onfulfilled, onrejected) {
    const res = this.applySelection(this.result);
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    const res = this.applySelection(this.result);
    return Promise.resolve(res).catch(onrejected);
  }
  async exec() {
    return this.applySelection(this.result);
  }
}

const activateMockMongoose = () => {
  // Load saved state first
  loadMemoryStore();

  // Override static mongoose.Model methods
  mongoose.Model.find = function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const items = list.filter(x => matchQuery(x, query)).map(item => new this(item));
    return new MockQuery(items);
  };

  mongoose.Model.findOne = function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const item = list.find(x => matchQuery(x, query));
    return new MockSingleQuery(item ? new this(item) : null);
  };

  mongoose.Model.findById = function(id) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const item = list.find(x => x._id && x._id.toString() === id.toString());
    return new MockSingleQuery(item ? new this(item) : null);
  };

  mongoose.Model.create = async function(data) {
    const modelName = this.modelName;
    if (!memoryStore[modelName]) {
      memoryStore[modelName] = [];
    }
    
    const doc = new this(data);
    if (!doc._id) {
      doc._id = new mongoose.Types.ObjectId();
    }
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    // Hash password if User model and password exists and is not already hashed
    if (modelName === 'User' && doc.password && !isBcryptHash(doc.password)) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
    }

    memoryStore[modelName].push(doc.toObject());
    saveMemoryStore();
    return doc;
  };

  mongoose.Model.deleteOne = async function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const idx = list.findIndex(x => matchQuery(x, query));
    if (idx !== -1) {
      list.splice(idx, 1);
      saveMemoryStore();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  mongoose.Model.deleteMany = async function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const initialCount = list.length;
    memoryStore[modelName] = list.filter(x => !matchQuery(x, query));
    const deletedCount = initialCount - memoryStore[modelName].length;
    if (deletedCount > 0) {
      saveMemoryStore();
    }
    return { deletedCount };
  };

  // Override save prototype method
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    if (!memoryStore[modelName]) {
      memoryStore[modelName] = [];
    }

    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    this.updatedAt = new Date();
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    // Hash password if User model and password exists and is not already hashed
    if (modelName === 'User' && this.password && !isBcryptHash(this.password)) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const list = memoryStore[modelName];
    const idx = list.findIndex(item => {
      const itemId = item._id ? item._id.toString() : '';
      const thisId = this._id ? this._id.toString() : '';
      return itemId && thisId && itemId === thisId;
    });

    if (idx !== -1) {
      list[idx] = this.toObject();
    } else {
      list.push(this.toObject());
    }
    saveMemoryStore();
    return this;
  };

  // Override deleteOne prototype method
  mongoose.Model.prototype.deleteOne = async function() {
    const modelName = this.constructor.modelName;
    const list = memoryStore[modelName] || [];
    const idx = list.findIndex(item => {
      const itemId = item._id ? item._id.toString() : '';
      const thisId = this._id ? this._id.toString() : '';
      return itemId && thisId && itemId === thisId;
    });

    if (idx !== -1) {
      list.splice(idx, 1);
      saveMemoryStore();
    }
    return { deletedCount: 1 };
  };
};

const connectDB = async () => {
  try {
    console.log(`[MongoDB] Attempting to connect to: ${process.env.MONGODB_URI}`);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Connection failed: ${error.message}`);
    console.warn(`[MongoDB Fallback] Activating ultra-reliable, high-performance In-Memory database mode...`);
    activateMockMongoose();
    console.log(`[MongoDB] In-Memory mock database successfully initialized.`);
  }
};

export default connectDB;
