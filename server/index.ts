import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import path from 'path'
import { Database } from 'sqlite3'
import { v4 as uuidv4 } from 'uuid'
import PDFDocument from 'pdfkit'
import moment from 'moment'

const app = express()
const PORT = process.env['PORT'] || 5000

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan('combined'))
app.use(cors())
app.use(express.json())

// Database setup
const db = new Database('scholartrack.db')

// Initialize database tables
const initDatabase = (): void => {
  db.serialize(() => {
    // Students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        label TEXT UNIQUE NOT NULL,
        code TEXT UNIQUE NOT NULL,
        emoji TEXT NOT NULL,
        classes TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `)

    // Classes table
    db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL
      )
    `)

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentLabel TEXT NOT NULL,
        studentIdentifier TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        className TEXT NOT NULL,
        eventType TEXT,
        FOREIGN KEY (studentLabel) REFERENCES students (label)
      )
    `)

    // Migration: Add studentIdentifier column if it doesn't exist
    db.run(`
      ALTER TABLE transactions ADD COLUMN studentIdentifier TEXT
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding studentIdentifier column:', err)
      }
    })
  })
}

// API Routes

// Get all students
app.get('/api/students', (_req, res) => {
  db.all('SELECT * FROM students ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows.map((row: any) => ({
      ...row,
      classes: JSON.parse(row.classes as string)
    })))
  })
})

// Add new student
app.post('/api/students', (req, res) => {
  const { label, code, emoji, classes } = req.body
  
  if (!label || !code || !emoji || !classes) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const student = {
    id: uuidv4(),
    label: label.toUpperCase(),
    code,
    emoji,
    classes: JSON.stringify(classes),
    createdAt: new Date().toISOString()
  }

  db.run(
    'INSERT INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [student.id, student.label, student.code, student.emoji, student.classes, student.createdAt],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ ...student, classes: JSON.parse(student.classes) })
    }
  )
})

// Update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params
  const { label, code, emoji, classes } = req.body

  db.run(
    'UPDATE students SET label = ?, code = ?, emoji = ?, classes = ? WHERE id = ?',
    [label.toUpperCase(), code, emoji, JSON.stringify(classes), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Student not found' })
        return
      }
      res.json({ message: 'Student updated successfully' })
    }
  )
})

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params

  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' })
      return
    }
    res.json({ message: 'Student deleted successfully' })
  })
})

// Get all classes
app.get('/api/classes', (_req, res) => {
  db.all('SELECT * FROM classes ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Add new class
app.post('/api/classes', (req, res) => {
  const { name } = req.body
  
  if (!name) {
    res.status(400).json({ error: 'Class name is required' })
    return
  }

  const newClass = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString()
  }

  db.run(
    'INSERT INTO classes (id, name, createdAt) VALUES (?, ?, ?)',
    [newClass.id, newClass.name, newClass.createdAt],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(newClass)
    }
  )
})

// Get all transactions
app.get('/api/transactions', (req, res) => {
  const { startDate, endDate, className, studentLabel } = req.query
  
  let query = 'SELECT * FROM transactions WHERE 1=1'
  const params: string[] = []

  if (startDate) {
    query += ' AND timestamp >= ?'
    params.push(startDate as string)
  }
  
  if (endDate) {
    query += ' AND timestamp <= ?'
    params.push(endDate as string)
  }
  
  if (className) {
    query += ' AND className = ?'
    params.push(className as string)
  }
  
  if (studentLabel) {
    query += ' AND studentLabel = ?'
    params.push(studentLabel as string)
  }

  query += ' ORDER BY timestamp DESC'

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

// Add new transaction
app.post('/api/transactions', (req, res) => {
  const { studentLabel, status, className, eventType } = req.body
  
  if (!studentLabel || !status || !className) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const transaction = {
    studentLabel,
    status,
    timestamp: new Date().toISOString(),
    className,
    eventType
  }

  db.run(
    'INSERT INTO transactions (studentLabel, status, timestamp, className, eventType) VALUES (?, ?, ?, ?, ?)',
    [transaction.studentLabel, transaction.status, transaction.timestamp, transaction.className, transaction.eventType],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ ...transaction, id: this.lastID })
    }
  )
})

