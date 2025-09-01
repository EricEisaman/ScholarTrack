import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import { promises as fs } from 'fs';

// Database row interfaces
interface StyleSettingsRow {
  id: string
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  quaternaryColor: string
  schoolName: string
  logoImage: string
  updatedAt: string
}

interface TransactionRow {
  id: number
  studentLabel: string
  studentIdentifier: string
  status: string
  timestamp: string
  className: string
  eventType?: string
  memo?: string
}

// Request data interfaces
interface StudentData {
  id: string
  label: string
  code: string
  emoji: string
  classes: string[]
  createdAt: string
}

// Database result interfaces
interface StudentRow {
  id: string
  label: string
  code: string
  emoji: string
  classes: string
  createdAt: string
}

interface ClassRow {
  id: string
  name: string
  createdAt: string
}

interface TransactionRow {
  id: number
  studentLabel: string
  studentCode?: string
  studentIdentifier: string
  status: string
  timestamp: string
  className: string
  eventType?: string
  memo?: string
}

interface ClassData {
  id: string
  name: string
  createdAt: string
}

interface TransactionData {
  id: number
  studentLabel: string
  studentCode?: string
  studentIdentifier: string
  status: string
  timestamp: string
  className: string
  eventType?: string
  memo?: string
}

interface StyleSettingsData {
  id: string
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  quaternaryColor: string
  schoolName: string
  logoImage: string
  updatedAt: string
}

interface CustomStatusTypeData {
  id: string
  name: string
  color: string
  createdAt: string
}

interface CustomTeacherEventTypeData {
  id: string
  name: string
  createdAt: string
}

interface StyleSettingsRow {
  id: string
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  quaternaryColor: string
  schoolName: string
  logoImage: string
  updatedAt: string
}

const app = express();
const PORT = process.env['PORT'] ?? 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database setup
const db = new Database('scholartrack.db');

// Icon validation function
const validateIcon = async (filePath: string): Promise<void> => {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error(`Empty icon file: ${filePath}`);
    }
    // Icon validated successfully
  } catch (error) {
    // Icon validation failed
    throw error;
  }
};

// Validate PWA icons
const validatePWAIcons = async (): Promise<void> => {
  if (process.env['NODE_ENV'] === 'production') {
    const iconPath = path.join(__dirname, '../../client/dist/icons');
    const requiredIcons = ['icon-192x192.png', 'icon-512x512.png'];

    // Validating PWA icons...
    for (const icon of requiredIcons) {
      await validateIcon(path.join(iconPath, icon));
    }
    // All PWA icons validated successfully
  }
};

