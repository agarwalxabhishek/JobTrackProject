const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'applications.json');

app.use(express.json());
app.use(express.static(__dirname));

function readApplications() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeApplications(applications) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2));
}

function validateApplication(body) {
  const required = ['company', 'role', 'status', 'date'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `${field} is required`;
    }
  }
  const allowed = ['Applied', 'Interview', 'Offer', 'Rejected'];
  if (!allowed.includes(body.status)) return 'Invalid status';
  return null;
}

app.get('/api/applications', (req, res) => {
  res.json(readApplications());
});

app.get('/api/applications/:id', (req, res) => {
  const application = readApplications().find(a => a.id === Number(req.params.id));
  if (!application) return res.status(404).json({ message: 'Application not found' });
  res.json(application);
});

app.post('/api/applications', (req, res) => {
  const error = validateApplication(req.body);
  if (error) return res.status(400).json({ message: error });

  const applications = readApplications();
  const application = {
    id: Date.now(),
    company: String(req.body.company).trim(),
    role: String(req.body.role).trim(),
    status: req.body.status,
    date: req.body.date,
    location: String(req.body.location || '').trim(),
    type: req.body.type || 'Full-time',
    notes: String(req.body.notes || '').trim()
  };

  applications.push(application);
  writeApplications(applications);
  res.status(201).json(application);
});

app.put('/api/applications/:id', (req, res) => {
  const error = validateApplication(req.body);
  if (error) return res.status(400).json({ message: error });

  const applications = readApplications();
  const index = applications.findIndex(a => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Application not found' });

  applications[index] = {
    ...applications[index],
    company: String(req.body.company).trim(),
    role: String(req.body.role).trim(),
    status: req.body.status,
    date: req.body.date,
    location: String(req.body.location || '').trim(),
    type: req.body.type || 'Full-time',
    notes: String(req.body.notes || '').trim()
  };

  writeApplications(applications);
  res.json(applications[index]);
});

app.delete('/api/applications/:id', (req, res) => {
  const applications = readApplications();
  const id = Number(req.params.id);
  const updated = applications.filter(a => a.id !== id);
  if (updated.length === applications.length) {
    return res.status(404).json({ message: 'Application not found' });
  }

  writeApplications(updated);
  res.json({ message: 'Application deleted successfully' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JobTrack API is running' });
});

app.listen(PORT, () => {
  console.log(`JobTrack running at http://localhost:${PORT}`);
});