// Generate PDF report
app.post('/api/reports', (req, res) => {
  const { type, startDate, endDate, className, data } = req.body
  
  if (!type || !startDate || !endDate) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  // Use data from frontend IndexedDB instead of SQLite
  const { transactions = [] } = data || {}
  
  // Filter transactions by date range and class
  let filteredTransactions = transactions.filter((t: any) => {
    const transactionDate = new Date(t.timestamp)
    const start = new Date(startDate)
    const end = new Date(endDate)
    const inDateRange = transactionDate >= start && transactionDate <= end
    const inClass = !className || t.className === className
    return inDateRange && inClass
  })

  // Filter by type
  if (type === 'teacher') {
    filteredTransactions = filteredTransactions.filter((t: any) => t.eventType)
  }

  // Sort by timestamp
  filteredTransactions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Generate PDF
  const doc = new PDFDocument()
  const filename = `report_${type}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`
  
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  
  doc.pipe(res)
  
  // PDF content
  doc.fontSize(20).text(`ScholarTrack ${type === 'student' ? 'Student Transaction' : 'Teacher Event'} Report`, { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`Period: ${moment(startDate).format('MMM DD, YYYY')} - ${moment(endDate).format('MMM DD, YYYY')}`)
  if (className) {
    doc.text(`Class: ${className}`)
  }
  doc.moveDown()
  
      if (filteredTransactions.length === 0) {
      doc.text('No data found for the selected period.')
    } else {
      filteredTransactions.forEach((row: any, index: number) => {
        // Use the stored studentIdentifier directly
        const studentIdentifier = row.studentIdentifier || row.studentLabel
        
        if (type === 'teacher') {
          // For teacher events, show event type prominently
          doc.fontSize(10).text(`${index + 1}. ${studentIdentifier}: ${row.eventType}`, { continued: false })
        } else {
          // For student transactions, show status
          doc.fontSize(10).text(`${index + 1}. ${studentIdentifier} - ${row.status}`, { continued: false })
        }
        doc.fontSize(8).text(`   ${moment(row.timestamp).format('MMM DD, YYYY HH:mm:ss')}`)
        doc.moveDown(0.5)
      })
    }
  
  doc.end()
})

// Sync endpoint for local-first architecture
app.post('/api/sync', (req, res) => {
  const { students, classes, transactions } = req.body
  
  if (!students || !classes || !transactions) {
    res.status(400).json({ error: 'Missing required data' })
    return
  }

  // Clear existing data and sync from client
  db.serialize(() => {
    // Clear existing data
    db.run('DELETE FROM students', (err) => {
      if (err) {
        console.error('Error clearing students:', err)
        res.status(500).json({ error: err.message })
        return
      }
    })
    
    db.run('DELETE FROM classes', (err) => {
      if (err) {
        console.error('Error clearing classes:', err)
        res.status(500).json({ error: err.message })
        return
      }
    })
    
    db.run('DELETE FROM transactions', (err) => {
      if (err) {
        console.error('Error clearing transactions:', err)
        res.status(500).json({ error: err.message })
        return
      }
    })

    // Insert students
    const studentStmt = db.prepare('INSERT INTO students (id, label, code, emoji, classes, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    students.forEach((student: any) => {
      const classesJson = JSON.stringify(student.classes)
      studentStmt.run([student.id, student.label, student.code, student.emoji, classesJson, student.createdAt])
    })
    studentStmt.finalize()

    // Insert classes
    const classStmt = db.prepare('INSERT INTO classes (id, name, createdAt) VALUES (?, ?, ?)')
    classes.forEach((cls: any) => {
      classStmt.run([cls.id, cls.name, cls.createdAt])
    })
    classStmt.finalize()

    // Insert transactions
    const transactionStmt = db.prepare('INSERT INTO transactions (id, studentLabel, studentIdentifier, status, timestamp, className, eventType) VALUES (?, ?, ?, ?, ?, ?, ?)')
    transactions.forEach((transaction: any) => {
      // Handle legacy transactions that don't have studentIdentifier
      const studentIdentifier = transaction.studentIdentifier || transaction.studentLabel
      transactionStmt.run([transaction.id, transaction.studentLabel, studentIdentifier, transaction.status, transaction.timestamp, transaction.className, transaction.eventType])
    })
    transactionStmt.finalize((err) => {
      if (err) {
        console.error('Error syncing data:', err)
        res.status(500).json({ error: err.message })
        return
      }
      
      console.log(`Synced ${students.length} students, ${classes.length} classes, ${transactions.length} transactions`)
      res.json({ 
        message: 'Sync completed',
        timestamp: new Date().toISOString(),
        synced: {
          students: students.length,
          classes: classes.length,
          transactions: transactions.length
        }
      })
    })
  })
})

// Get all data for initial load
app.get('/api/data', (_req, res) => {
  db.serialize(() => {
    db.all('SELECT * FROM students', (err, students) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      
      db.all('SELECT * FROM classes', (err, classes) => {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        
        db.all('SELECT * FROM transactions', (err, transactions) => {
          if (err) {
            res.status(500).json({ error: err.message })
            return
          }
          
          // Parse classes JSON for students
          const parsedStudents = students.map((student: any) => ({
            ...student,
            classes: JSON.parse(student.classes)
          }))
          
          res.json({
            students: parsedStudents,
            classes,
            transactions
          })
        })
      })
    })
  })
})

// Serve static files in production
if (process.env['NODE_ENV'] === 'production') {
  // Add CSP headers for PWA
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; manifest-src 'self'"
    )
    next()
  })
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  // Serve static files (CSS, JS, images, fonts) - this is CRITICAL for Vuetify icons
  app.use(express.static(path.join(__dirname, '../../client/dist')))
  
  // Serve manifest with correct MIME type
  app.get('/manifest.webmanifest', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json')
    res.sendFile(path.join(__dirname, '../../client/dist/manifest.webmanifest'))
  })
  
  // SPA fallback - must be last
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
  })
}

// Initialize database and start server
initDatabase()

app.listen(PORT, () => {
  console.log(`ScholarTrack server running on port ${PORT}`)
  console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`)
})