// Initialize database tables
const initDatabase = (): void => {
  db.serialize(() => {
    // Students table - CORRECTED: Code is the primary identifier, label+emoji must be unique
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        code TEXT PRIMARY KEY,
        id TEXT NOT NULL,
        label TEXT NOT NULL,
        emoji TEXT NOT NULL,
        classes TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        UNIQUE(label, emoji)
      )
    `);

    // Classes table
    db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Transactions table - EMERGENCY FIX: Made studentCode optional
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentLabel TEXT NOT NULL,
        studentCode TEXT,
        studentIdentifier TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        className TEXT NOT NULL,
        eventType TEXT,
        FOREIGN KEY (studentCode) REFERENCES students (code)
      )
    `);

    // Style Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS styleSettings (
        id TEXT PRIMARY KEY,
        primaryColor TEXT NOT NULL,
        secondaryColor TEXT NOT NULL,
        tertiaryColor TEXT NOT NULL DEFAULT '#000000',
        quaternaryColor TEXT NOT NULL DEFAULT '#121212',
        logoImage TEXT,
        schoolName TEXT NOT NULL DEFAULT 'ScholarTrack',
        updatedAt TEXT NOT NULL
      )
    `);

    // Custom Status Types table
    db.run(`
      CREATE TABLE IF NOT EXISTS customStatusTypes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL,
        includeMemo INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);

    // Custom Teacher Event Types table
    db.run(`
      CREATE TABLE IF NOT EXISTS customTeacherEventTypes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        includeMemo INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `);

    // Migration: Add studentIdentifier column if it doesn't exist
    db.run(`
      ALTER TABLE transactions ADD COLUMN studentIdentifier TEXT
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding studentIdentifier column:', err);
      }
    });

    // Migration: Add schoolName column to styleSettings if it doesn't exist
    db.run(`
      ALTER TABLE styleSettings ADD COLUMN schoolName TEXT DEFAULT 'ScholarTrack'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding schoolName column:', err);
      }
    });

    // Migration: Add tertiaryColor column to styleSettings if it doesn't exist
    db.run(`
      ALTER TABLE styleSettings ADD COLUMN tertiaryColor TEXT DEFAULT '#000000'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding tertiaryColor column:', err);
      }
    });

    // Migration: Add quaternaryColor column to styleSettings if it doesn't exist
    db.run(`
      ALTER TABLE styleSettings ADD COLUMN quaternaryColor TEXT DEFAULT '#121212'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding quaternaryColor column:', err);
      }
    });

    // Migration: Add studentCode column to transactions if it doesn't exist
    db.run(`
      ALTER TABLE transactions ADD COLUMN studentCode TEXT
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding studentCode column:', err);
      }
    });

    // Migration: Add memo column to transactions if it doesn't exist
    db.run(`
      ALTER TABLE transactions ADD COLUMN memo TEXT
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding memo column:', err);
      }
    });

    // SAFE MIGRATION: Handle existing data with label+emoji unique constraint
    db.run(`
      CREATE TABLE IF NOT EXISTS students_temp (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        emoji TEXT NOT NULL,
        classes TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        UNIQUE(label, emoji)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating temp students table:', err);
        return;
      }

      // Check if we need to migrate (only if old table exists with different schema)
      db.get('PRAGMA table_info(students)', (err, _rows) => {
        if (err) {
          // Students table does not exist, will be created with new schema
          return;
        }

        // Check if the table has the old UNIQUE constraint on label
        db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='students'", (err, result) => {
          if (err || !result) return;

          interface TableInfo {
            sql: string
          }

          const tableInfo = result as TableInfo;
          const tableSql = tableInfo.sql;
          if (tableSql.includes('label TEXT UNIQUE')) {
            // Migrating students table to new schema...

            // Copy data with conflict resolution
            db.run(`
              INSERT OR IGNORE INTO students_temp 
              SELECT id, label, code, emoji, classes, createdAt 
              FROM students
            `, (err) => {
              if (err) {
                console.error('Error migrating students data:', err);
                return;
              }

              // Successfully migrated students to new schema

              // Drop old table and rename new table
              db.run('DROP TABLE students', (err) => {
                if (err) {
                  console.error('Error dropping old students table:', err);
                  return;
                }

                db.run('ALTER TABLE students_temp RENAME TO students', (err) => {
                  if (err) {
                    console.error('Error renaming students table:', err);
                  } else {
                    // Successfully migrated students table to use label+emoji unique constraint
                  }
                });
              });
            });
          } else {
            // Students table already has correct schema
          }
        });
      });
    });
  });
};

// API Routes

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Debug endpoint to check current students
app.get('/api/debug/students', (_req, res) => {
  db.all('SELECT id, label, emoji, code FROM students ORDER BY label, emoji', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      count: rows.length, 
      students: rows,
      timestamp: new Date().toISOString()
    });
  });
});

// Debug endpoint to check specific label conflicts
app.get('/api/debug/students/:label', (req, res) => {
  const { label } = req.params;
  const upperLabel = label.toUpperCase();
  
  db.all('SELECT id, label, emoji, code FROM students WHERE label = ? ORDER BY emoji', [upperLabel], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      label: upperLabel,
      count: rows.length, 
      students: rows,
      timestamp: new Date().toISOString()
    });
  });
});

// Debug endpoint to check database schema
app.get('/api/debug/schema', (_req, res) => {
  db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='students'", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ 
      schema: rows,
      timestamp: new Date().toISOString()
    });
  });
});

// Get all students
app.get('/api/students', (_req, res) => {
  db.all('SELECT * FROM students ORDER BY createdAt DESC', (err, rows: StudentRow[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (Array.isArray(rows)) {
      res.json(rows.map((row) => ({
        ...row,
        classes: JSON.parse(row.classes),
      })));
    } else {
      res.json([]);
    }
  });
});

// Add new student
app.post('/api/students', (req, res) => {
  const { label, code, emoji, classes } = req.body;

  if (!label || !code || !emoji || !classes) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Check for code conflicts first
  db.get('SELECT * FROM students WHERE code = ?', [code], (err, existingStudent: StudentRow | undefined) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (existingStudent) {
      res.status(400).json({ error: `A student with code "${code}" already exists` });
      return;
    }

    // Check for label+emoji conflicts
    db.get('SELECT * FROM students WHERE label = ? AND emoji = ?', [label.toUpperCase(), emoji], (err, labelEmojiConflict: StudentRow | undefined) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (labelEmojiConflict) {
        res.status(400).json({ error: `A student with label "${label}" and emoji "${emoji}" already exists` });
        return;
      }

      // All validations passed, proceed with insert
      const student = {
        id: uuidv4(),
        label: label.toUpperCase(),
        code,
        emoji,
        classes: JSON.stringify(classes),
        createdAt: new Date().toISOString(),
      };

      db.run(
        'INSERT INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [student.id, student.label, student.code, student.emoji, student.classes, student.createdAt],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ ...student, classes: JSON.parse(student.classes) });
        },
      );
    });
  });
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { label, code, emoji, classes } = req.body;

  // First, check if the student exists
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, existingStudent: StudentRow | undefined) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!existingStudent) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

            // Check for code conflicts with other students (only code needs to be unique)
        console.log(`🔍 Checking for code conflicts: code="${code}", currentCode="${existingStudent.code}"`);
        
        db.get(
          'SELECT * FROM students WHERE code = ? AND code != ?',
          [code, existingStudent.code],
          (err, codeConflictStudent: StudentRow | undefined) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            if (codeConflictStudent) {
              console.log(`❌ Code conflict found: existing student with code="${codeConflictStudent.code}", label="${codeConflictStudent.label}"`);
              res.status(400).json({ 
                error: `A student with code "${code}" already exists` 
              });
              return;
            }
            console.log(`✅ No code conflicts found for code="${code}"`);

            // Check for label+emoji conflicts with other students
            console.log(`🔍 Checking for label+emoji conflicts: label="${label}", emoji="${emoji}"`);
            
            db.get(
              'SELECT * FROM students WHERE label = ? AND emoji = ? AND code != ?',
              [label.toUpperCase(), emoji, existingStudent.code],
              (err, labelEmojiConflict: StudentRow | undefined) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                if (labelEmojiConflict) {
                  console.log(`❌ Label+emoji conflict found: existing student with code="${labelEmojiConflict.code}", label="${labelEmojiConflict.label}", emoji="${labelEmojiConflict.emoji}"`);
                  res.status(400).json({ 
                    error: `A student with label "${label}" and emoji "${emoji}" already exists` 
                  });
                  return;
                }
                console.log(`✅ No label+emoji conflicts found for label="${label}" and emoji="${emoji}"`);

                // All validations passed, proceed with update
                db.run(
                  'UPDATE students SET id = ?, label = ?, emoji = ?, classes = ? WHERE code = ?',
                  [id, label.toUpperCase(), emoji, JSON.stringify(classes), existingStudent.code],
                  function(err) {
                    if (err) {
                      res.status(500).json({ error: err.message });
                      return;
                    }
                    if (this.changes === 0) {
                      res.status(404).json({ error: 'Student not found' });
                      return;
                    }
                    res.json({ message: 'Student updated successfully' });
                  },
                );
              }
            );
          }
        );
  });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// Get all classes
app.get('/api/classes', (_req, res) => {
  db.all('SELECT * FROM classes ORDER BY createdAt DESC', (err, rows: ClassRow[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new class
app.post('/api/classes', (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Class name is required' });
    return;
  }

  const newClass = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
  };

  db.run(
    'INSERT INTO classes (id, name, createdAt) VALUES (?, ?, ?)',
    [newClass.id, newClass.name, newClass.createdAt],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(newClass);
    },
  );
});

// Update class
app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Class name is required' });
    return;
  }

  db.run(
    'UPDATE classes SET name = ? WHERE id = ?',
    [name, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Class not found' });
        return;
      }
      res.json({ message: 'Class updated successfully' });
    },
  );
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  const { startDate, endDate, className, studentLabel } = req.query;

  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params: string[] = [];

  if (startDate) {
    query += ' AND timestamp >= ?';
    params.push(startDate as string);
  }

  if (endDate) {
    query += ' AND timestamp <= ?';
    params.push(endDate as string);
  }

  if (className) {
    query += ' AND className = ?';
    params.push(className as string);
  }

  if (studentLabel) {
    query += ' AND studentLabel = ?';
    params.push(studentLabel as string);
  }

  query += ' ORDER BY timestamp DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new transaction
app.post('/api/transactions', (req, res) => {
  const { studentLabel, studentCode, status, className, eventType } = req.body;

  if (!studentLabel || !status || !className) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const transaction = {
    studentLabel,
    studentCode,
    status,
    timestamp: new Date().toISOString(),
    className,
    eventType,
  };

  db.run(
    'INSERT INTO transactions (studentLabel, studentCode, status, timestamp, className, eventType) VALUES (?, ?, ?, ?, ?, ?)',
    [transaction.studentLabel, transaction.studentCode, transaction.status, transaction.timestamp, transaction.className, transaction.eventType],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ ...transaction, id: this.lastID });
    },
  );
});

// Generate PDF report
app.post('/api/reports', (req, res) => {
  const { type, startDate, endDate, className, data } = req.body;

  if (!type || !startDate || !endDate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Use data from frontend IndexedDB instead of SQLite
  const { transactions = [] } = data ?? {};

  // Filter transactions by date range and class
  let filteredTransactions = transactions.filter((t: TransactionRow) => {
    const transactionDate = new Date(t.timestamp);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const inDateRange = transactionDate >= start && transactionDate <= end;
    const inClass = !className || t.className === className;
    return inDateRange && inClass;
  });

  // Filter by type
  if (type === 'teacher') {
    filteredTransactions = filteredTransactions.filter((t: TransactionRow) => t.eventType);
  }

  // Sort by timestamp
  filteredTransactions.sort((a: TransactionRow, b: TransactionRow) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Generate PDF
  const doc = new PDFDocument();
  const filename = `report_${type}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Get style settings for logo
  let logoImage: string | null = null;
  db.get('SELECT logoImage FROM styleSettings WHERE id = ?', ['default'], (err, row) => {
    if (!err && row) {
      const styleRow = row as StyleSettingsRow;
      logoImage = styleRow.logoImage;
    }
  });

  // PDF content with logo
  if (logoImage) {
    try {
      // Add logo to top-left (base64 image)
      doc.image(logoImage, 50, 50, { width: 60, height: 60 });
      doc.moveDown(4); // Space after logo
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }

  doc.fontSize(20).text(`ScholarTrack ${type === 'student' ? 'Student Transaction' : 'Teacher Event'} Report`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${moment(startDate).format('MMM DD, YYYY')} - ${moment(endDate).format('MMM DD, YYYY')}`);
  if (className) {
    doc.text(`Class: ${className}`);
  }
  doc.moveDown();

  if (filteredTransactions.length === 0) {
    doc.text('No data found for the selected period.');
  } else {
    filteredTransactions.forEach((row: TransactionRow, index: number) => {
      // Use the stored studentIdentifier directly
      const studentIdentifier = row.studentIdentifier || row.studentLabel;

      if (type === 'teacher') {
        // For teacher events, show event type prominently
        const memoInfo = row.memo ? ` (Memo: ${row.memo})` : '';
        doc.fontSize(10).text(`${index + 1}. ${studentIdentifier}: ${row.eventType}${memoInfo}`, { continued: false });
      } else {
        // For student transactions, show status
        const memoInfo = row.memo ? ` (Memo: ${row.memo})` : '';
        doc.fontSize(10).text(`${index + 1}. ${studentIdentifier} - ${row.status}${memoInfo}`, { continued: false });
      }
      doc.fontSize(8).text(`   ${moment(row.timestamp).format('MMM DD, YYYY HH:mm:ss')}`);
      doc.moveDown(0.5);
    });
  }

  doc.end();
});

// Enhanced sync endpoints for Up Sync and Down Sync

// Up Sync: Upload local changes to server
app.post('/api/sync/up', (req, res) => {
  const { students, classes, transactions, styleSettings, customStatusTypes, customTeacherEventTypes }: {
    students: StudentData[]
    classes: ClassData[]
    transactions: TransactionData[]
    styleSettings?: StyleSettingsData
    customStatusTypes?: CustomStatusTypeData[]
    customTeacherEventTypes?: CustomTeacherEventTypeData[]
  } = req.body;

  if (!students || !classes || !transactions) {
    res.status(400).json({ error: 'Missing required data for up sync' });
    return;
  }

  console.log(`🔼 Up Sync: Received ${students.length} students, ${classes.length} classes, ${transactions.length} transactions`);
  
  // Debug: Log all student data being synced
  students.forEach((student, index) => {
    console.log(`📚 Student ${index + 1}: id="${student.id}", label="${student.label}", emoji="${student.emoji}", code="${student.code}"`);
  });

  // Clear existing data and sync from client (same as current sync)
  db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error clearing students:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM classes', (err) => {
      if (err) {
        console.error('Error clearing classes:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM transactions', (err) => {
      if (err) {
        console.error('Error clearing transactions:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    // Clear custom types
    db.run('DELETE FROM customStatusTypes', (err) => {
      if (err) {
        console.error('Error clearing custom status types:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM customTeacherEventTypes', (err) => {
      if (err) {
        console.error('Error clearing custom teacher event types:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    // Insert or replace students (upsert)
    const studentStmt = db.prepare('INSERT OR REPLACE INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    students.forEach((student) => {
      const classesJson = JSON.stringify(student.classes);
      console.log(`💾 Syncing student: id="${student.id}", label="${student.label}", emoji="${student.emoji}", code="${student.code}"`);
      studentStmt.run([student.id, student.label, student.code, student.emoji, classesJson, student.createdAt]);
    });
    studentStmt.finalize();

    // Insert or replace classes (upsert)
    const classStmt = db.prepare('INSERT OR REPLACE INTO classes (id, name, createdAt) VALUES (?, ?, ?)');
    classes.forEach((cls) => {
      classStmt.run([cls.id, cls.name, cls.createdAt]);
    });
    classStmt.finalize();

    // Insert or replace transactions (upsert)
    const transactionStmt = db.prepare('INSERT OR REPLACE INTO transactions (id, studentLabel, studentCode, studentIdentifier, status, timestamp, className, eventType, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    transactions.forEach((transaction) => {
      // Handle legacy transactions that don't have studentIdentifier
      const studentIdentifier = transaction.studentIdentifier || transaction.studentLabel;
      transactionStmt.run([transaction.id, transaction.studentLabel, transaction.studentCode || null, studentIdentifier, transaction.status, transaction.timestamp, transaction.className, transaction.eventType, transaction.memo || null]);
    });
    transactionStmt.finalize((err) => {
      if (err) {
        console.error('Error during up sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Insert or replace style settings if provided
      if (styleSettings) {
        const styleStmt = db.prepare('INSERT OR REPLACE INTO styleSettings (id, primaryColor, secondaryColor, tertiaryColor, quaternaryColor, schoolName, logoImage, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        styleStmt.run([
          styleSettings.id,
          styleSettings.primaryColor,
          styleSettings.secondaryColor,
          styleSettings.tertiaryColor ?? '#000000',
          styleSettings.quaternaryColor ?? '#121212',
          styleSettings.schoolName ?? 'ScholarTrack',
          styleSettings.logoImage,
          styleSettings.updatedAt,
        ]);
        styleStmt.finalize();
      }

      // Insert custom status types if provided
      if (customStatusTypes && customStatusTypes.length > 0) {
        const statusStmt = db.prepare('INSERT INTO customStatusTypes (id, name, color, createdAt) VALUES (?, ?, ?, ?)');
        customStatusTypes.forEach((statusType) => {
          statusStmt.run([statusType.id, statusType.name, statusType.color, statusType.createdAt]);
        });
        statusStmt.finalize();
      }

      // Insert custom teacher event types if provided
      if (customTeacherEventTypes && customTeacherEventTypes.length > 0) {
        const eventStmt = db.prepare('INSERT INTO customTeacherEventTypes (id, name, createdAt) VALUES (?, ?, ?)');
        customTeacherEventTypes.forEach((eventType) => {
          eventStmt.run([eventType.id, eventType.name, eventType.createdAt]);
        });
        eventStmt.finalize();
      }

      const styleSettingsCount = styleSettings ? 1 : 0;
      const customStatusCount = customStatusTypes ? customStatusTypes.length : 0;
      const customEventCount = customTeacherEventTypes ? customTeacherEventTypes.length : 0;
      console.log(`✅ Up Sync completed: ${students.length} students, ${classes.length} classes, ${transactions.length} transactions, style settings: ${styleSettingsCount}, custom status types: ${customStatusCount}, custom event types: ${customEventCount}`);
      res.json({
        message: 'Up sync completed successfully',
        timestamp: new Date().toISOString(),
        synced: {
          students: students.length,
          classes: classes.length,
          transactions: transactions.length,
          styleSettings: styleSettingsCount,
        },
      });
    });
  });
});

// Down Sync: Download server data to local
app.get('/api/sync/down', (_req, res) => {
  console.log('🔽 Down Sync: Sending server data to client');

  // Check if database is ready
  if (!db) {
    console.error('❌ Database not initialized');
    res.status(500).json({ error: 'Database not initialized' });
    return;
  }

  db.serialize(() => {
    db.all('SELECT * FROM students', (err, students: StudentRow[]) => {
      if (err) {
        console.error('Error fetching students for down sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      db.all('SELECT * FROM classes', (err, classes: ClassRow[]) => {
        if (err) {
          console.error('Error fetching classes for down sync:', err);
          res.status(500).json({ error: err.message });
          return;
        }

        db.all('SELECT * FROM transactions', (err, transactions: TransactionRow[]) => {
          if (err) {
            console.error('Error fetching transactions for down sync:', err);
            res.status(500).json({ error: err.message });
            return;
          }

          db.all('SELECT * FROM customStatusTypes', (err, customStatusTypes: CustomStatusTypeData[]) => {
            if (err) {
              console.error('Error fetching custom status types for down sync:', err);
              customStatusTypes = [];
            }

            db.all('SELECT * FROM customTeacherEventTypes', (err, customTeacherEventTypes: CustomTeacherEventTypeData[]) => {
              if (err) {
                console.error('Error fetching custom teacher event types for down sync:', err);
                customTeacherEventTypes = [];
              }

              db.get('SELECT * FROM styleSettings WHERE id = ?', ['default'], (err, styleSettings: StyleSettingsRow | undefined) => {
                if (err) {
                  console.error('Error fetching style settings for down sync:', err);
                  // Don't fail the entire sync if style settings fail, just return undefined
                  styleSettings = undefined;
                }

                // Ensure style settings has all required fields with defaults
                const completeStyleSettings = styleSettings && typeof styleSettings === 'object' && 'id' in styleSettings ? {
                  id: (styleSettings as StyleSettingsRow).id || 'default',
                  primaryColor: (styleSettings as StyleSettingsRow).primaryColor || '#1976D2',
                  secondaryColor: (styleSettings as StyleSettingsRow).secondaryColor || '#424242',
                  tertiaryColor: (styleSettings as StyleSettingsRow).tertiaryColor || '#000000',
                  quaternaryColor: (styleSettings as StyleSettingsRow).quaternaryColor || '#121212',
                  schoolName: (styleSettings as StyleSettingsRow).schoolName || 'ScholarTrack',
                  logoImage: (styleSettings as StyleSettingsRow).logoImage || '',
                  updatedAt: (styleSettings as StyleSettingsRow).updatedAt || new Date().toISOString(),
                } : null;

                // Parse classes JSON for students
                if (Array.isArray(students)) {
                  const studentRows = students.filter((student): student is { id: string; label: string; code: string; emoji: string; classes: string; createdAt: string } =>
                    typeof student === 'object' &&
                    student !== null &&
                    'id' in student &&
                    'label' in student &&
                    'code' in student &&
                    'emoji' in student &&
                    'classes' in student &&
                    'createdAt' in student,
                  );
                  const parsedStudents = studentRows.map((student) => ({
                    ...student,
                    classes: JSON.parse(student.classes),
                  }));

                  console.log(`✅ Down Sync completed: ${parsedStudents.length} students, ${classes.length} classes, ${transactions.length} transactions, style settings: ${completeStyleSettings ? 1 : 0}, custom status types: ${customStatusTypes.length}, custom event types: ${customTeacherEventTypes.length}`);

                  res.json({
                    message: 'Down sync completed successfully',
                    timestamp: new Date().toISOString(),
                    data: {
                      students: parsedStudents,
                      classes,
                      transactions,
                      styleSettings: completeStyleSettings,
                      customStatusTypes,
                      customTeacherEventTypes,
                    },
                  });
                } else {
                  res.json({
                    message: 'Down sync completed successfully',
                    timestamp: new Date().toISOString(),
                    data: {
                      students: [],
                      classes,
                      transactions,
                      styleSettings: completeStyleSettings,
                      customStatusTypes,
                      customTeacherEventTypes,
                    },
                  });
                }
              });
            });
          });
        });
      });
    });
  });
});

// Full Sync: Bidirectional sync (Up + Down)
app.post('/api/sync/full', (req, res) => {
  const { students, classes, transactions, customStatusTypes, customTeacherEventTypes }: {
    students: StudentData[]
    classes: ClassData[]
    transactions: TransactionData[]
    customStatusTypes?: CustomStatusTypeData[]
    customTeacherEventTypes?: CustomTeacherEventTypeData[]
  } = req.body;

  if (!students || !classes || !transactions) {
    res.status(400).json({ error: 'Missing required data for full sync' });
    return;
  }

  console.log('🔄 Full Sync: Starting bidirectional synchronization');

  // First, perform up sync
  db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error clearing students during full sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM classes', (err) => {
      if (err) {
        console.error('Error clearing classes during full sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM transactions', (err) => {
      if (err) {
        console.error('Error clearing transactions during full sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    // Clear custom types
    db.run('DELETE FROM customStatusTypes', (err) => {
      if (err) {
        console.error('Error clearing custom status types during full sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM customTeacherEventTypes', (err) => {
      if (err) {
        console.error('Error clearing custom teacher event types during full sync:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    // Insert or replace students (upsert)
    const studentStmt = db.prepare('INSERT OR REPLACE INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    students.forEach((student: StudentData) => {
      const classesJson = JSON.stringify(student.classes);
      studentStmt.run([student.id, student.label, student.code, student.emoji, classesJson, student.createdAt]);
    });
    studentStmt.finalize();

    // Insert or replace classes (upsert)
    const classStmt = db.prepare('INSERT OR REPLACE INTO classes (id, name, createdAt) VALUES (?, ?, ?)');
    classes.forEach((cls: ClassData) => {
      classStmt.run([cls.id, cls.name, cls.createdAt]);
    });
    classStmt.finalize();

    // Insert or replace transactions (upsert)
    const transactionStmt = db.prepare('INSERT OR REPLACE INTO transactions (id, studentLabel, studentCode, studentIdentifier, status, timestamp, className, eventType, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    transactions.forEach((transaction: TransactionData) => {
      const studentCode = transaction.studentCode || null;
      const studentIdentifier = transaction.studentIdentifier || transaction.studentLabel;
      transactionStmt.run([transaction.id, transaction.studentLabel, studentCode, studentIdentifier, transaction.status, transaction.timestamp, transaction.className, transaction.eventType, transaction.memo || null]);
    });
    transactionStmt.finalize((err) => {
      if (err) {
        console.error('Error during full sync up phase:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Insert or replace custom status types if provided
      if (customStatusTypes && customStatusTypes.length > 0) {
        const statusStmt = db.prepare('INSERT OR REPLACE INTO customStatusTypes (id, name, color, createdAt) VALUES (?, ?, ?, ?)');
        customStatusTypes.forEach((statusType) => {
          statusStmt.run([statusType.id, statusType.name, statusType.color, statusType.createdAt]);
        });
        statusStmt.finalize();
      }

      // Insert or replace custom teacher event types if provided
      if (customTeacherEventTypes && customTeacherEventTypes.length > 0) {
        const eventStmt = db.prepare('INSERT OR REPLACE INTO customTeacherEventTypes (id, name, createdAt) VALUES (?, ?, ?)');
        customTeacherEventTypes.forEach((eventType) => {
          eventStmt.run([eventType.id, eventType.name, eventType.createdAt]);
        });
        eventStmt.finalize();
      }

      console.log('✅ Full Sync up phase completed');

      // Then, return the complete server state (down sync)
      db.all('SELECT * FROM students', (err, serverStudents: StudentRow[]) => {
        if (err) {
          console.error('Error fetching students for full sync down phase:', err);
          res.status(500).json({ error: err.message });
          return;
        }

        db.all('SELECT * FROM classes', (err, serverClasses: ClassRow[]) => {
          if (err) {
            console.error('Error fetching classes for full sync down phase:', err);
            res.status(500).json({ error: err.message });
            return;
          }

          db.all('SELECT * FROM transactions', (err, serverTransactions: TransactionRow[]) => {
            if (err) {
              console.error('Error fetching transactions for full sync down phase:', err);
              res.status(500).json({ error: err.message });
              return;
            }

            db.all('SELECT * FROM customStatusTypes', (err, serverCustomStatusTypes: CustomStatusTypeData[]) => {
              if (err) {
                console.error('Error fetching custom status types for full sync down phase:', err);
                res.status(500).json({ error: err.message });
                return;
              }

              db.all('SELECT * FROM customTeacherEventTypes', (err, serverCustomEventTypes: CustomTeacherEventTypeData[]) => {
                if (err) {
                  console.error('Error fetching custom teacher event types for full sync down phase:', err);
                  res.status(500).json({ error: err.message });
                  return;
                }

                // Parse classes JSON for students
                if (Array.isArray(serverStudents)) {
                  const studentRows = serverStudents.filter((student): student is { id: string; label: string; code: string; emoji: string; classes: string; createdAt: string } =>
                    typeof student === 'object' &&
                    student !== null &&
                    'id' in student &&
                    'label' in student &&
                    'code' in student &&
                    'emoji' in student &&
                    'classes' in student &&
                    'createdAt' in student,
                  );
                  const parsedStudents = studentRows.map((student) => ({
                    ...student,
                    classes: JSON.parse(student.classes),
                  }));

                  console.log(`✅ Full Sync completed: ${parsedStudents.length} students, ${serverClasses.length} classes, ${serverTransactions.length} transactions, ${serverCustomStatusTypes.length} custom status types, ${serverCustomEventTypes.length} custom event types`);

                  res.json({
                    message: 'Full sync completed successfully',
                    timestamp: new Date().toISOString(),
                    synced: {
                      students: parsedStudents.length,
                      classes: serverClasses.length,
                      transactions: serverTransactions.length,
                      customStatusTypes: serverCustomStatusTypes.length,
                      customTeacherEventTypes: serverCustomEventTypes.length,
                    },
                    data: {
                      students: parsedStudents,
                      classes: serverClasses,
                      transactions: serverTransactions,
                      customStatusTypes: serverCustomStatusTypes,
                      customTeacherEventTypes: serverCustomEventTypes,
                    },
                  });
                } else {
                  res.json({
                    message: 'Full sync completed successfully',
                    timestamp: new Date().toISOString(),
                    synced: {
                      students: 0,
                      classes: serverClasses.length,
                      transactions: serverTransactions.length,
                      customStatusTypes: serverCustomStatusTypes.length,
                      customTeacherEventTypes: serverCustomEventTypes.length,
                    },
                    data: {
                      students: [],
                      classes: serverClasses,
                      transactions: serverTransactions,
                      customStatusTypes: serverCustomStatusTypes,
                      customTeacherEventTypes: serverCustomEventTypes,
                    },
                  });
                }
              });
            });
          });
        });
      });
    });
  });
});

// Health check endpoint for sync status
app.get('/api/health', (_req, res) => {
  db.get('SELECT COUNT(*) as count FROM students', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.get('SELECT COUNT(*) as count FROM classes', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get('SELECT COUNT(*) as count FROM transactions', (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: {
            students: 0,
            classes: 0,
            transactions: 0,
          },
        });
      });
    });
  });
});

// Legacy sync endpoint for backward compatibility
app.post('/api/sync', (req, res) => {
  const { students, classes, transactions }: {
    students: StudentData[]
    classes: ClassData[]
    transactions: TransactionData[]
  } = req.body;

  if (!students || !classes || !transactions) {
    res.status(400).json({ error: 'Missing required data' });
    return;
  }

  // Clear existing data and sync from client
  db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error clearing students:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM classes', (err) => {
      if (err) {
        console.error('Error clearing classes:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    db.run('DELETE FROM transactions', (err) => {
      if (err) {
        console.error('Error clearing transactions:', err);
        res.status(500).json({ error: err.message });
        return;
      }
    });

    // Insert students
    const studentStmt = db.prepare('INSERT INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
    students.forEach((student) => {
      const classesJson = JSON.stringify(student.classes);
      studentStmt.run([student.id, student.label, student.code, student.emoji, classesJson, student.createdAt]);
    });
    studentStmt.finalize();

    // Insert classes
    const classStmt = db.prepare('INSERT INTO classes (id, name, createdAt) VALUES (?, ?, ?)');
    classes.forEach((cls) => {
      classStmt.run([cls.id, cls.name, cls.createdAt]);
    });
    classStmt.finalize();

    // Insert transactions
    const transactionStmt = db.prepare('INSERT INTO transactions (id, studentLabel, studentIdentifier, status, timestamp, className, eventType, memo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    transactions.forEach((transaction) => {
      // Handle legacy transactions that don't have studentIdentifier
      const studentIdentifier = transaction.studentIdentifier || transaction.studentLabel;
      transactionStmt.run([transaction.id, transaction.studentLabel, studentIdentifier, transaction.status, transaction.timestamp, transaction.className, transaction.eventType, transaction.memo || null]);
    });
    transactionStmt.finalize((err) => {
      if (err) {
        console.error('Error syncing data:', err);
        res.status(500).json({ error: err.message });
        return;
      }

      console.log(`Synced ${students.length} students, ${classes.length} classes, ${transactions.length} transactions`);
      res.json({
        message: 'Sync completed',
        timestamp: new Date().toISOString(),
        synced: {
          students: students.length,
          classes: classes.length,
          transactions: transactions.length,
        },
      });
    });
  });
});

// Get all data for initial load
app.get('/api/data', (_req, res) => {
  db.serialize(() => {
    db.all('SELECT * FROM students', (err, students) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.all('SELECT * FROM classes', (err, classes) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        db.all('SELECT * FROM transactions', (err, transactions) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          db.all('SELECT * FROM customStatusTypes', (err, customStatusTypes) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            db.all('SELECT * FROM customTeacherEventTypes', (err, customTeacherEventTypes) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }

              // Parse classes JSON for students
              if (Array.isArray(students)) {
                const studentRows = students.filter((student): student is { id: string; label: string; code: string; emoji: string; classes: string; createdAt: string } =>
                  typeof student === 'object' &&
                  student !== null &&
                  'id' in student &&
                  'label' in student &&
                  'code' in student &&
                  'emoji' in student &&
                  'classes' in student &&
                  'createdAt' in student,
                );
                const parsedStudents = studentRows.map((student) => ({
                  ...student,
                  classes: JSON.parse(student.classes),
                }));

                res.json({
                  students: parsedStudents,
                  classes,
                  transactions,
                  customStatusTypes,
                  customTeacherEventTypes,
                });
              } else {
                res.json({
                  students: [],
                  classes,
                  transactions,
                  customStatusTypes,
                  customTeacherEventTypes,
                });
              }
            });
          });
        });
      });
    });
  });
});

// Custom Status Types endpoints
app.get('/api/custom-status-types', (_req, res) => {
  db.all('SELECT * FROM customStatusTypes ORDER BY createdAt', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/custom-status-types', (req, res) => {
  const { id, name, color, includeMemo } = req.body;

  if (!id || !name || !color) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    'INSERT INTO customStatusTypes (id, name, color, includeMemo, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, name, color, includeMemo ? 1 : 0, new Date().toISOString()],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, color, includeMemo: includeMemo || false, createdAt: new Date().toISOString() });
    },
  );
});

app.put('/api/custom-status-types/:id', (req, res) => {
  const { id } = req.params;
  const { name, color, includeMemo } = req.body;

  if (!name || !color) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    'UPDATE customStatusTypes SET name = ?, color = ?, includeMemo = ? WHERE id = ?',
    [name, color, includeMemo ? 1 : 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Status type not found' });
        return;
      }
      res.json({ id, name, color, includeMemo: includeMemo || false });
    },
  );
});

app.delete('/api/custom-status-types/:id', (req, res) => {
  const { id } = req.params;

  // First, get the status type to check if it had memo enabled
  db.get('SELECT name, includeMemo FROM customStatusTypes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Status type not found' });
      return;
    }

    const statusType = row as { name: string; includeMemo: number };

    // Delete the status type
    db.run('DELETE FROM customStatusTypes WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // If the status type had memo enabled, clean up memo data from transactions
      if (statusType.includeMemo) {
        db.run('UPDATE transactions SET memo = NULL WHERE status = ? AND memo IS NOT NULL', [statusType.name], (cleanupErr) => {
          if (cleanupErr) {
            console.error('Error cleaning up memo data:', cleanupErr);
          } else {
            console.log(`Cleaned up memo data for deleted status type: ${statusType.name}`);
          }
        });
      }

      res.json({ message: 'Status type deleted successfully' });
    });
  });
});

// Custom Teacher Event Types endpoints
app.get('/api/custom-teacher-event-types', (_req, res) => {
  db.all('SELECT * FROM customTeacherEventTypes ORDER BY createdAt', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/custom-teacher-event-types', (req, res) => {
  const { id, name, includeMemo } = req.body;

  if (!id || !name) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    'INSERT INTO customTeacherEventTypes (id, name, includeMemo, createdAt) VALUES (?, ?, ?, ?)',
    [id, name, includeMemo ? 1 : 0, new Date().toISOString()],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, includeMemo: includeMemo || false, createdAt: new Date().toISOString() });
    },
  );
});

app.put('/api/custom-teacher-event-types/:id', (req, res) => {
  const { id } = req.params;
  const { name, includeMemo } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    'UPDATE customTeacherEventTypes SET name = ?, includeMemo = ? WHERE id = ?',
    [name, includeMemo ? 1 : 0, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Event type not found' });
        return;
      }
      res.json({ id, name, includeMemo: includeMemo || false });
    },
  );
});

app.delete('/api/custom-teacher-event-types/:id', (req, res) => {
  const { id } = req.params;

  // First, get the event type to check if it had memo enabled
  db.get('SELECT name, includeMemo FROM customTeacherEventTypes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Event type not found' });
      return;
    }

    const eventType = row as { name: string; includeMemo: number };

    // Delete the event type
    db.run('DELETE FROM customTeacherEventTypes WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // If the event type had memo enabled, clean up memo data from transactions
      if (eventType.includeMemo) {
        db.run('UPDATE transactions SET memo = NULL WHERE eventType = ? AND memo IS NOT NULL', [eventType.name], (cleanupErr) => {
          if (cleanupErr) {
            console.error('Error cleaning up memo data:', cleanupErr);
          } else {
            console.log(`Cleaned up memo data for deleted event type: ${eventType.name}`);
          }
        });
      }

      res.json({ message: 'Event type deleted successfully' });
    });
  });
});

// Serve static files in production
if (process.env['NODE_ENV'] === 'production') {
  // Add CSP headers for PWA
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; manifest-src 'self'",
    );
    next();
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Explicitly serve icons with cache headers and proper MIME types
  app.use('/icons', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    if (req.path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    next();
  }, express.static(path.join(__dirname, '../../client/dist/icons')));

  // Serve static files (CSS, JS, images, fonts) - this is CRITICAL for Vuetify icons
  app.use(express.static(path.join(__dirname, '../../client/dist'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.webmanifest')) {
        res.setHeader('Content-Type', 'application/manifest+json');
      }
    },
  }));

  // SPA fallback - must be last
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    initDatabase();
    await validatePWAIcons();

    app.listen(PORT, () => {
      console.log(`ScholarTrack server running on port ${PORT}`);
      console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

void startServer();
