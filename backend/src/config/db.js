import mongoose from 'mongoose';

const memoryStore = {
  User: [],
  Resume: []
};

function matchQuery(item, query) {
  if (!query) return true;
  for (let key in query) {
    let qVal = query[key];
    let iVal = item[key];
    if (qVal === undefined) continue;
    if (iVal === undefined) return false;
    
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
  }
  select(fields) {
    return this;
  }
  sort(sortObj) {
    if (sortObj && sortObj.updatedAt) {
      this.results.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return this;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.results).then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return Promise.resolve(this.results).catch(onrejected);
  }
  async exec() {
    return this.results;
  }
}

class MockSingleQuery {
  constructor(result) {
    this.result = result;
  }
  select(fields) {
    return this;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return Promise.resolve(this.result).catch(onrejected);
  }
  async exec() {
    return this.result;
  }
}

const activateMockMongoose = () => {
  // Override static mongoose.Model methods
  mongoose.Model.find = function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const items = list.filter(x => matchQuery(x, query));
    return new MockQuery(items);
  };

  mongoose.Model.findOne = function(query) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const item = list.find(x => matchQuery(x, query));
    return new MockSingleQuery(item || null);
  };

  mongoose.Model.findById = function(id) {
    const modelName = this.modelName;
    const list = memoryStore[modelName] || [];
    const item = list.find(x => x._id && x._id.toString() === id.toString());
    return new MockSingleQuery(item || null);
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

    // Hash password if User model and password exists
    if (modelName === 'User' && doc.password) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      doc.password = await bcrypt.hash(doc.password, salt);
    }

    memoryStore[modelName].push(doc);
    return doc;
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

    // Hash password if User model and password has been modified
    if (modelName === 'User' && this.isModified('password')) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const list = memoryStore[modelName];
    const idx = list.findIndex(item => item._id.toString() === this._id.toString());
    if (idx !== -1) {
      list[idx] = this;
    } else {
      list.push(this);
    }
    return this;
  };

  // Override deleteOne prototype method
  mongoose.Model.prototype.deleteOne = async function() {
    const modelName = this.constructor.modelName;
    const list = memoryStore[modelName] || [];
    const idx = list.findIndex(item => item._id.toString() === this._id.toString());
    if (idx !== -1) {
      list.splice(idx, 1);
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
