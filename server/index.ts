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
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        className TEXT NOT NULL,
        eventType TEXT,
        FOREIGN KEY (studentLabel) REFERENCES students (label)
      )
    `)
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
  const { type, startDate, endDate, className } = req.body
  
  if (!type || !startDate || !endDate) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  let query = 'SELECT * FROM transactions WHERE timestamp BETWEEN ? AND ?'
  const params = [startDate, endDate]

  if (className) {
    query += ' AND className = ?'
    params.push(className)
  }

  if (type === 'teacher') {
    query += ' AND eventType IS NOT NULL'
  }

  query += ' ORDER BY timestamp DESC'

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }

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
    
    if (rows.length === 0) {
      doc.text('No data found for the selected period.')
    } else {
      rows.forEach((row: any, index) => {
        doc.fontSize(10).text(`${index + 1}. ${row.studentLabel} - ${row.status}`, { continued: true })
        if (row.eventType) {
          doc.text(` (${row.eventType})`, { continued: false })
        }
        doc.fontSize(8).text(`   ${moment(row.timestamp).format('MMM DD, YYYY HH:mm:ss')}`)
        doc.moveDown(0.5)
      })
    }
    
    doc.end()
  })
})

// Sync endpoint for local-first architecture
app.post('/api/sync', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { students: _students, classes: _classes, transactions: _transactions } = req.body
  
  // This would handle bidirectional sync between client and server
  // For now, just acknowledge the sync request
  res.json({ 
    message: 'Sync completed',
    timestamp: new Date().toISOString()
  })
})

// Serve static files in production
if (process.env['NODE_ENV'] === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

// Initialize database and start server
initDatabase()

app.listen(PORT, () => {
  console.log(`ScholarTrack server running on port ${PORT}`)
  console.log(`Environment: ${process.env['NODE_ENV'] || 'development'}`)
})
